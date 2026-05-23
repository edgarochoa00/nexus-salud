import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres'
});
async function run() {
  await client.connect();
  
  // Set the session variable to impersonate the user
  const userId = '98754f6b-5bc1-4d27-a730-5f819933aa40';
  await client.query(`
    set local role authenticated;
    set local request.jwt.claims = '{"sub": "${userId}", "role": "authenticated"}';
  `);
  
  try {
    const res = await client.query(`
      SELECT 
        c.id, c.fecha, c.hora, c.estado,
        json_build_object(
          'usuarios', json_build_object('nombre', u.nombre, 'apellidos', u.apellidos),
          'especialidades', json_build_object('nombre', e.nombre)
        ) as doctor,
        json_build_object(
          'nombre', con.nombre,
          'sucursales', json_build_object('nombre', s.nombre)
        ) as consultorio
      FROM citas c
      LEFT JOIN doctores d ON c.doctor_id = d.id
      LEFT JOIN usuarios u ON d.id = u.id
      LEFT JOIN especialidades e ON d.especialidad_id = e.id
      LEFT JOIN consultorios con ON c.consultorio_id = con.id
      LEFT JOIN sucursales s ON con.sucursal_id = s.id
      WHERE c.paciente_id = '${userId}';
    `);
    console.log("SQL Output:", res.rows);
  } catch (err) {
    console.error("SQL Error:", err);
  }
  
  await client.end();
}
run();
