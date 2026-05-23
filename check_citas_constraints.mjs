import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

async function checkConstraints() {
  try {
    await client.connect();
    
    // Check for constraints on the 'citas' table
    const res = await client.query(`
      SELECT conname, pg_get_constraintdef(c.oid)
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE conrelid = 'public.citas'::regclass;
    `);
    
    console.log("Existing Constraints on 'citas':");
    res.rows.forEach(r => console.log(`- ${r.conname}: ${r.pg_get_constraintdef}`));
    
    // Just to be sure, check indices too
    const resIdx = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'citas';
    `);
    
    console.log("\nExisting Indexes on 'citas':");
    resIdx.rows.forEach(r => console.log(`- ${r.indexname}: ${r.indexdef}`));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkConstraints();
