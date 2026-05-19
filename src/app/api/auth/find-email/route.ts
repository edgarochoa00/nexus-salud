import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(request: Request) {
  const { username } = await request.json();

  if (!username) {
    return NextResponse.json({ error: "Username requerido" }, { status: 400 });
  }

  const supabaseAdmin = createAdminClient();

  // Listar todos los usuarios y buscar por username en metadata
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    return NextResponse.json({ error: "Error al buscar usuario" }, { status: 500 });
  }

  const usernameLower = username.toLowerCase().trim();

  // Buscar usuario donde:
  // 1. raw_user_meta_data->>'username' == username (registros nuevos)
  // 2. O el prefijo del correo == username (registros anteriores)
  const found = data.users.find((u) => {
    const metaUsername = u.user_metadata?.username?.toLowerCase();
    const emailPrefix = u.email?.split("@")[0]?.toLowerCase();
    return metaUsername === usernameLower || emailPrefix === usernameLower;
  });

  if (!found || !found.email) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ email: found.email });
}
