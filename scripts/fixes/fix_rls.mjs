import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres'
});
async function run() {
  await client.connect();
  // Allow all authenticated users to view profiles of users with rol='doctor'
  await client.query(`
    CREATE POLICY "todos_pueden_ver_doctores" ON "public"."usuarios" 
    FOR SELECT 
    USING (rol = 'doctor' OR auth.uid() = id);
  `);
  console.log("RLS policy updated for doctores.");
  await client.end();
}
run();
