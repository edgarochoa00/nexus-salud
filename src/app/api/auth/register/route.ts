import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(request: Request) {
  try {
    const { nombre, username, email, password, fecha_nacimiento } = await request.json();

    if (!username || !email || !password || !nombre || !fecha_nacimiento) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();
    const usernameLower = username.toLowerCase().trim();

    // Dividir nombre completo en nombre y apellidos
    const parts = nombre.trim().split(/\s+/);
    const vNombre = parts[0];
    const vApellidos = parts.slice(1).join(" ") || "";

    // Crear el usuario usando el Admin API con email_confirm: true
    // Esto puentea (bypasses) el requerimiento de confirmación de correo de Supabase.
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        nombre: vNombre,
        apellidos: vApellidos,
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
