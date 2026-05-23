import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

async function runSQL() {
  try {
    await client.connect();
    console.log("Conectado a la base de datos.");

    // 1. Activar RLS en la tabla consultas por si no lo está
    await client.query(`ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;`);
    console.log("✅ RLS activado en la tabla consultas.");

    // 2. Políticas de Seguridad (RLS) para consultas
    try {
      await client.query(`
        CREATE POLICY "lectura_global_consultas" ON public.consultas FOR SELECT 
        USING ( auth.uid() IN (SELECT id FROM public.doctores) );
      `);
      console.log("✅ Política 'lectura_global_consultas' creada.");
    } catch (e) {
      if (e.code === '42710') console.log("⚠️ La política 'lectura_global_consultas' ya existía.");
      else throw e;
    }

    try {
      await client.query(`
        CREATE POLICY "autor_modifica_consultas" ON public.consultas FOR ALL 
        USING ( cita_id IN (SELECT id FROM public.citas WHERE doctor_id = auth.uid()) );
      `);
      console.log("✅ Política 'autor_modifica_consultas' creada.");
    } catch (e) {
      if (e.code === '42710') console.log("⚠️ La política 'autor_modifica_consultas' ya existía.");
      else throw e;
    }

    // 3. Restricciones de Horarios
    try {
      await client.query(`
        ALTER TABLE public.citas 
        ADD CONSTRAINT citas_horario_habil CHECK (hora >= '07:00:00' AND hora <= '22:00:00');
      `);
      console.log("✅ Restricción de horario aplicada a 'citas'.");
    } catch (e) {
      if (e.code === '42710') console.log("⚠️ La restricción 'citas_horario_habil' ya existía.");
      else throw e;
    }

    try {
      await client.query(`
        ALTER TABLE public.doctor_consultorios 
        ADD CONSTRAINT turnos_horario_habil 
        CHECK (hora_inicio >= '07:00:00' AND hora_fin <= '22:00:00');
      `);
      console.log("✅ Restricción de horario aplicada a 'doctor_consultorios'.");
    } catch (e) {
      if (e.code === '42710') console.log("⚠️ La restricción 'turnos_horario_habil' ya existía.");
      else throw e;
    }

    console.log("¡Todos los comandos SQL se ejecutaron correctamente!");

  } catch (err) {
    console.error("❌ Error ejecutando SQL:", err);
  } finally {
    await client.end();
  }
}

runSQL();
