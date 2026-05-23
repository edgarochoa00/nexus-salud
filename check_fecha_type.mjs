import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jtvkpbtyrsadkmbahino.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY_HERE';

// I will just use the pg client to see if the column type is DATE or TIMESTAMP.
import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

async function checkColumnType() {
  try {
    await client.connect();
    
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'citas' AND column_name = 'fecha';
    `);
    
    console.log("citas.fecha type:", res.rows[0]);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkColumnType();
