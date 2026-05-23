import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jtvkpbtyrsadkmbahino.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY_HERE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  const doctor_id = 'e5daeb13-1a06-4441-94fc-925f4b50d2bb'; // dr godoy
  const hoy = new Date().toISOString().split("T")[0];

  const res = await supabase
    .from("citas")
    .select(`
      id, fecha, hora, estado,
      paciente:pacientes!paciente_id(usuarios(nombre, apellidos)),
      consultorio:consultorios(nombre)
    `)
    .eq("doctor_id", doctor_id)
    .gt("fecha", hoy)
    .in("estado", ["pendiente", "confirmada"])
    .order("fecha", { ascending: true })
    .order("hora", { ascending: true })
    .limit(3);

  console.log("Query Result:", JSON.stringify(res, null, 2));
}

testQuery();
