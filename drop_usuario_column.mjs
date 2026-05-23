import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

async function dropColumn() {
  try {
    await client.connect();
    
    // First let's check which tables have 'usuario' column to be absolutely sure
    const checkRes = await client.query(`
      SELECT table_name 
      FROM information_schema.columns 
      WHERE column_name = 'usuario' AND table_schema = 'public';
    `);
    
    console.log("Tables with 'usuario' column:", checkRes.rows.map(r => r.table_name));
    
    for (const row of checkRes.rows) {
      console.log("Dropping column 'usuario' from table: " + row.table_name);
      await client.query("ALTER TABLE public." + row.table_name + " DROP COLUMN usuario;");
      console.log("Column dropped successfully.");
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

dropColumn();
