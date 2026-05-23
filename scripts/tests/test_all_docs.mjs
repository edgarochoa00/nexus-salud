import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres'
});
async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT u.nombre, u.apellidos, d.dia_semana, d.hora_inicio, d.hora_fin
    FROM doctor_consultorios d
    JOIN usuarios u ON d.doctor_id = u.id;
  `);
  console.log(res.rows);
  await client.end();
}
run();
