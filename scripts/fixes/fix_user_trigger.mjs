import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres'
});

async function run() {
  await client.connect();

  // 1. Make usuario nullable since we are moving away from usernames
  await client.query(`
    ALTER TABLE public.usuarios ALTER COLUMN usuario DROP NOT NULL;
  `);

  // 2. Rewrite the trigger function
  await client.query(`
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger AS $$
    DECLARE
      v_rol text;
      v_especialidad_id integer;
      v_precio_consulta numeric;
    BEGIN
      v_rol := COALESCE(NEW.raw_user_meta_data->>'rol', 'paciente');
      
      -- Insertar en la tabla principal de usuarios
      INSERT INTO public.usuarios (id, nombre, apellidos, telefono, correo, rol, curp, usuario)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
        COALESCE(NEW.raw_user_meta_data->>'apellidos', 'Sin Apellidos'),
        NEW.raw_user_meta_data->>'telefono',
        NEW.email,
        v_rol,
        NEW.raw_user_meta_data->>'curp',
        COALESCE(NEW.raw_user_meta_data->>'usuario', NEW.raw_user_meta_data->>'curp')
      );

      -- Insertar en la tabla secundaria según el rol
      IF v_rol = 'doctor' THEN
        v_especialidad_id := (NEW.raw_user_meta_data->>'especialidad_id')::integer;
        v_precio_consulta := COALESCE((NEW.raw_user_meta_data->>'precio_consulta')::numeric, 0);
        
        INSERT INTO public.doctores (id, especialidad_id, precio_consulta)
        VALUES (NEW.id, v_especialidad_id, v_precio_consulta);
        
      ELSIF v_rol = 'paciente' THEN
        INSERT INTO public.pacientes (id) VALUES (NEW.id);
        
      ELSIF v_rol = 'secretaria' THEN
        -- Insert dummy or null sucursal_id if needed, or handle if passed
        -- Assuming secretarias just need an id to link
        INSERT INTO public.secretarias (id, sucursal_id) 
        VALUES (NEW.id, (NEW.raw_user_meta_data->>'sucursal_id')::integer);
        
      ELSIF v_rol = 'admin' THEN
        INSERT INTO public.administradores (id) VALUES (NEW.id);
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);

  console.log("Trigger function handle_new_user updated successfully.");
  await client.end();
}
run();
