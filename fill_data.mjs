import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

async function fillData() {
  try {
    await client.connect();
    
    // 1. Llenar apellidos que quedaron vacíos
    await client.query(`UPDATE public.usuarios SET apellidos = 'López' WHERE usuario = 'juande';`);
    await client.query(`UPDATE public.usuarios SET apellidos = 'Pérez' WHERE usuario = 'jorge123';`);

    // 2. Llenar teléfonos nulos con un número genérico 
    // Para que no se vea vacío en la tabla
    await client.query(`
      UPDATE public.usuarios 
      SET telefono = '555' || LPAD(FLOOR(RANDOM() * 10000000)::text, 7, '0') 
      WHERE telefono IS NULL;
    `);

    console.log("¡Datos faltantes rellenados exitosamente!");

  } catch (err) {
    console.error("❌ Error ejecutando SQL:", err);
  } finally {
    await client.end();
  }
}

fillData();
