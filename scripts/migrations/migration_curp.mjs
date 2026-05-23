import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const { Client } = pg;

// URL y Service Role de Supabase (las tienes en .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jtvkpbtyrsadkmbahino.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:YOUR_DB_PASSWORD@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres';
const client = new Client({ connectionString });

// Generador de CURP simulado pero de 18 caracteres
function generateCURP(index) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789';
  let curp = 'XXXX999999XXXXXX00'; // 18 chars base
  
  // Reemplazar X con letras aleatorias y 9 con numeros aleatorios
  let result = '';
  for(let i=0; i<4; i++) result += letters[Math.floor(Math.random() * letters.length)];
  for(let i=0; i<6; i++) result += nums[Math.floor(Math.random() * nums.length)];
  for(let i=0; i<6; i++) result += letters[Math.floor(Math.random() * letters.length)];
  for(let i=0; i<2; i++) result += nums[Math.floor(Math.random() * nums.length)];
  
  return result;
}

async function run() {
  try {
    await client.connect();
    console.log("Conectado a la BD para la migración.");

    // 1. Agregar columna curp a la tabla usuarios
    await client.query(`
      ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS curp VARCHAR(18) UNIQUE;
    `);
    console.log("Columna curp agregada a public.usuarios.");

    // 2. Obtener usuarios
    const res = await client.query(`SELECT id FROM public.usuarios WHERE curp IS NULL;`);
    const users = res.rows;
    
    console.log(`Asignando CURPs a ${users.length} usuarios existentes...`);

    // 3. Generar y asignar CURP para cada uno
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const curp = generateCURP(i);
      
      // Actualizar en base de datos PostgreSQL
      await client.query(`UPDATE public.usuarios SET curp = $1 WHERE id = $2`, [curp, user.id]);
      
      // Actualizar en Supabase Auth metadata
      const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.getUserById(user.id);
      if (!authErr && authUser?.user) {
        const metadata = authUser.user.user_metadata || {};
        metadata.curp = curp;
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          user_metadata: metadata
        });
      }
      
      console.log(`Usuario ${user.id} -> CURP: ${curp}`);
    }

    // 4. Actualizar trigger handle_new_user si existe
    await client.query(`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.usuarios (id, nombre, correo, rol, curp)
        VALUES (
          NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
          NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'rol', 'paciente'),
          NEW.raw_user_meta_data->>'curp'
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
    console.log("Trigger handle_new_user actualizado para soportar curp.");

    console.log("Migración completada exitosamente.");
  } catch (e) {
    console.error("Error durante la migración:", e);
  } finally {
    await client.end();
  }
}
run();
