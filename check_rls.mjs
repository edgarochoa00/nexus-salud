import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

async function checkRLS() {
  try {
    await client.connect();
    
    const res = await client.query(`
      SELECT polname, polcmd, polroles, pg_get_expr(polqual, polrelid) as polqual
      FROM pg_policy
      WHERE polrelid = 'public.citas'::regclass;
    `);
    
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkRLS();
