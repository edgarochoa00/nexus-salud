import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking tables...");
  
  const tables = ['especialidades', 'usuarios', 'sucursales', 'administradores', 'secretarias', 'doctores', 'pacientes', 'consultorios', 'doctor_consultorios'];
  
  for (const table of tables) {
    const { data, error } = await supabaseAdmin.from(table).select('*').limit(1);
    if (error) {
      console.log(`❌ Table '${table}' failed:`, error.message);
    } else {
      console.log(`✅ Table '${table}' exists!`);
    }
  }
}

check();
