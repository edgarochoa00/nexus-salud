import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

async function checkRawFecha() {
  try {
    await client.connect();
    
    const res = await client.query(`
      SELECT id, doctor_id, fecha::text, hora::text, estado
      FROM public.citas
      ORDER BY fecha DESC;
    `);
    
    console.table(res.rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkRawFecha();
