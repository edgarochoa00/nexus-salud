import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

// 1. Obtener la lista de todos los doctores
export async function GET() {
  try {
    const supabaseAdmin = createAdminClient();
    
    // Consultar usuarios con rol 'doctor', incluyendo su relación con la tabla doctores y especialidades
    const { data, error } = await supabaseAdmin
      .from("usuarios")
      .select(`
        id,
        nombre,
        apellidos,
        telefono,
        correo,
        rol,
        created_at,
        doctores (
          precio_consulta,
          especialidad_id,
          especialidades (
            id,
            nombre
          )
        )
      `)
      .eq("rol", "doctor")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al obtener doctores:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Aplanar la estructura de respuesta para que sea más fácil de consumir en el frontend
    const doctors = (data || []).map((user: any) => {
      const docInfo = user.doctores?.[0] || user.doctores || {};
      const espInfo = docInfo.especialidades || {};
      return {
        id: user.id,
        nombre: user.nombre,
        apellidos: user.apellidos,
        telefono: user.telefono,
        correo: user.correo,
        rol: user.rol,
        created_at: user.created_at,
        precio_consulta: docInfo.precio_consulta || 0,
        especialidad_id: docInfo.especialidad_id || null,
        especialidad_nombre: espInfo.nombre || "Sin Especialidad",
      };
    });

    return NextResponse.json({ success: true, doctors });
  } catch (err: any) {
    console.error("Error inesperado en GET /api/admin/doctores:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// 2. Crear un nuevo doctor (Auth + Trigger)
export async function POST(request: Request) {
  try {
    const { nombre, apellidos, correo, curp, password, telefono, especialidad_id, precio_consulta } = await request.json();

    if (!nombre || !apellidos || !curp || !password || (!correo && !telefono)) {
      return NextResponse.json({ error: "Faltan campos obligatorios o de contacto." }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const curpUpper = curp.toUpperCase().trim();
    const emailToUse = correo && correo.trim() !== "" ? correo.trim() : `${curpUpper.toLowerCase()}@nexussalud.app`;

    // Registrar en Supabase Auth usando Admin API. Esto no altera la sesión del administrador.
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: emailToUse,
      password: password,
      email_confirm: true, // Evita validaciones de correo para pruebas rápidas
      user_metadata: {
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        curp: curpUpper,
        rol: "doctor",
        telefono: telefono ? telefono.trim() : null,
        especialidad_id: especialidad_id ? Number(especialidad_id) : null,
        precio_consulta: precio_consulta ? Number(precio_consulta) : 0,
      },
    });

    if (error) {
      console.error("Error creando cuenta de doctor:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: data.user });
  } catch (err: any) {
    console.error("Error inesperado en POST /api/admin/doctores:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// 3. Eliminar un doctor (Borra de Auth y cascada de base de datos)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID del doctor es requerido." }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // Eliminar de auth.users. Las llaves foráneas CASCADE eliminarán los datos de public.usuarios y public.doctores automáticamente.
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) {
      console.error("Error al eliminar doctor:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error inesperado en DELETE /api/admin/doctores:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
