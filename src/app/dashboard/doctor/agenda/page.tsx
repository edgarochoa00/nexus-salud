"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function DoctorAgenda() {
  const supabase = createClient();
  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<"todas" | "pendiente" | "confirmada" | "completada">("todas");

  const fetchAgenda = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from("citas")
      .select(`
        id, fecha, hora, estado,
        paciente:pacientes!paciente_id(usuarios(nombre, apellidos, telefono)),
        consultorio:consultorios(nombre, sucursales(nombre))
      `)
      .eq("doctor_id", user.id)
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true });

    if (filtro !== "todas") {
      query = query.eq("estado", filtro);
    }

    const { data, error } = await query;
    if (!error) setCitas(data || []);
    setLoading(false);
  }, [supabase, filtro]);

  useEffect(() => { fetchAgenda(); }, [fetchAgenda]);

  const handleCancelCita = async (id: number) => {
    if (!window.confirm("¿Cancelar esta cita? El paciente recibirá una notificación automática.")) return;
    const { error } = await supabase.from("citas").update({ estado: "cancelada" }).eq("id", id);
    if (error) alert("Error: " + error.message);
    else fetchAgenda();
  };

  const handleCompletarCita = async (id: number) => {
    if (!window.confirm("¿Marcar esta cita como completada?")) return;
    const { error } = await supabase.from("citas").update({ estado: "completada" }).eq("id", id);
    if (error) alert("Error: " + error.message);
    else fetchAgenda();
  };

  const hoy = new Date().toISOString().split("T")[0];

  const estadoBadge = (estado: string) => {
    const map: Record<string, string> = {
      pendiente: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      confirmada: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
      completada: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      cancelada: "bg-red-500/10 text-red-300 border-red-500/30",
      no_asistio: "bg-slate-500/10 text-slate-400 border-slate-500/30",
    };
    return map[estado] || "bg-white/5 text-white/40 border-white/10";
  };

  return (
    <>
      <header
        className="fixed top-0 w-full z-50 flex justify-between items-center px-6 pb-4 bg-[#002022]/80 backdrop-blur-xl border-b border-white/10 shadow-lg"
        style={{ paddingTop: "max(calc(env(safe-area-inset-top) + 1rem), 1.5rem)" }}
      >
        <div className="flex items-center gap-3">
          <Link href="/dashboard/doctor" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-all text-white/70">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="font-headline font-bold text-xl text-white tracking-tight">Mi Agenda</h1>
        </div>
        <button type="button" onClick={fetchAgenda} className="text-[#00a3ad] p-2 rounded-full hover:bg-white/10 transition-all">
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </header>

      <main className="pb-32 px-6 max-w-4xl mx-auto" style={{ paddingTop: "calc(env(safe-area-inset-top) + 5rem)" }}>
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold font-headline text-white tracking-tight mb-1">Mis Citas</h2>
          <p className="text-white/50 text-sm">{citas.length} resultado{citas.length !== 1 ? "s" : ""}</p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {(["todas", "pendiente", "confirmada", "completada"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                filtro === f
                  ? "bg-[#00a3ad] text-white shadow-[0_4px_15px_rgba(0,163,173,0.4)]"
                  : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
              }`}
            >
              {f === "todas" ? "Todas" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Lista de citas */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => <div key={n} className="h-24 bg-white/5 animate-pulse rounded-[1.5rem]" />)}
          </div>
        ) : citas.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-[2rem]">
            <span className="material-symbols-outlined text-5xl text-white/20 mb-3">event_busy</span>
            <p className="text-white/40">No hay citas con este filtro.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {citas.map((cita: any) => {
              const pac = cita.paciente;
              const con = cita.consultorio;
              const sucursal = con?.sucursales?.nombre;
              const isToday = cita.fecha === hoy;

              return (
                <div
                  key={cita.id}
                  className={`bg-white/5 backdrop-blur-xl border rounded-[1.5rem] p-5 transition-all hover:bg-white/8 ${
                    isToday ? "border-[#00a3ad]/40" : "border-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Fecha / Hora */}
                    <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 ${
                      isToday ? "bg-[#00a3ad]/20 border border-[#00a3ad]/40" : "bg-white/5 border border-white/10"
                    }`}>
                      <span className={`text-[10px] font-bold uppercase ${isToday ? "text-[#00a3ad]" : "text-white/50"}`}>
                        {new Date(cita.fecha + "T00:00").toLocaleDateString("es-MX", { month: "short" })}
                      </span>
                      <span className={`text-xl font-black leading-none ${isToday ? "text-[#00a3ad]" : "text-white/80"}`}>
                        {new Date(cita.fecha + "T00:00").getDate()}
                      </span>
                      <span className="text-[9px] text-white/40 font-bold">
                        {cita.hora?.slice(0, 5)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${estadoBadge(cita.estado)}`}>
                          {cita.estado}
                        </span>
                        {isToday && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/10">
                            Hoy
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-white font-headline truncate">
                        {pac?.usuarios ? `${pac.usuarios.nombre} ${pac.usuarios.apellidos}` : "Paciente"}
                      </h3>
                      <p className="text-xs text-white/50 mt-0.5">
                        {con?.nombre || "—"}{sucursal ? ` · ${sucursal}` : ""}
                      </p>
                      {pac?.usuarios?.telefono && (
                        <p className="text-xs text-white/40 mt-0.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">call</span>
                          {pac.usuarios.telefono}
                        </p>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col gap-2 shrink-0">
                      {(cita.estado === "pendiente" || cita.estado === "confirmada") && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleCompletarCita(cita.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all active:scale-95"
                          >
                            Completar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancelCita(cita.id)}
                            className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all active:scale-95"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                      {cita.estado === "completada" && (
                        <Link
                          href="/dashboard/doctor/consultas"
                          className="px-3 py-1.5 rounded-xl bg-[#00a3ad]/10 border border-[#00a3ad]/30 text-[#00a3ad] text-xs font-bold hover:bg-[#00a3ad]/20 transition-all text-center"
                        >
                          Consulta
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
