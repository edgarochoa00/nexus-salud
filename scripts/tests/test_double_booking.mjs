import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function testDoubleBooking() {
  console.log("Iniciando prueba de reserva duplicada (Double Booking Test)...");

  // Obtener dos pacientes
  const { data: pacientes } = await supabaseAdmin.from('usuarios').select('id, nombre').eq('rol', 'paciente').limit(2);
  
  if (!pacientes || pacientes.length < 2) {
    console.error("No hay suficientes pacientes en la base de datos para la prueba.");
    return;
  }

  const paciente1 = pacientes[0];
  const paciente2 = pacientes[1];
  
  // Obtener a Dra. Laura
  const { data: doctor } = await supabaseAdmin.from('usuarios').select('id, nombre').eq('correo', 'doc_laura@nexussalud.app').single();
  
  if (!doctor) {
    console.error("No se encontró a la Dra. Laura.");
    return;
  }

  const fechaCita = "2026-06-01"; // Lunes hipotético
  const horaCita = "08:00:00";
  const consultorioId = 4; // Un ID genérico

  console.log(`\n👨‍⚕️ Doctor elegido: Dra. ${doctor.nombre}`);
  console.log(`📅 Fecha/Hora elegida: ${fechaCita} a las ${horaCita}`);
  console.log(`🧍 Paciente A: ${paciente1.nombre}`);
  console.log(`🧍 Paciente B: ${paciente2.nombre}`);
  
  console.log("\n--- INTENTO 1: Paciente A reserva la cita ---");
  const { data: cita1, error: err1 } = await supabaseAdmin.from('citas').insert({
    doctor_id: doctor.id,
    paciente_id: paciente1.id,
    fecha: fechaCita,
    hora: horaCita,
    estado: 'pendiente'
  }).select().single();

  if (err1) {
    console.error("❌ Falló la reserva del Paciente A (no esperado):", err1.message);
    return;
  }
  console.log(`✅ ¡Éxito! Paciente A reservó la cita (ID: ${cita1.id})`);

  console.log("\n--- INTENTO 2: Paciente B intenta reservar la MISMA cita ---");
  const { data: cita2, error: err2 } = await supabaseAdmin.from('citas').insert({
    doctor_id: doctor.id,
    paciente_id: paciente2.id,
    fecha: fechaCita,
    hora: horaCita,
    estado: 'pendiente'
  }).select().single();

  if (err2) {
    console.log(`✅ ¡Correcto! El sistema BLOQUEÓ la segunda reserva.`);
    console.log(`Motivo del bloqueo: ${err2.message || err2.details}`);
  } else {
    console.error(`❌ FALLO DE LÓGICA: El sistema PERMITIÓ la segunda reserva (ID: ${cita2?.id}). ¡Choque de horarios detectado!`);
  }

  console.log("\n--- LIMPIEZA ---");
  if (cita1) await supabaseAdmin.from('citas').delete().eq('id', cita1.id);
  if (cita2) await supabaseAdmin.from('citas').delete().eq('id', cita2.id);
  console.log("Datos de prueba limpiados.");
}

testDoubleBooking();
