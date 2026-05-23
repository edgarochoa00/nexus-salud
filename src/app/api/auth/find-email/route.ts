import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(request: Request) {
  const { curp } = await request.json();

  if (!curp) {
    return NextResponse.json({ error: "CURP requerido" }, { status: 400 });
  }

  const supabaseAdmin = createAdminClient();

  // Listar todos los usuarios y buscar por curp en metadata
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    console.error("Error al buscar usuario en Supabase:", error);
    return NextResponse.json({ error: "Error interno del servidor (posible falta de SERVICE_ROLE_KEY)" }, { status: 500 });
  }

  const curpUpper = curp.toUpperCase().trim();

  // Buscar usuario donde el CURP coincida (en metadata o en prefijo si en caso remoto lo guardaban ahí)
  const found = data.users.find((u) => {
    const metaCurp = u.user_metadata?.curp?.toUpperCase();
    return metaCurp === curpUpper;
  });

  if (!found || !found.email) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ email: found.email });
}
