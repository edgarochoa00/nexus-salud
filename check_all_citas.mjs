import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

async function checkCitas() {
  try {
    await client.connect();
    
    const res = await client.query(`
      SELECT id, doctor_id, paciente_id, fecha, hora, estado
      FROM public.citas
      ORDER BY fecha DESC, hora DESC;
    `);
    
    console.table(res.rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkCitas();
