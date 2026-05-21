import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(request: Request) {
  try {
    const { nombre, apellidos, telefono, username, email, password, fecha_nacimiento } = await request.json();

    if (!username || !email || !password || !nombre || !apellidos || !telefono || !fecha_nacimiento) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();
    const usernameLower = username.toLowerCase().trim();

    // Crear el usuario usando el Admin API con email_confirm: true
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        telefono: telefono.trim(),
        username: usernameLower,
        rol: "paciente",
        fecha_nacimiento: fecha_nacimiento,
      },
    });

    if (error) {
      console.error("Error creando usuario desde admin:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: data.user });
  } catch (err: any) {
    console.error("Error inesperado en /api/auth/register:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
