import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres'
});
async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';
  `);
  console.log(res.rows[0]?.prosrc);
  await client.end();
}
run();
