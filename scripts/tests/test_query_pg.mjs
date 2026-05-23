import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres'
});
async function run() {
  await client.connect();
  // Check the foreign keys for doctores
  const res = await client.query(`
    SELECT * FROM public.doctores LIMIT 1;
  `);
  console.log("doctores", res.rows);
  const res2 = await client.query(`
    SELECT * FROM public.doctor_consultorios LIMIT 1;
  `);
  console.log("doctor_consultorios", res2.rows);
  await client.end();
}
run();
