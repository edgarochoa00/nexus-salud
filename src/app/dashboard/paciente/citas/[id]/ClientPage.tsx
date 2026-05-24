"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ClientPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cita, setCita] = useState<any>(null);
  const [isLessThan24h, setIsLessThan24h] = useState(false);

  const fetchCita = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("citas")
      .select(`
        id, fecha, hora, estado,
        doctor:doctores!doctor_id(usuarios(nombre, apellidos), especialidades(nombre)),
        consultorio:consultorios(nombre, sucursales(nombre)),
        pagos(monto_total, anticipo, estatus)
      `)
      .eq("id", params.id)
      .single();

    if (error || !data) {
      console.error(error);
      router.push("/dashboard/paciente/citas");
      return;
    }

    setCita(data);
    
    // Calcular si faltan menos de 24 horas
    const fechaCitaObj = new Date(`${data.fecha}T${data.hora}`);
    const ahora = new Date();
    const diferenciaHoras = (fechaCitaObj.getTime() - ahora.getTime()) / (1000 * 60 * 60);
    setIsLessThan24h(diferenciaHoras < 24);

    setLoading(false);
  }, [params.id, router, supabase]);

  useEffect(() => {
    fetchCita();
  }, [fetchCita]);

  const handleCancel = async () => {
    setLoading(true);
    
    // 1. Marcar cita como cancelada
    await supabase.from("citas").update({ estado: "cancelada" }).eq("id", cita.id);

    // 2. Crear la cancelación
    const { data: cancelacionData, error: cancelacionError } = await supabase
      .from("cancelaciones")
      .insert({
        cita_id: cita.id,
        motivo: isLessThan24h
          ? "Cancelación tardía por paciente (<24h). Sin reembolso aplicable."
          : "Cancelación anticipada por paciente (>24h)",
        tipo: "paciente",
        cancelado_por: "paciente"
      })
      .select()
      .single();

    if (cancelacionError) {
      console.error("Error al registrar la cancelación:", cancelacionError);
    }

    // 3. Lógica de retención y reembolso
    const pagoInfo = cita.pagos?.[0] || {};
    // El paciente pudo haber pagado solo el anticipo (estatus parcial/pagado) o el monto total
    const montoTotalPagado = pagoInfo.monto_total || pagoInfo.anticipo || 0; 
    const anticipo = pagoInfo.anticipo || 0;

    let montoReembolsar = 0;
    let montoRetenido = 0;

    if (!isLessThan24h) {
      // Cancelación anticipada: se reembolsa todo lo que pagó
      montoReembolsar = montoTotalPagado;
      montoRetenido = 0;
    } else {
      // Cancelación tardía (<24h): la clínica penaliza reteniendo solo el anticipo
      montoRetenido = anticipo;
      // Si el paciente ya había pagado el total (y era mayor al anticipo), le devolvemos la diferencia
      montoReembolsar = montoTotalPagado > anticipo ? montoTotalPagado - anticipo : 0;
    }

    if (montoReembolsar > 0 && cancelacionData) {
      try {
        await supabase.from("reembolsos").insert({
          cancelacion_id: cancelacionData.id,
          monto: montoReembolsar,
          estatus: "pendiente"
        });
      } catch (e) {
        console.error("Error al registrar el reembolso:", e);
      }
    }

    // 4. Notificar al doctor
    try {
      const nombrePaciente = cita.paciente?.usuarios?.nombre ? `${cita.paciente.usuarios.nombre} ${cita.paciente.usuarios.apellidos || ""}`.trim() : "Un paciente";
      const mensajeDoctor = isLessThan24h
        ? `${nombrePaciente} canceló su cita del ${cita.fecha} a las ${cita.hora?.slice(0,5)} con menos de 24h de anticipación. Se penalizó reteniendo el anticipo de $${montoRetenido} a tu favor.`
        : `${nombrePaciente} canceló su cita del ${cita.fecha} a las ${cita.hora?.slice(0,5)}. Se reembolsó íntegramente al paciente.`;

      await supabase.from("notificaciones").insert({
        mensaje: mensajeDoctor,
        tipo: "cancelacion",
        doctor_id: cita.doctor_id,
        cancelacion_id: cancelacionData?.id || null
      });
    } catch (e) {
      console.error("Error al notificar al doctor:", e);
    }

    alert("Cita cancelada exitosamente.");
    router.push("/dashboard/paciente/citas");
  };

  if (loading || !cita) {
    return (
      <main className="relative z-10 pt-safe-24 pb-32 px-6 max-w-2xl mx-auto w-full flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin material-symbols-outlined text-[var(--color-primary-container)] text-5xl">progress_activity</div>
      </main>
    );
  }

  const pagoInfo = cita.pagos?.[0] || { monto_total: 0, anticipo: 0 };
  const doctorName = cita.doctor?.usuarios ? `${cita.doctor.usuarios.nombre} ${cita.doctor.usuarios.apellidos}` : "—";
  const especialidad = cita.doctor?.especialidades?.nombre || "Consulta General";
  const sucursalName = cita.consultorio?.sucursales?.nombre || cita.consultorio?.nombre || "Clínica";
  const fechaDisplay = new Date(cita.fecha + "T00:00:00").toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "long" });

  return (
    <main className="pt-safe-24 pb-32 px-6 max-w-4xl mx-auto space-y-8 relative z-10 w-full">
      
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="material-symbols-outlined text-teal-500 hover:bg-white/5 transition-colors active:scale-95 duration-200 p-2 rounded-full flex items-center justify-center">
          arrow_back
        </button>
        <h1 className="font-headline font-bold text-lg tracking-tight text-white">
          Detalle de Cita
        </h1>
      </div>

      <section className="space-y-2">
        <h2 className="font-headline text-3xl font-extrabold text-white tracking-tight">Gestión de Cita</h2>
        <p className="text-white/70 text-sm">Revisa los detalles de tu consulta médica o solicita una cancelación.</p>
      </section>

      {/* Main Appointment Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Info Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] p-8 rounded-[2rem] relative overflow-hidden">
            <div className="flex flex-col gap-6 relative z-10">
              <div className="flex justify-between items-start">
                <div className="bg-[var(--color-primary-container)]/20 text-white px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase border border-white/10">
                  Cita {cita.estado}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">Especialidad</p>
                  <h3 className="text-white font-headline text-3xl font-bold">{especialidad}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <div>
                      <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest">Doctor</p>
                      <p className="text-white font-semibold text-sm">Dr. {doctorName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                      <span className="material-symbols-outlined">location_on</span>
                    </div>
                    <div>
                      <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest">Sucursal</p>
                      <p className="text-white font-semibold text-sm truncate max-w-[150px]">{sucursalName}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status Card */}
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] p-6 rounded-[2rem] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--color-primary-container)] text-white flex items-center justify-center shadow-lg shadow-[var(--color-primary-container)]/20">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-tight">${pagoInfo.monto_total.toFixed(2)} MXN</p>
                <p className="text-white/60 text-xs">Anticipo pagado (${pagoInfo.anticipo.toFixed(2)})</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Date/Time Column */}
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] p-8 rounded-[2rem] flex flex-col items-center justify-center text-center h-full">
            <span className="material-symbols-outlined text-white/40 text-4xl mb-4">calendar_today</span>
            <p className="text-white font-headline text-2xl font-bold leading-tight">{fechaDisplay}</p>
            <div className="mt-4 px-6 py-2 bg-[var(--color-primary-container)]/10 border border-[var(--color-primary-container)]/30 rounded-full text-[var(--color-primary-container)] font-bold text-lg shadow-[0_0_15px_rgba(0,163,173,0.4)]">
              {cita.hora.slice(0, 5)}
            </div>
          </div>
        </div>
      </div>

      {cita.estado !== 'cancelada' && (
        <>
          {/* Policy Section */}
          <section className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] p-6 rounded-[2rem] border-l-4 border-l-[var(--color-primary-container)]/50">
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-[var(--color-primary-container)]">info</span>
              <div className="space-y-1">
                <h4 className="text-white font-bold text-sm">Política de Reembolso</h4>
                <p className="text-white/70 text-sm leading-relaxed">
                  Importante: Las cancelaciones deben realizarse con al menos <span className="text-[var(--color-primary-container)] font-semibold underline decoration-[var(--color-primary-container)]/30 underline-offset-4">24 horas de antelación</span> para ser elegibles para el reembolso total del depósito.
                </p>
                {isLessThan24h && (
                  <p className="text-red-400 text-xs mt-2 font-bold bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                    ⚠ Faltan menos de 24 horas para tu cita. Si cancelas ahora, no se reembolsará tu anticipo.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Cancellation Actions */}
          <div className="flex flex-col items-center gap-6">
            <button 
              onClick={() => setShowCancelDialog(true)}
              className="w-full md:w-auto px-12 py-4 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/50 text-red-100 font-headline font-bold text-lg hover:bg-red-500/30 transition-all active:scale-95 shadow-xl shadow-red-900/20"
            >
              Cancelar Cita
            </button>
            <p className="text-white/40 text-xs italic">Al cancelar, recibirás una notificacion con el folio de cancelación.</p>
          </div>
        </>
      )}

      {/* Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowCancelDialog(false)}></div>
          <div className="bg-white/10 border border-white/20 backdrop-blur-3xl max-w-sm w-full p-8 rounded-[2.5rem] relative z-10 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-[#ba1a1a]/20 rounded-full flex items-center justify-center text-[#ba1a1a] mx-auto mb-2">
              <span className="material-symbols-outlined text-3xl">report</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-headline text-xl font-bold">¿Deseas cancelar esta cita?</h3>
              <p className="text-white/60 text-sm">Esta acción es irreversible y podría generar cargos según las políticas.</p>
              {isLessThan24h && (
                <p className="text-red-400 font-bold text-sm bg-red-500/10 p-2 rounded-lg mt-2">
                  No se emitirá reembolso por cancelación tardía.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleCancel}
                className="w-full py-3 bg-[#ba1a1a] text-white rounded-full font-bold hover:opacity-90 transition-opacity"
              >
                Confirmar Cancelación
              </button>
              <button 
                onClick={() => setShowCancelDialog(false)}
                className="w-full py-3 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-colors"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
