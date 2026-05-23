import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  console.log("Iniciando la inserción de cuentas semilla en Supabase...");

  // 1. Obtener Especialidades, Sucursales y Consultorios para conocer sus IDs correctos
  const { data: especialidades } = await supabaseAdmin.from('especialidades').select('*');
  const { data: sucursales } = await supabaseAdmin.from('sucursales').select('*');
  const { data: consultorios } = await supabaseAdmin.from('consultorios').select('*');

  if (!especialidades || especialidades.length === 0) {
    console.error("Error: Debes ejecutar primero supabase_migration_part1.sql en tu Supabase Editor.");
    process.exit(1);
  }

  const espOdonto = especialidades.find(e => e.nombre.includes('Odontología'))?.id || especialidades[0].id;
  const sucNorte = sucursales.find(s => s.nombre.includes('Norte'))?.id || sucursales[0].id;
  const conA101 = consultorios.find(c => c.nombre.includes('A-101'))?.id || consultorios[0]?.id;

  console.log(`IDs detectados -> Especialidad: ${espOdonto}, Sucursal: ${sucNorte}, Consultorio: ${conA101}`);

  // Definición de las cuentas semilla
  const seedUsers = [
    {
      email: 'admin@nexussalud.app',
      username: 'admin_nexus',
      password: 'Password123!',
      metadata: {
        nombre: 'Carlos',
        apellidos: 'Administrador',
        username: 'admin_nexus',
        rol: 'admin'
      }
    },
    {
      email: 'doctor@nexussalud.app',
      username: 'doctor_carlos',
      password: 'Password123!',
      metadata: {
        nombre: 'Dr. Carlos',
        apellidos: 'Gómez',
        username: 'doctor_carlos',
        rol: 'doctor',
        especialidad_id: espOdonto,
        precio_consulta: 500.00
      }
    },
    {
      email: 'secretaria@nexussalud.app',
      username: 'secretaria_ana',
      password: 'Password123!',
      metadata: {
        nombre: 'Ana',
        apellidos: 'Secretaria',
        username: 'secretaria_ana',
        rol: 'secretaria',
        sucursal_id: sucNorte
      }
    },
    {
      email: 'paciente@nexussalud.app',
      username: 'paciente_juan',
      password: 'Password123!',
      metadata: {
        nombre: 'Juan',
        apellidos: 'Paciente',
        username: 'paciente_juan',
        rol: 'paciente',
        fecha_nacimiento: '1995-05-15'
      }
    }
  ];

  // 2. Limpieza de usuarios previos para evitar conflictos de correos/usernames
  const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (allUsers) {
    for (const user of allUsers.users) {
      const isSeed = seedUsers.some(su => su.email === user.email);
      if (isSeed) {
        console.log(`Eliminando cuenta previa: ${user.email}...`);
        await supabaseAdmin.auth.admin.deleteUser(user.id);
      }
    }
  }

  // 3. Crear cada usuario semilla
  const createdDoctors = [];
  for (const su of seedUsers) {
    console.log(`Creando cuenta para ${su.metadata.nombre} (${su.email})...`);
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: su.email,
      password: su.password,
      email_confirm: true,
      user_metadata: su.metadata
    });

    if (error) {
      console.error(`Error al crear ${su.email}:`, error.message);
    } else {
      console.log(`¡Cuenta creada con éxito! ID: ${created.user.id}`);
      if (su.metadata.rol === 'doctor') {
        createdDoctors.push(created.user.id);
      }
    }
  }

  // 4. Asignar consultorios y horarios a doctores (Parte 2)
  if (createdDoctors.length > 0 && conA101) {
    console.log("Asignando horarios y consultorio a Dr. Carlos...");
    
    // Limpiar horarios previos
    await supabaseAdmin.from('doctor_consultorios').delete().eq('doctor_id', createdDoctors[0]);

    // Insertar Lunes
    const { error: errorLunes } = await supabaseAdmin.from('doctor_consultorios').insert({
      doctor_id: createdDoctors[0],
      consultorio_id: conA101,
      dia_semana: 'lunes',
      hora_inicio: '09:00:00',
      hora_fin: '14:00:00'
    });

    // Insertar Miércoles
    const { error: errorMiercoles } = await supabaseAdmin.from('doctor_consultorios').insert({
      doctor_id: createdDoctors[0],
      consultorio_id: conA101,
      dia_semana: 'miercoles',
      hora_inicio: '15:00:00',
      hora_fin: '20:00:00'
    });

    if (errorLunes || errorMiercoles) {
      console.error("Error al asignar horarios:", errorLunes?.message || errorMiercoles?.message);
    } else {
      console.log("¡Horarios asignados exitosamente a Dr. Carlos en Consultorio A-101!");
    }
  }

  console.log("\n--- INSERCIÓN SEMILLA COMPLETADA ---");
  console.log("Puedes iniciar sesión con cualquiera de los siguientes usuarios:");
  seedUsers.forEach(su => {
    console.log(`🔑 Rol: ${su.metadata.rol.toUpperCase()} | ID de Usuario: ${su.username} | Contraseña: ${su.password}`);
  });
}

run();
