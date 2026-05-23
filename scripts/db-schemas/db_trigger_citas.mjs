import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres'
});
async function run() {
  await client.connect();
  
  // 1. Create the function
  await client.query(`
    CREATE OR REPLACE FUNCTION validar_horario_cita()
    RETURNS trigger AS $$
    DECLARE
      dia_nombre text;
      horario_valido boolean;
    BEGIN
      -- Obtener el nombre del día en español, ignorando mayúsculas y acentos
      -- TO_CHAR(fecha, 'TMDay') devuelve el día en el idioma local (si está configurado)
      -- Alternativa segura: calcular el día desde DOW (0=domingo, 1=lunes...)
      SELECT (ARRAY['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'])[EXTRACT(DOW FROM NEW.fecha) + 1] INTO dia_nombre;

      -- Verificar si el doctor tiene un consultorio configurado en ese día y si la hora cae dentro del rango
      SELECT EXISTS (
        SELECT 1
        FROM doctor_consultorios
        WHERE doctor_id = NEW.doctor_id
          AND unaccent(LOWER(dia_semana)) = dia_nombre
          AND NEW.hora >= hora_inicio
          AND NEW.hora < hora_fin
      ) INTO horario_valido;

      IF NOT horario_valido THEN
        RAISE EXCEPTION 'El doctor no atiende en el horario seleccionado (Día: %, Hora: %).', dia_nombre, NEW.hora;
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Ensure unaccent extension is installed for the normalize
  await client.query(`CREATE EXTENSION IF NOT EXISTS unaccent;`);

  // 2. Create the trigger
  await client.query(`
    DROP TRIGGER IF EXISTS trg_validar_horario_cita ON citas;
    CREATE TRIGGER trg_validar_horario_cita
    BEFORE INSERT OR UPDATE ON citas
    FOR EACH ROW
    EXECUTE FUNCTION validar_horario_cita();
  `);

  console.log("Database trigger created successfully.");
  await client.end();
}
run();
