"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import type { Cita, HorarioBloqueado } from "@/types/supabase";

export default function DoctorAgenda() {
  const supabase = createClient();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [bloqueados, setBloqueados] = useState<HorarioBloqueado[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockTime, setBlockTime] = useState("");
  const [blockDate, setBlockDate] = useState("");

  const fetchAgenda = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [citasRes, bloqueadosRes] = await Promise.all([
      supabase
        .from("citas")
        .select("*, paciente:perfiles!paciente_id(nombre)")
        .eq("doctor_id", user.id)
        .in("estado", ["pendiente", "confirmada"])
        .order("fecha", { ascending: true })
        .order("hora", { ascending: true }),
      supabase
        .from("horarios_bloqueados")
        .select("*")
        .eq("doctor_id", user.id)
        .gte("fecha", new Date().toISOString().split("T")[0])
        .order("fecha", { ascending: true }),
    ]);

    setCitas((citasRes.data as Cita[]) ?? []);
    setBloqueados((bloqueadosRes.data as HorarioBloqueado[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchAgenda(); }, [fetchAgenda]);

  const handleCancelCita = async (id: string) => {
    if (!window.confirm("¿Cancelar esta cita?")) return;
    await supabase.from("citas").update({ estado: "cancelada" }).eq("id", id);
    fetchAgenda();
  };

  const handleDesbloquear = async (id: string) => {
    if (!window.confirm("¿Desbloquear este horario?")) return;
    await supabase.from("horarios_bloqueados").delete().eq("id", id);
    fetchAgenda();
  };

  const handleBlockTime = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !blockTime || !blockDate) return;

    const { error } = await supabase.from("horarios_bloqueados").insert({
      doctor_id: user.id,
      fecha: blockDate,
      hora: blockTime,
      motivo: "No disponible",
    });

    if (error) { alert("Error: " + error.message); return; }
    alert("Horario bloqueado exitosamente.");
    setShowBlockModal(false);
    setBlockDate(""); setBlockTime("");
    fetchAgenda();
  };

  return (
    <>
      {/* Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#00a3ad]/40" style={{ filter: "blur(80px)", opacity: 0.6 }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-[#00696b]/30" style={{ filter: "blur(80px)", opacity: 0.6 }}></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 pb-4 bg-black/20 backdrop-blur-xl border-b border-white/10 shadow-lg"
        style={{ paddingTop: 'max(calc(env(safe-area-inset-top) + 1rem), 1.5rem)' }}>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/doctor" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-all text-white/70">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
        </div>
        <button type="button" onClick={() => window.alert("No hay notificaciones nuevas.")}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-all text-white/70">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      <main className="relative z-10 pt-safe-24 pb-32 px-6 max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="font-headline text-3xl font-extrabold text-white tracking-tight">Mi Agenda</h1>
            <p className="text-white/70 mt-1 font-medium">Citas y horarios</p>
          </div>
          <button onClick={() => setShowBlockModal(true)}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[18px]">block</span>
            Bloquear Horario
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-white/20 animate-spin">progress_activity</span>
          </div>
        ) : (
          <>
            {/* Citas del doctor */}
            <div className="space-y-4 mb-8">
              <h2 className="text-white/60 text-xs font-bold uppercase tracking-widest">Citas Pendientes ({citas.length})</h2>
              {citas.length === 0 ? (
                <p className="text-white/40 text-sm">No hay citas programadas.</p>
              ) : citas.map((cita) => (
                <div key={cita.id} className="bg-white/10 backdrop-blur-xl border border-white/15 p-5 rounded-3xl flex items-center justify-between group hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-[#00a3ad]/20 flex flex-col items-center justify-center text-[#00a3ad] border border-[#00a3ad]/30">
                      <span className="text-[10px] font-bold uppercase">
                        {new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-MX', { month: 'short' })}
                      </span>
                      <span className="text-xl font-black leading-none">
                        {new Date(cita.fecha + 'T00:00:00').getDate()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-white">{(cita.paciente as any)?.nombre ?? "Paciente"}</h3>
                      <div className="flex items-center gap-3 text-white/50 text-sm mt-0.5">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">schedule</span>
                          {cita.hora?.slice(0, 5)}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">medical_services</span>
                          {cita.especialidad}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleCancelCita(cita.id)}
                      className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase hover:bg-red-500/20 transition-all active:scale-95">
                      Cancelar
                    </button>
                    <Link href="/dashboard/doctor/consultas"
                      className="px-4 py-2 rounded-xl bg-[#00a3ad]/20 border border-[#00a3ad]/30 text-[#00a3ad] text-xs font-bold uppercase hover:bg-[#00a3ad]/30 transition-all active:scale-95">
                      Atender
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Horarios bloqueados */}
            {bloqueados.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-white/60 text-xs font-bold uppercase tracking-widest">Horarios Bloqueados</h2>
                {bloqueados.map((b) => (
                  <div key={b.id} className="bg-red-500/5 backdrop-blur-xl border border-red-500/15 p-4 rounded-2xl flex items-center justify-between opacity-80">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-red-400">block</span>
                      <div>
                        <p className="text-red-300 font-bold text-sm">{b.fecha} · {b.hora?.slice(0, 5)}</p>
                        <p className="text-white/40 text-xs">{b.motivo}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDesbloquear(b.id)}
                      className="px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all">
                      Desbloquear
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal Bloquear */}
      {showBlockModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#083344] border border-white/10 w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative">
            <button onClick={() => setShowBlockModal(false)} className="absolute top-6 right-6 text-white/50 hover:text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="text-2xl font-bold text-white font-headline mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-400">block</span>
              Bloquear Horario
            </h2>
            <form className="space-y-4" onSubmit={handleBlockTime}>
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider font-bold mb-1 block">Fecha</label>
                <input required type="date" value={blockDate} onChange={e => setBlockDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-red-400" />
              </div>
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider font-bold mb-1 block">Hora</label>
                <input required type="time" value={blockTime} onChange={e => setBlockTime(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-red-400" />
              </div>
              <div className="pt-4 flex justify-end gap-4">
                <button type="button" onClick={() => setShowBlockModal(false)} className="text-white/60 hover:text-white font-bold px-4">Cancelar</button>
                <button type="submit" className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-colors">Bloquear</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
