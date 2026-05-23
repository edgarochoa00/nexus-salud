import { createClient } from '@supabase/supabase-js';

import fs from 'fs';
const envFile = fs.readFileSync('.env.local', 'utf8');
const SUPABASE_URL = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const SUPABASE_SERVICE_ROLE_KEY = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1];

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase
    .from("citas")
    .select(`
      id, fecha, hora, estado, paciente_id,
      doctor:doctores!doctor_id(usuarios(nombre, apellidos), especialidades(nombre)),
      consultorio:consultorios(nombre, sucursales(nombre))
    `)
    .limit(5)
    .order('id', {ascending: false});
    
  console.log(JSON.stringify(data, null, 2));
  if (error) console.error("Error:", error);
}
run();
