import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

async function checkDb() {
  try {
    await client.connect();
    const res = await client.query(`SELECT * FROM public.usuarios`);
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
checkDb();
