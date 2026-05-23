import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jtvkpbtyrsadkmbahino.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy'; // We need the real anon key from .env

import fs from 'fs';
const envFile = fs.readFileSync('.env.local', 'utf8');
const anonKeyMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
const anonKey = anonKeyMatch ? anonKeyMatch[1] : 'dummy';

const supabase = createClient(SUPABASE_URL, anonKey);

async function run() {
  const { data, error } = await supabase
    .from("doctor_consultorios")
    .select(`
      id,
      doctores (
        id,
        especialidades (nombre),
        usuarios (nombre, apellidos)
      )
    `)
    .limit(1);
    
  console.log(JSON.stringify(data, null, 2));
  if (error) console.error(error);
}
run();
