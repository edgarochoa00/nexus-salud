"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { obtenerCitaEnProceso, limpiarCitaEnProceso } from "@/utils/citaStore";

export default function ConfirmacionSecretaria() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cita, setCita] = useState<any>(null);

  const loadCita = useCallback(() => {
    const datos = obtenerCitaEnProceso();
    setCita(datos);
  }, []);

  useEffect(() => {
    loadCita();
  }, [loadCita]);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Sesión expirada. Por favor inicia sesión de nuevo.");
      setLoading(false);
      return;
    }

    const datos = obtenerCitaEnProceso();

    if (!datos.paciente_id) {
      setError("Selecciona un paciente antes de confirmar la cita.");
      setLoading(false);
      return;
    }

    if (!datos.doctor_id) {
      setError("No se encontró el doctor seleccionado. Por favor reinicia el proceso.");
      setLoading(false);
      return;
    }

    if (!datos.fecha || !datos.hora) {
      setError("Por favor selecciona fecha y hora antes de confirmar.");
      setLoading(false);
      return;
    }

    // 1. Insert the cita
    const { data: citaData, error: insertError } = await supabase
      .from("citas")
      .insert({
        paciente_id: datos.paciente_id,
        doctor_id: datos.doctor_id,
        fecha: datos.fecha,
        hora: datos.hora,
        estado: "pendiente",
        creada_por: user.id,
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505' || insertError.message.includes('unique constraint')) {
        setError("Ese horario acaba de ser reservado por otro paciente o medio. Por favor selecciona otro horario.");
      } else {
        setError("Error al guardar la cita: " + insertError.message);
      }
      setLoading(false);
      return;
    }

    // 2. Register payment (secretaria doesn't charge, so mark as pendiente with 0 anticipo)
    const precio = datos.precio ?? 0;
    const { error: pagoError } = await supabase.from("pagos").insert({
      cita_id: citaData.id,
      monto_total: precio,
      anticipo: 0,
      metodo_pago: "efectivo",
      estatus: "pendiente",
    });

    if (pagoError) {
      console.warn("Cita creada, pero hubo un problema registrando el pago:", pagoError.message);
    }

    limpiarCitaEnProceso();
    alert("Cita agendada exitosamente en el sistema.");
    router.push("/dashboard/secretaria/citas");
  };

  if (!cita) {
    return (
      <main className="relative z-10 pt-safe-24 pb-32 px-6 max-w-2xl mx-auto w-full flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin material-symbols-outlined text-[var(--color-primary-container)] text-5xl">progress_activity</div>
      </main>
    );
  }

  const fechaDisplay = cita.fecha
    ? new Date(cita.fecha + "T00:00:00").toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "long" })
    : "—";

  return (
    <main className="relative z-10 pt-safe-24 pb-32 px-6 max-w-2xl mx-auto space-y-8 w-full">
      <div className="mb-4 flex flex-col">
        <span className="text-[10px] uppercase tracking-widest text-[var(--color-primary-container)] font-bold opacity-80 mb-2">Paso 4 de 4</span>
        <h1 className="font-headline font-bold text-2xl tracking-tight text-white">Resumen de Agendamiento</h1>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-sm p-4 rounded-2xl">{error}</div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 col-span-1 md:col-span-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--color-primary)]/20 rounded-xl flex items-center justify-center border border-[var(--color-primary)]/30">
              <span className="material-symbols-outlined text-[var(--color-primary-fixed-dim)]" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Especialidad</p>
              <h3 className="text-lg font-headline font-bold text-white">{cita.especialidad ?? "—"}</h3>
            </div>
          </div>
          <div className="hidden md:block h-10 w-[1px] bg-white/10"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
              <span className="material-symbols-outlined text-teal-400">person</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Especialista</p>
              <h3 className="text-lg font-headline font-bold text-white">{cita.doctor_nombre ?? "—"}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 flex flex-col gap-2">
          <span className="material-symbols-outlined text-teal-400 text-3xl">location_on</span>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sucursal</p>
          <p className="font-headline font-bold text-white">{cita.sucursal ?? "—"}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 flex flex-col gap-2 border-l-4 border-l-[var(--color-primary-container)]/50">
          <span className="material-symbols-outlined text-teal-400 text-3xl">calendar_today</span>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Fecha y Hora</p>
          <p className="font-headline font-bold text-white">{fechaDisplay} • {cita.hora ?? "—"}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 col-span-1 md:col-span-2 flex items-center gap-4">
          <span className="material-symbols-outlined text-teal-400 text-3xl">patient_list</span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Paciente</p>
            <p className="font-headline font-bold text-white">{cita.paciente_nombre ?? "—"}</p>
          </div>
        </div>
      </section>

      <section className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 mt-8 text-center space-y-6">
        <div className="w-16 h-16 bg-[var(--color-primary-container)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl text-[var(--color-primary-container)]">event_available</span>
        </div>
        <h2 className="font-headline font-bold text-xl text-white">¿Todo listo para agendar?</h2>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">
          Confirma que los datos de la cita y el paciente sean correctos antes de guardarlos en el sistema.
        </p>
        <form onSubmit={handleConfirm}>
          <button type="submit" disabled={loading}
            className="w-full h-16 mt-6 rounded-full bg-[var(--color-primary-container)] text-white font-headline font-bold text-lg shadow-[0_0_15px_rgba(0,163,173,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60">
            <span>{loading ? "Guardando en sistema..." : "Confirmar en Sistema"}</span>
            <span className="material-symbols-outlined">{loading ? "hourglass_empty" : "check_circle"}</span>
          </button>
        </form>
      </section>
    </main>
  );
}
