import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres'
});
async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT data_type 
    FROM information_schema.columns 
    WHERE table_name = 'doctor_consultorios' AND column_name = 'hora_inicio';
  `);
  console.log(res.rows);
  await client.end();
}
run();
