import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

async function checkDates() {
  try {
    await client.connect();
    
    const res = await client.query(`
      SELECT id, fecha, hora, estado, doctor_id
      FROM citas;
    `);
    
    console.log("ALL CITAS:", res.rows);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkDates();
