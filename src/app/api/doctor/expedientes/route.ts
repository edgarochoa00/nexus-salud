import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId");

    if (!doctorId) {
      return NextResponse.json({ error: "Falta el doctor_id" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin
      .from("citas")
      .select(`
        paciente_id,
        paciente:pacientes!paciente_id(
          id,
          fecha_nacimiento,
          usuarios(
            id,
            nombre,
            apellidos,
            telefono,
            correo
          ),
          expedientes(
            id,
            consultas(id, fecha_hora, motivo, receta, citas(doctor:doctores!doctor_id(usuarios(nombre, apellidos))))
          )
        )
      `)
      .eq("doctor_id", doctorId)
      .eq("estado", "completada")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar expedientes:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, expedientes: data });
  } catch (err: any) {
    console.error("Error inesperado en GET /api/doctor/expedientes:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
