import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres'
});
async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT id, nombre, apellidos FROM usuarios WHERE rol = 'doctor' AND (nombre ILIKE '%godoy%' OR apellidos ILIKE '%godoy%');
  `);
  console.log(res.rows);
  await client.end();
}
run();
