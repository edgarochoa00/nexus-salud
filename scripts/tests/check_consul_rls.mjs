import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres'
});
async function run() {
  await client.connect();
  const res1 = await client.query(`
    SELECT polname, polcmd, pg_get_expr(polqual, polrelid) as qual
    FROM pg_policy 
    WHERE polrelid = 'consultorios'::regclass;
  `);
  console.log("Consultorios:", res1.rows);
  const res2 = await client.query(`
    SELECT polname, polcmd, pg_get_expr(polqual, polrelid) as qual
    FROM pg_policy 
    WHERE polrelid = 'sucursales'::regclass;
  `);
  console.log("Sucursales:", res2.rows);
  await client.end();
}
run();
