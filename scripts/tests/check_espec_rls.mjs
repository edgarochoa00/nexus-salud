import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres'
});
async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT polname, polcmd, pg_get_expr(polqual, polrelid) as qual
    FROM pg_policy 
    WHERE polrelid = 'especialidades'::regclass;
  `);
  console.log(res.rows);
  await client.end();
}
run();
