import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres'
});
async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT hora_inicio, hora_fin FROM doctor_consultorios LIMIT 1;
  `);
  console.log(res.rows);
  await client.end();
}
run();
