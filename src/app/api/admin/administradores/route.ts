import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

// 1. Obtener la lista de todos los administradores
export async function GET() {
  try {
    const supabaseAdmin = createAdminClient();
    
    // Consultar usuarios con rol 'admin'
    const { data, error } = await supabaseAdmin
      .from("usuarios")
      .select("id, nombre, apellidos, telefono, correo, rol, created_at")
      .eq("rol", "admin")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al obtener administradores:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, admins: data || [] });
  } catch (err: any) {
    console.error("Error inesperado en GET /api/admin/administradores:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// 2. Crear un nuevo administrador
export async function POST(request: Request) {
  try {
    const { nombre, apellidos, correo, curp, password, telefono } = await request.json();

    if (!nombre || !apellidos || !curp || !password || (!correo && !telefono)) {
      return NextResponse.json({ error: "Faltan campos obligatorios o de contacto." }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const curpUpper = curp.toUpperCase().trim();
    const emailToUse = correo && correo.trim() !== "" ? correo.trim() : `${curpUpper.toLowerCase()}@nexussalud.app`;

    // Registrar en Supabase Auth usando Admin API.
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: emailToUse,
      password: password,
      email_confirm: true,
      user_metadata: {
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        curp: curpUpper,
        rol: "admin",
        telefono: telefono ? telefono.trim() : null,
      },
    });

    if (error) {
      console.error("Error creando cuenta de administrador:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: data.user });
  } catch (err: any) {
    console.error("Error inesperado en POST /api/admin/administradores:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// 3. Eliminar un administrador
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID del administrador es requerido." }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // Eliminar de auth.users.
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) {
      console.error("Error al eliminar administrador:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error inesperado en DELETE /api/admin/administradores:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
