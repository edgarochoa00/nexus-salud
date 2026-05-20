import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

// 1. Obtener la lista de todos los asistentes (secretarias)
export async function GET() {
  try {
    const supabaseAdmin = createAdminClient();
    
    // Consultar usuarios con rol 'secretaria', incluyendo su relación con la tabla secretarias y sucursales
    const { data, error } = await supabaseAdmin
      .from("usuarios")
      .select(`
        id,
        nombre,
        apellidos,
        telefono,
        correo,
        usuario,
        rol,
        created_at,
        secretarias (
          sucursal_id,
          sucursales (
            id,
            nombre
          )
        )
      `)
      .eq("rol", "secretaria")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al obtener asistentes:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Aplanar la estructura de respuesta
    const assistants = (data || []).map((user: any) => {
      const secInfo = user.secretarias?.[0] || user.secretarias || {};
      const sucInfo = secInfo.sucursales || {};
      return {
        id: user.id,
        nombre: user.nombre,
        apellidos: user.apellidos,
        telefono: user.telefono,
        correo: user.correo,
        usuario: user.usuario,
        rol: user.rol,
        created_at: user.created_at,
        sucursal_id: secInfo.sucursal_id || null,
        sucursal_nombre: sucInfo.nombre || "Sin Sucursal",
      };
    });

    return NextResponse.json({ success: true, assistants });
  } catch (err: any) {
    console.error("Error inesperado en GET /api/admin/asistentes:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// 2. Crear un nuevo asistente/secretaria
export async function POST(request: Request) {
  try {
    const { nombre, apellidos, correo, username, password, telefono, sucursal_id } = await request.json();

    if (!nombre || !apellidos || !correo || !username || !password) {
      return NextResponse.json({ error: "Nombre, apellidos, correo, usuario y contraseña son obligatorios." }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const usernameLower = username.toLowerCase().trim();

    // Registrar en Supabase Auth usando Admin API.
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: correo.trim(),
      password: password,
      email_confirm: true,
      user_metadata: {
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        username: usernameLower,
        rol: "secretaria",
        telefono: telefono ? telefono.trim() : null,
        sucursal_id: sucursal_id ? Number(sucursal_id) : null,
      },
    });

    if (error) {
      console.error("Error creando cuenta de asistente:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: data.user });
  } catch (err: any) {
    console.error("Error inesperado en POST /api/admin/asistentes:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// 3. Eliminar un asistente (Borra de Auth y cascada)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID del asistente es requerido." }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // Eliminar de auth.users. Las llaves foráneas CASCADE eliminarán los datos de public.usuarios y public.secretarias automáticamente.
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) {
      console.error("Error al eliminar asistente:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error inesperado en DELETE /api/admin/asistentes:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
