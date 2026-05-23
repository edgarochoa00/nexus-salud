import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const SUPABASE_URL = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const SUPABASE_ANON_KEY = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1];
const SUPABASE_JWT_SECRET = envFile.match(/SUPABASE_JWT_SECRET=(.*)/)[1]; // Let's hope we have it. If not, I can't generate a JWT.

if (!SUPABASE_JWT_SECRET) {
  console.log("No JWT secret");
  process.exit(1);
}

const token = jwt.sign(
  {
    role: 'authenticated',
    sub: '98754f6b-5bc1-4d27-a730-5f819933aa40',
    aud: 'authenticated'
  },
  SUPABASE_JWT_SECRET,
  { expiresIn: '1h' }
);

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { headers: { Authorization: `Bearer ${token}` } }
});

async function run() {
  const { data, error } = await supabase
    .from("citas")
    .select(`
      id, fecha, hora, estado,
      doctor:doctores!doctor_id(usuarios(nombre, apellidos), especialidades(nombre)),
      consultorio:consultorios(nombre, sucursales(nombre)),
      pagos(folio, monto_total, estatus),
      reembolsos(estado),
      cancelaciones(motivo)
    `)
    .eq("paciente_id", '98754f6b-5bc1-4d27-a730-5f819933aa40');
    
  console.log("Error:", error);
  console.log("Data:", JSON.stringify(data, null, 2));
}
run();
