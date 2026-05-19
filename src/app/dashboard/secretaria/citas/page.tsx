"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import type { Cita } from "@/types/supabase";

export default function SecretariaCitas() {
  const supabase = createClient();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCitas = useCallback(async () => {
    setLoading(true);
    const hoy = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("citas")
      .select("*, paciente:perfiles!paciente_id(nombre), doctor:perfiles!doctor_id(nombre)")
      .eq("fecha", hoy)
      .in("estado", ["pendiente", "confirmada"])
      .order("hora", { ascending: true });

    setCitas((data as Cita[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchCitas(); }, [fetchCitas]);

  const handleCancelar = async (id: string) => {
    if (!window.confirm("¿Cancelar esta cita?")) return;
    await supabase.from("citas").update({ estado: "cancelada" }).eq("id", id);
    fetchCitas();
  };

  return (
    <>
      <header className="safe-header fixed top-0 w-full z-40 flex justify-between items-center px-6 py-4 bg-cyan-950/40 backdrop-blur-xl border-b border-white/10 shadow-[0_32px_32px_-4px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/secretaria" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-all text-white/70">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="font-headline font-bold text-xl text-white tracking-tight">Control de Citas</h1>
          </div>
        </div>
        <Link href="/dashboard/secretaria/agendar"
          className="flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold px-4 py-2 rounded-full hover:bg-cyan-500/30 transition-colors">
          <span className="material-symbols-outlined text-sm">add</span>
          Nueva Cita
        </Link>
      </header>

      <main className="pt-safe-24 pb-32 px-6 max-w-5xl mx-auto space-y-6 relative z-10 w-full">
        {loading ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-white/20 animate-spin">progress_activity</span>
          </div>
        ) : citas.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-[2rem] border border-white/10">
            <span className="material-symbols-outlined text-5xl text-white/20">event_busy</span>
            <p className="text-white/50 mt-2 text-sm">No hay citas programadas para hoy.</p>
            <Link href="/dashboard/secretaria/agendar"
              className="inline-block mt-4 px-6 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-sm font-bold">
              Agendar cita
            </Link>
          </div>
        ) : (
          <section className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h2 className="font-headline font-bold text-lg text-white/90">Agenda del Día — {citas.length} cita{citas.length !== 1 ? "s" : ""}</h2>
            </div>
            <div className="space-y-4">
              {citas.map((cita, idx) => (
                <div key={cita.id}
                  className={`bg-[#083344]/40 backdrop-blur-3xl border border-white/15 p-5 rounded-[1.5rem] flex items-center justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] border-l-4 ${idx === 0 ? 'border-l-cyan-400' : 'border-l-transparent'}`}>
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex flex-col items-center justify-center border border-white/10 shrink-0">
                      <span className={`${idx === 0 ? 'text-cyan-400' : 'text-white/80'} font-headline font-extrabold text-sm`}>
                        {cita.hora?.slice(0, 5)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-white text-md">{(cita.paciente as any)?.nombre ?? "Paciente"}</h4>
                      <p className="text-xs text-white/50 mt-0.5">Dr. {(cita.doctor as any)?.nombre ?? "—"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/20">
                          {cita.especialidad}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 font-semibold border border-white/10">
                          {cita.sucursal}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCancelar(cita.id)}
                      className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all active:scale-95"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => window.alert(`Paciente: ${(cita.paciente as any)?.nombre}\nEspecialidad: ${cita.especialidad}\nHora: ${cita.hora?.slice(0, 5)}\nSucursal: ${cita.sucursal}`)}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white/30 hover:text-cyan-400 transition-colors hover:bg-cyan-500/10"
                    >
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
