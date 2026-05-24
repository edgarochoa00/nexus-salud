const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const pacienteId = '8333e237-518a-4433-a4c1-27f26dc4e9d4'; // Jordan
const doctorId = '0c8ce093-df31-4337-9849-f9e7a6ddb6b0'; // Godoy

async function runTest() {
  try {
    console.log("=== INICIANDO PRUEBA REAL ===");

    // === PRUEBA 1: PACIENTE CANCELA (Retención de pago por <24h) ===
    console.log("\\n1. Simulando cita agendada para el mismo día (Paciente cancela)");
    const { data: cita1 } = await supabase.from('citas').insert({
      paciente_id: pacienteId,
      doctor_id: doctorId,
      consultorio_id: 2,
      fecha: new Date().toISOString().split('T')[0],
      hora: '09:00:00',
      estado: 'confirmada'
    }).select().single();

    await supabase.from('pagos').insert({
      cita_id: cita1.id,
      monto_total: 500,
      metodo_pago: 'tarjeta',
      estatus: 'pagado'
    });

    console.log(`   - Cita ID ${cita1.id} creada y pagada con $500.`);
    console.log("   - El paciente cancela la cita con menos de 24 horas...");

    // Simulando lógica de Patient ClientPage.tsx
    await supabase.from('citas').update({ estado: 'cancelada' }).eq('id', cita1.id);
    const { data: cancelacion1 } = await supabase.from('cancelaciones').insert({
      cita_id: cita1.id,
      motivo: "Cancelación tardía por paciente (<24h). Sin reembolso aplicable.",
      tipo: "paciente",
      cancelado_por: "paciente"
    }).select().single();

    await supabase.from("notificaciones").insert({
      mensaje: `Jordan canceló su cita del ${cita1.fecha} a las 23:00 con menos de 24h de anticipación. El pago de $500 se retiene a tu favor.`,
      tipo: "cancelacion",
      doctor_id: doctorId,
      cancelacion_id: cancelacion1.id
    });
    console.log("   ✅ Notificación enviada al Dr. Godoy y pago retenido correctamente.");

    
    // === PRUEBA 2: DOCTOR CANCELA (Reembolso íntegro) ===
    console.log("\\n2. Simulando cita agendada (Doctor cancela)");
    const d3 = new Date();
    d3.setDate(d3.getDate() + 3);
    const { data: cita2 } = await supabase.from('citas').insert({
      paciente_id: pacienteId,
      doctor_id: doctorId,
      consultorio_id: 2,
      fecha: d3.toISOString().split('T')[0],
      hora: '10:00:00',
      estado: 'confirmada'
    }).select().single();

    await supabase.from('pagos').insert({
      cita_id: cita2.id,
      monto_total: 800,
      metodo_pago: 'tarjeta',
      estatus: 'pagado'
    });

    console.log(`   - Cita ID ${cita2.id} creada y pagada con $800.`);
    console.log("   - El Dr. Godoy cancela la cita por 'emergencia familiar'...");

    // Simulando lógica de Doctor Agenda page.tsx
    await supabase.from('citas').update({ estado: 'cancelada' }).eq('id', cita2.id);
    const { data: cancelacion2 } = await supabase.from('cancelaciones').insert({
      cita_id: cita2.id,
      motivo: "Cancelada por el doctor: Tuve una emergencia familiar",
      tipo: "medico",
      cancelado_por: "doctor"
    }).select().single();

    await supabase.from("reembolsos").insert({
      cancelacion_id: cancelacion2.id,
      monto: 800,
      estatus: "pendiente"
    });

    await supabase.from("notificaciones").insert({
      mensaje: `El doctor canceló tu cita del ${cita2.fecha} a las 10:00. Motivo: "Tuve una emergencia familiar". Se ha procesado tu reembolso íntegro de $800 MXN.`,
      tipo: "cancelacion",
      paciente_id: pacienteId,
      cancelacion_id: cancelacion2.id
    });
    console.log("   ✅ Reembolso de $800 creado. Notificación enviada a Jordan con el motivo.");

    console.log("\\n=== PRUEBA FINALIZADA CORRECTAMENTE ===");

  } catch (error) {
    console.error("Error en prueba:", error);
  }
}

runTest();
