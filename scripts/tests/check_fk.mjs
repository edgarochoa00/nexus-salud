import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres'
});
async function run() {
  await client.connect();
  const res1 = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_name IN ('reembolsos', 'cancelaciones', 'citas_canceladas');
  `);
  console.log("Tables found:", res1.rows);
  
  if (res1.rows.length > 0) {
    const res2 = await client.query(`
      SELECT
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name IN ('reembolsos', 'cancelaciones');
    `);
    console.log("Foreign keys:", res2.rows);
  }
  await client.end();
}
run();
