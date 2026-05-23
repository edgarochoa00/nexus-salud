import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

async function runCleanup() {
  try {
    await client.connect();
    console.log("Conectado a la base de datos para limpieza.");

    // Eliminar la palabra "EMPTY" y reemplazarla por cadena vacía
    const res1 = await client.query(`
      UPDATE public.usuarios 
      SET apellidos = '' 
      WHERE apellidos = 'EMPTY';
    `);
    console.log(`✅ ${res1.rowCount} registros limpiados de 'EMPTY'.`);

    // Quitar el prefijo "Dr. " del nombre si lo tiene para mantenerlo limpio
    const res2 = await client.query(`
      UPDATE public.usuarios 
      SET nombre = REPLACE(nombre, 'Dr. ', '') 
      WHERE nombre LIKE 'Dr. %';
    `);
    console.log(`✅ ${res2.rowCount} registros limpiados del prefijo 'Dr. '.`);

    console.log("¡Limpieza de usuarios exitosa!");

  } catch (err) {
    console.error("❌ Error ejecutando SQL:", err);
  } finally {
    await client.end();
  }
}

runCleanup();
