import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres'
});
async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT dia_semana, hora_inicio, hora_fin 
    FROM doctor_consultorios 
    WHERE doctor_id = '24f4d05a-4339-440e-94a3-c319fead146e';
  `);
  console.log("New Godoy schedules:", res.rows);
  await client.end();
}
run();
