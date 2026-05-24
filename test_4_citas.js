const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const idJuan = '98754f6b-5bc1-4d27-a730-5f819933aa40';
const idJordan = '8333e237-518a-4433-a4c1-27f26dc4e9d4';
const idLaura = '388d868a-4554-4cd7-a92a-2a00b5b9664f';
const consultorioLaura = 5;

// Next Monday
const monday = new Date();
monday.setDate(monday.getDate() + ((1 + 7 - monday.getDay()) % 7 || 7));
const fecha = monday.toISOString().split('T')[0];

async function runTest() {
  try {
    console.log("=== INICIANDO PRUEBA MASIVA (DR. LAURA) ===");

    // 1. Cita Completada - Juan
    console.log(`\\n1. Creando cita Completada para Juan el ${fecha} 08:00...`);
    const { data: c1 } = await supabase.from('citas').insert({
      paciente_id: idJuan, doctor_id: idLaura, consultorio_id: consultorioLaura,
      fecha, hora: '08:00:00', estado: 'completada'
    }).select().single();
    await supabase.from('pagos').insert({ cita_id: c1.id, monto_total: 500, estatus: 'pagado', metodo_pago: 'efectivo' });
    await supabase.from('consultas').insert({ cita_id: c1.id, motivo: 'Dolor de espalda', receta: 'Paracetamol' });
    console.log("   ✅ Cita completada con éxito.");

    // 2. Cita Completada - Jordan
    console.log(`\\n2. Creando cita Completada para Jordan el ${fecha} 09:00...`);
    const { data: c2 } = await supabase.from('citas').insert({
      paciente_id: idJordan, doctor_id: idLaura, consultorio_id: consultorioLaura,
      fecha, hora: '09:00:00', estado: 'completada'
    }).select().single();
    await supabase.from('pagos').insert({ cita_id: c2.id, monto_total: 500, anticipo: 250, estatus: 'pagado', metodo_pago: 'tarjeta' });
    await supabase.from('consultas').insert({ cita_id: c2.id, motivo: 'Chequeo general', receta: 'Vitaminas' });
    console.log("   ✅ Cita completada con éxito.");

    // 3. Cancelación Paciente (<24h) - Juan
    console.log(`\\n3. Creando cita Cancelada por Paciente (Juan) el ${fecha} 10:00...`);
    const { data: c3 } = await supabase.from('citas').insert({
      paciente_id: idJuan, doctor_id: idLaura, consultorio_id: consultorioLaura,
      fecha, hora: '10:00:00', estado: 'cancelada'
    }).select().single();
    await supabase.from('pagos').insert({ cita_id: c3.id, monto_total: 600, anticipo: 300, estatus: 'pagado', metodo_pago: 'tarjeta' });
    
    const { data: can3 } = await supabase.from('cancelaciones').insert({
      cita_id: c3.id, motivo: "Cancelación tardía por paciente (<24h). Sin reembolso aplicable.", tipo: "paciente", cancelado_por: "paciente"
    }).select().single();
    
    // Devolvemos 300 (la diferencia), retenemos 300 (anticipo)
    await supabase.from('reembolsos').insert({ cancelacion_id: can3.id, monto: 300, estatus: 'pendiente' });
    await supabase.from('notificaciones').insert({
      mensaje: `Juan canceló su cita del ${fecha} a las 10:00 con menos de 24h de anticipación. Se penalizó reteniendo el anticipo de $300 a tu favor.`,
      tipo: "cancelacion", doctor_id: idLaura, cancelacion_id: can3.id
    });
    console.log("   ✅ Cita cancelada. Notificación al doctor y retención de $300.");

    // 4. Cancelación Doctor - Jordan
    console.log(`\\n4. Creando cita Cancelada por Doctor (Dra. Laura cancela a Jordan) el ${fecha} 11:00...`);
    const { data: c4 } = await supabase.from('citas').insert({
      paciente_id: idJordan, doctor_id: idLaura, consultorio_id: consultorioLaura,
      fecha, hora: '11:00:00', estado: 'cancelada'
    }).select().single();
    await supabase.from('pagos').insert({ cita_id: c4.id, anticipo: 200, estatus: 'parcial', metodo_pago: 'tarjeta' });
    
    const { data: can4 } = await supabase.from('cancelaciones').insert({
      cita_id: c4.id, motivo: "Cancelada por el doctor: Inconveniente personal", tipo: "medico", cancelado_por: "doctor"
    }).select().single();
    
    // Reembolso total de 200
    await supabase.from('reembolsos').insert({ cancelacion_id: can4.id, monto: 200, estatus: 'pendiente' });
    await supabase.from('notificaciones').insert({
      mensaje: `El doctor canceló tu cita del ${fecha} a las 11:00. Motivo: "Inconveniente personal". Se reembolsó íntegramente al paciente.`,
      tipo: "cancelacion", paciente_id: idJordan, cancelacion_id: can4.id
    });
    console.log("   ✅ Cita cancelada. Notificación al paciente y reembolso de $200.");

    console.log("\\n=== PRUEBA FINALIZADA CORRECTAMENTE ===");

  } catch (error) {
    console.error("Error en prueba:", error);
  }
}

runTest();
