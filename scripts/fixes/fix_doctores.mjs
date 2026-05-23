import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function runFix() {
  console.log("Ajustando especialidades y horarios de los nuevos doctores...");

  // 1. Obtener todas las especialidades
  const { data: especialidades } = await supabaseAdmin.from('especialidades').select('*');
  const { data: sucursales } = await supabaseAdmin.from('sucursales').select('*').eq('nombre', 'Sede Este - Especialidades').single();
  const { data: consultorios } = await supabaseAdmin.from('consultorios').select('*').eq('sucursal_id', sucursales?.id);

  console.log("Sucursal nueva ID:", sucursales?.id);
  console.log("Consultorios disponibles:", consultorios?.length);

  // 2. Obtener usuarios que son doctores (creados en el script anterior)
  const emails = [
    "doc_laura@nexussalud.app",
    "doc_miguel@nexussalud.app",
    "doc_sofia@nexussalud.app",
    "doc_andrea@nexussalud.app",
    "doc_ricardo@nexussalud.app"
  ];

  const { data: doctoresUsuarios } = await supabaseAdmin
    .from('usuarios')
    .select('id, correo, nombre')
    .in('correo', emails);

  if (!doctoresUsuarios || doctoresUsuarios.length === 0) {
    console.error("No se encontraron los usuarios doctores. Algo falló en la creación.");
    return;
  }

  // Mapear correo a especialidad
  const mapEspecialidad = {
    "doc_laura@nexussalud.app": "Odontología General",
    "doc_miguel@nexussalud.app": "Ortodoncia",
    "doc_sofia@nexussalud.app": "Pediatría",
    "doc_andrea@nexussalud.app": "Ginecología",
    "doc_ricardo@nexussalud.app": "Dermatología"
  };

  const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
  const turnos = [
    { inicio: '08:00:00', fin: '13:00:00' },
    { inicio: '14:00:00', fin: '19:00:00' }
  ];

  // Limpiar horarios antiguos si existieran
  const docIds = doctoresUsuarios.map(u => u.id);
  await supabaseAdmin.from('doctor_consultorios').delete().in('doctor_id', docIds);

  let i = 0;
  for (const docUser of doctoresUsuarios) {
    const nombreEsp = mapEspecialidad[docUser.correo];
    const espObj = especialidades.find(e => e.nombre === nombreEsp);

    if (espObj) {
      // a) Actualizar la tabla doctores con el especialidad_id y precio_consulta
      await supabaseAdmin.from('doctores').update({
        especialidad_id: espObj.id,
        precio_consulta: 600.00
      }).eq('id', docUser.id);
      
      console.log(`✅ Especialidad actualizada para Dra/Dr. ${docUser.nombre}: ${espObj.nombre}`);

      // b) Asignar 2 horarios por doctor en la NUEVA SUCURSAL
      const dia1 = dias[i % dias.length];
      const dia2 = dias[(i + 2) % dias.length];
      const consultorio = consultorios[i % consultorios.length];

      const horariosToInsert = [
        {
          doctor_id: docUser.id,
          consultorio_id: consultorio.id,
          dia_semana: dia1,
          hora_inicio: turnos[0].inicio,
          hora_fin: turnos[0].fin
        },
        {
          doctor_id: docUser.id,
          consultorio_id: consultorio.id,
          dia_semana: dia2,
          hora_inicio: turnos[1].inicio,
          hora_fin: turnos[1].fin
        }
      ];

      await supabaseAdmin.from('doctor_consultorios').insert(horariosToInsert);
      console.log(`✅ Horario asignado: ${docUser.nombre} en ${consultorio.nombre} los ${dia1} y ${dia2}`);
      i++;
    }
  }

  console.log("¡Todos los datos ajustados exitosamente!");
}

runFix();
