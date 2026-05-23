import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres'
});
async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT id, fecha, hora, estado, paciente_id, created_at 
    FROM citas 
    ORDER BY created_at DESC;
  `);
  console.log(res.rows);
  await client.end();
}
run();
