"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import type { Cita } from "@/types/supabase";

export default function DoctorConsultas() {
  const supabase = createClient();
  const [consultas, setConsultas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConsultas = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const hoy = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("citas")
      .select("*, paciente:perfiles!paciente_id(nombre)")
      .eq("doctor_id", user.id)
      .eq("fecha", hoy)
      .in("estado", ["pendiente", "confirmada"])
      .order("hora", { ascending: true });

    setConsultas((data as Cita[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchConsultas(); }, [fetchConsultas]);

  return (
    <>
      <header
        className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 pb-4 bg-black/20 backdrop-blur-xl border-b border-white/10 shadow-lg"
        style={{ paddingTop: 'max(calc(env(safe-area-inset-top) + 1rem), 1.5rem)' }}
      >
        <div className="flex items-center gap-4">
          <Link href="/dashboard/doctor" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-all text-white/70">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#00a3ad] font-headline">Consultas del Día</h1>
          </div>
        </div>
        <button type="button" onClick={() => window.alert("No hay notificaciones nuevas.")}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-all text-white/70">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      <main className="pt-safe-28 pb-32 px-6 max-w-2xl mx-auto space-y-6">
        {loading ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-white/20 animate-spin">progress_activity</span>
          </div>
        ) : consultas.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-[2rem] border border-white/10">
            <span className="material-symbols-outlined text-5xl text-white/20">event_busy</span>
            <p className="text-white/50 mt-2 text-sm">No hay consultas programadas para hoy.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/60 text-sm">{consultas.length} paciente{consultas.length !== 1 ? "s" : ""} programado{consultas.length !== 1 ? "s" : ""}</p>
              <div className="flex items-center gap-2 px-3 py-1 bg-[#00a3ad]/20 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#00a3ad] animate-pulse"></span>
                <span className="text-xs font-bold text-[#00a3ad] uppercase tracking-widest">En curso</span>
              </div>
            </div>
            <div className="space-y-4">
              {consultas.map((c, i) => (
                <div key={c.id} className={`bg-white/10 backdrop-blur-xl border border-white/10 p-5 rounded-[1.5rem] flex items-center justify-between shadow-xl transition-all duration-300 hover:bg-white/15 ${i === 0 ? "border-l-4 border-l-[#00a3ad]" : ""}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${i === 0 ? "bg-[#00a3ad]/20 text-[#00a3ad]" : "bg-white/5 text-white/30"}`}>
                      {c.hora?.slice(0, 5)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{(c.paciente as any)?.nombre ?? "Paciente"}</h4>
                      <p className="text-xs text-white/60 font-medium">{c.especialidad}</p>
                    </div>
                  </div>
                  {i === 0 ? (
                    <Link href="/dashboard/doctor/expedientes"
                      className="bg-[#00a3ad] hover:bg-[#00a3ad]/90 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg transition-transform active:scale-95">
                      Atender
                    </Link>
                  ) : (
                    <span className="text-xs font-bold px-4 text-white/40">Pendiente</span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
