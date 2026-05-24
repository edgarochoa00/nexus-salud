import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId");
    const fecha = searchParams.get("fecha");

    if (!doctorId || !fecha) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // Buscar citas para ese doctor en esa fecha,
    // que NO estén canceladas (es decir: pendiente, confirmada, completada)
    const { data, error } = await supabaseAdmin
      .from("citas")
      .select("hora")
      .eq("doctor_id", doctorId)
      .eq("fecha", fecha)
      .in("estado", ["pendiente", "confirmada", "completada"]);

    if (error) {
      console.error("Error al cargar horarios ocupados:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, horarios: data });
  } catch (err: any) {
    console.error("Error inesperado en GET /api/paciente/agendar/horarios_ocupados:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
