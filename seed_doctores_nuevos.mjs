import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// Cliente con permisos de administrador para bypassear RLS y poder crear usuarios en Auth
const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function runSeed() {
  console.log("Iniciando seed de nuevos doctores, sucursal y horarios...");

  try {
    // 1. Agregar una nueva Sucursal
    console.log("1. Creando nueva sucursal...");
    const { data: sucursal, error: sucErr } = await supabaseAdmin
      .from('sucursales')
      .insert({ nombre: "Sede Este - Especialidades", direccion: "Av. Oriente 456, Ciudad" })
      .select()
      .single();
    
    if (sucErr && sucErr.code !== '23505') throw sucErr; // Ignorar si ya existe por nombre único
    
    let sucursalId;
    if (sucursal) {
      sucursalId = sucursal.id;
      console.log(`✅ Sucursal creada: ${sucursal.nombre} (ID: ${sucursalId})`);
    } else {
      const { data: extSuc } = await supabaseAdmin.from('sucursales').select('id').eq('nombre', "Sede Este - Especialidades").single();
      sucursalId = extSuc?.id;
      console.log(`✅ Sucursal ya existía (ID: ${sucursalId})`);
    }

    // 2. Agregar Consultorios para la nueva sucursal
    console.log("2. Creando consultorios para la nueva sucursal...");
    const consultoriosToCreate = [
      { nombre: "Consultorio C-301", sucursal_id: sucursalId },
      { nombre: "Consultorio C-302", sucursal_id: sucursalId },
      { nombre: "Consultorio C-303", sucursal_id: sucursalId }
    ];
    
    for (const c of consultoriosToCreate) {
      const { error: conErr } = await supabaseAdmin.from('consultorios').insert(c);
      // Ignorar errores menores por si ya existen
    }
    
    // Obtener todos los consultorios disponibles
    const { data: consultoriosDB } = await supabaseAdmin.from('consultorios').select('id, nombre, sucursal_id');
    console.log(`✅ Consultorios disponibles listos.`);

    // 3. Obtener Especialidades
    console.log("3. Obteniendo especialidades...");
    const { data: especialidades } = await supabaseAdmin.from('especialidades').select('id, nombre');
    console.log(`✅ Especialidades encontradas: ${especialidades?.length}`);

    // 4. Crear Doctores
    console.log("4. Creando doctores por cada especialidad...");
    
    // Nombres ficticios para los doctores por especialidad
    const doctorNames = {
      "Odontología General": { nombre: "Laura", apellidos: "Martínez", username: "doc_laura" },
      "Ortodoncia": { nombre: "Miguel", apellidos: "Ángel", username: "doc_miguel" },
      "Pediatría": { nombre: "Sofía", apellidos: "López", username: "doc_sofia" },
      "Ginecología": { nombre: "Andrea", apellidos: "García", username: "doc_andrea" },
      "Dermatología": { nombre: "Ricardo", apellidos: "Silva", username: "doc_ricardo" }
    };

    let doctorData = [];

    for (const esp of especialidades || []) {
      const info = doctorNames[esp.nombre] || { 
        nombre: "Doctor", 
        apellidos: esp.nombre.split(" ")[0], 
        username: `doc_${esp.nombre.toLowerCase().replace(/[^a-z]/g, "")}` 
      };
      
      const email = `${info.username}@nexussalud.app`;

      // a) Crear en Auth (esto disparará el trigger y creará la fila en 'usuarios' si existe, o la creamos manual)
      const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: "Password123!",
        email_confirm: true,
        user_metadata: {
          nombre: info.nombre,
          apellidos: info.apellidos,
          username: info.username,
          rol: "doctor"
        }
      });

      if (authErr) {
        if (authErr.message.includes("already registered")) {
          console.log(`⚠️ El usuario ${email} ya existe, recuperando ID...`);
          // Si ya existe, buscar su ID
          const { data: existingUser } = await supabaseAdmin.from('usuarios').select('id').eq('correo', email).single();
          if (existingUser) {
             doctorData.push({ id: existingUser.id, esp_id: esp.id });
          }
        } else {
          console.error(`Error creando a ${email}:`, authErr);
        }
      } else if (authUser?.user) {
         // b) Insertar en tabla doctores (la fila en 'usuarios' la hace el trigger)
         const { error: docErr } = await supabaseAdmin.from('doctores').insert({
            id: authUser.user.id,
            precio_consulta: 600.00,
            especialidad_id: esp.id
         });
         
         if (docErr) console.error(`Error insertando en tabla doctores para ${email}:`, docErr);
         else {
            console.log(`✅ Doctor creado: Dr(a). ${info.nombre} ${info.apellidos} (${esp.nombre})`);
            doctorData.push({ id: authUser.user.id, esp_id: esp.id });
         }
      }
    }

    // 5. Asignar Horarios sin choques
    console.log("5. Asignando horarios sin choques...");
    
    // Limpiamos los horarios de estos doctores por si acaso para no duplicar
    for (const d of doctorData) {
      await supabaseAdmin.from('doctor_consultorios').delete().eq('doctor_id', d.id);
    }

    // Configuración de turnos para que no choquen.
    // Usaremos días distintos o consultorios distintos.
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    const turnos = [
      { inicio: '08:00:00', fin: '13:00:00' },
      { inicio: '14:00:00', fin: '19:00:00' }
    ];

    let consultorioIndex = 0;
    
    for (let i = 0; i < doctorData.length; i++) {
      const doc = doctorData[i];
      // A cada doctor le asignamos 2 días de la semana
      const dia1 = dias[i % dias.length];
      const dia2 = dias[(i + 2) % dias.length];
      
      // Rotamos los consultorios para asegurar que no se crucen físicamente
      const consultorioAsignado = consultoriosDB?.[consultorioIndex % (consultoriosDB.length || 1)];
      consultorioIndex++;

      const horariosToInsert = [
        {
          doctor_id: doc.id,
          consultorio_id: consultorioAsignado?.id,
          dia_semana: dia1,
          hora_inicio: turnos[0].inicio,
          hora_fin: turnos[0].fin
        },
        {
          doctor_id: doc.id,
          consultorio_id: consultorioAsignado?.id,
          dia_semana: dia2,
          hora_inicio: turnos[1].inicio,
          hora_fin: turnos[1].fin
        }
      ];

      const { error: horErr } = await supabaseAdmin.from('doctor_consultorios').insert(horariosToInsert);
      if (horErr) console.error(`Error asignando horario al doctor ID ${doc.id}:`, horErr);
      else console.log(`✅ Horarios asignados para doctor ID ${doc.id} en ${consultorioAsignado?.nombre} (${dia1} mañana, ${dia2} tarde)`);
    }

    console.log("¡Proceso de seed completado exitosamente!");

  } catch (error) {
    console.error("Error crítico durante el seed:", error);
  }
}

runSeed();
