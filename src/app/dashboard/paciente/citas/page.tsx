"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import type { Cita } from "@/types/supabase";

export default function MisCitasList() {
  const supabase = createClient();
  const [appointments, setAppointments] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCitas = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("citas")
      .select("*, doctor:perfiles!doctor_id(nombre)")
      .eq("paciente_id", user.id)
      .in("estado", ["pendiente", "confirmada"])
      .order("fecha", { ascending: true });

    setAppointments((data as Cita[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchCitas(); }, [fetchCitas]);

  const handleCancel = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas cancelar esta cita?")) return;

    const { error } = await supabase
      .from("citas")
      .update({ estado: "cancelada" })
      .eq("id", id);

    if (error) {
      alert("Error al cancelar: " + error.message);
    } else {
      alert("Cita cancelada con éxito.");
      fetchCitas();
    }
  };

  return (
    <main className="relative z-10 px-6 pt-safe-24 pb-32 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-white font-headline tracking-tight mb-2">Mis Citas</h2>
        <p className="text-white/70 text-sm">Gestiona tus consultas programadas y revisa el historial.</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-[var(--color-primary-fixed)] font-headline">Citas Programadas</h3>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-[var(--color-primary-container)]/30 text-[var(--color-primary-fixed)] rounded-full text-xs font-bold uppercase tracking-widest">Próximas</span>
            <Link href="/dashboard/paciente/expediente" className="px-3 py-1 bg-white/5 text-white/40 rounded-full text-xs font-bold uppercase tracking-widest hover:text-white cursor-pointer transition-colors">
              Historial
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-4xl text-white/20 animate-spin">progress_activity</span>
            <p className="text-white/50 mt-2 text-sm">Cargando citas...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-[2rem] border border-white/10">
            <span className="material-symbols-outlined text-4xl text-white/20">event_busy</span>
            <p className="text-white/60 text-sm mt-2">No tienes citas próximas.</p>
            <Link href="/dashboard/paciente/agendar" className="inline-block mt-4 px-6 py-2 rounded-full bg-[var(--color-primary-container)] text-white text-sm font-bold">
              Agendar ahora
            </Link>
          </div>
        ) : (
          appointments.map((appt) => (
            <div key={appt.id} className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 hover:bg-white/10 group shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center justify-center bg-[var(--color-primary-container)]/20 p-4 rounded-2xl min-w-[80px]">
                  <span className="text-[var(--color-primary-fixed)] font-bold text-xl font-headline">
                    {new Date(appt.fecha + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                  </span>
                  <span className="text-white/60 text-xs font-bold uppercase">{appt.hora?.slice(0, 5)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[var(--color-tertiary-fixed)] text-sm font-semibold tracking-wide uppercase">{appt.especialidad}</span>
                    <div className="w-2 h-2 rounded-full bg-[var(--color-tertiary-fixed)] shadow-[0_0_8px_#81f4f6]"></div>
                  </div>
                  <h4 className="text-white text-xl font-bold font-headline mb-1">
                    {(appt.doctor as any)?.nombre ?? "Doctor"}
                  </h4>
                  <div className="flex items-center gap-2 text-white/70">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    <span className="text-sm">{appt.sucursal}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleCancel(appt.id)}
                  className="px-6 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <Link href={`/dashboard/paciente/citas/${appt.id}`} className="px-6 py-2 rounded-xl bg-white/5 border border-white/20 text-white text-sm font-bold uppercase tracking-widest hover:bg-[var(--color-primary-container)] hover:border-transparent transition-all active:scale-95 block text-center">
                  Detalles
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
