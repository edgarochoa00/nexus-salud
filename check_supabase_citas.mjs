import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jtvkpbtyrsadkmbahino.supabase.co';
const supabaseKey = 'sb_publishable_GT2w-k3RbL2RFZyJvdqv7Q_LWi7DT4Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
  const doctor_id = '0c8ce093-df31-4337-9849-f9e7a6ddb6b0';
  const fechaStr = '2026-05-26';
  
  const { data, error } = await supabase
    .from("citas")
    .select("hora, estado, fecha")
    .eq("doctor_id", doctor_id)
    .eq("fecha", fechaStr)
    .in("estado", ["pendiente", "confirmada"]);
    
  console.log("Supabase response:");
  console.log("Error:", error);
  console.log("Data:", data);
}

testFetch();
