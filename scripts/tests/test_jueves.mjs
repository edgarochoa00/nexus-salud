import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres'
});
async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT u.id, u.nombre, u.apellidos, d.dia_semana, d.hora_inicio, d.hora_fin, c.nombre as consultorio, s.nombre as sucursal
    FROM usuarios u
    JOIN doctor_consultorios d ON u.id = d.doctor_id
    JOIN consultorios c ON d.consultorio_id = c.id
    JOIN sucursales s ON c.sucursal_id = s.id
    WHERE u.nombre ILIKE '%godoy%' OR u.apellidos ILIKE '%godoy%';
  `);
  console.log(res.rows);
  await client.end();
}
run();
