import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres'
});
async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT d.dia_semana, d.hora_inicio, d.hora_fin, c.nombre as consultorio, s.nombre as sucursal
    FROM doctor_consultorios d
    LEFT JOIN consultorios c ON d.consultorio_id = c.id
    LEFT JOIN sucursales s ON c.sucursal_id = s.id
  `);
  console.log(res.rows);
  await client.end();
}
run();
