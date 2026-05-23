import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(request: Request) {
  try {
    const { nombre, apellidos, telefono, curp, email, password, fecha_nacimiento } = await request.json();

    if (!curp || !password || !nombre || !apellidos || !fecha_nacimiento || (!email && !telefono)) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios o método de contacto" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();
    const curpUpper = curp.toUpperCase().trim();
    
    // Si no proveen email, generamos uno ficticio usando la CURP para cumplir el requerimiento de Supabase Auth
    const emailToUse = email && email.trim() !== "" ? email.trim() : `${curpUpper.toLowerCase()}@nexussalud.app`;

    // Crear el usuario usando el Admin API con email_confirm: true
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: emailToUse,
      password: password,
      email_confirm: true,
      user_metadata: {
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        telefono: telefono.trim(),
        curp: curpUpper,
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
