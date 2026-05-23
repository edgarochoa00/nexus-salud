import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres'
});
async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT doctor_id, dia_semana, COUNT(*)
    FROM doctor_consultorios
    GROUP BY doctor_id, dia_semana
    HAVING COUNT(*) > 1;
  `);
  console.log("Duplicates:", res.rows);
  await client.end();
}
run();
