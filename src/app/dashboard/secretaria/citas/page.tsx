"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function SecretariaCitas() {
  const supabase = createClient();
  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroFecha, setFiltroFecha] = useState<"hoy" | "semana" | "todas">("hoy");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchCitas = useCallback(async () => {
    setLoading(true);
    const hoy = new Date().toISOString().split("T")[0];
    const finSemana = new Date();
    finSemana.setDate(finSemana.getDate() + 7);
    const finSemanaStr = finSemana.toISOString().split("T")[0];

    let query = supabase
      .from("citas")
      .select(`
        id, fecha, hora, estado, creada_por,
        paciente:pacientes!paciente_id(usuarios(nombre, apellidos, telefono)),
        doctor:doctores!doctor_id(usuarios(nombre, apellidos)),
        consultorio:consultorios(nombre, sucursales(nombre)),
        pagos(folio, monto_total, estatus, metodo_pago)
      `)
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true });

    if (filtroFecha === "hoy") {
      query = query.eq("fecha", hoy).in("estado", ["pendiente", "confirmada"]);
    } else if (filtroFecha === "semana") {
      query = query.gte("fecha", hoy).lte("fecha", finSemanaStr).in("estado", ["pendiente", "confirmada"]);
    }

    const { data, error } = await query;
    if (!error) setCitas(data || []);
    setLoading(false);
  }, [supabase, filtroFecha]);

  useEffect(() => { fetchCitas(); }, [fetchCitas]);

  const handleConfirmar = async (id: number) => {
    setErrorMsg(""); setSuccessMsg("");
    const { error } = await supabase.from("citas").update({ estado: "confirmada" }).eq("id", id);
    if (error) setErrorMsg(error.message);
    else { setSuccessMsg("✓ Cita confirmada."); fetchCitas(); }
  };

  const handleCancelar = async (id: number, pacienteNombre: string) => {
    if (!window.confirm(`¿Cancelar la cita de ${pacienteNombre}?`)) return;
    setErrorMsg(""); setSuccessMsg("");
    const { error } = await supabase.from("citas").update({ estado: "cancelada" }).eq("id", id);
    
    if (!error) {
      await supabase.from("reembolsos").insert({
        cita_id: id,
        estado: "pendiente",
        motivo: "Cancelada por la Secretaria (Reembolso aplicable)"
      }).catch(() => {});
      setSuccessMsg("✓ Cita cancelada. El paciente recibirá una notificación automática."); 
      fetchCitas();
    } else {
      setErrorMsg(error.message);
    }
  };

  const estadoBadge = (estado: string) => {
    const map: Record<string, string> = {
      pendiente: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      confirmada: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
      completada: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      cancelada: "bg-red-500/10 text-red-300 border-red-500/30",
    };
    return map[estado] || "bg-white/5 text-white/40 border-white/10";
  };

  const hoy = new Date().toISOString().split("T")[0];

  return (
    <>
      <header className="safe-header fixed top-0 w-full z-40 flex justify-between items-center px-6 py-4 bg-cyan-950/40 backdrop-blur-xl border-b border-white/10 shadow-[0_32px_32px_-4px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/secretaria" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-all text-white/70">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="font-headline font-bold text-xl text-white tracking-tight">Control de Citas</h1>
            <p className="text-xs text-white/40">{citas.length} cita{citas.length !== 1 ? "s" : ""} encontrada{citas.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <Link
          href="/dashboard/secretaria/agendar"
          className="flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold px-4 py-2 rounded-full hover:bg-cyan-500/30 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Nueva Cita
        </Link>
      </header>

      <main className="pb-32 px-6 max-w-5xl mx-auto space-y-4 relative z-10 w-full" style={{ paddingTop: "calc(env(safe-area-inset-top) + 5rem)" }}>
        
        {/* Mensajes */}
        {successMsg && (
          <div className="bg-green-500/20 border border-green-500/40 text-green-300 text-sm font-semibold px-4 py-3 rounded-2xl">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-semibold px-4 py-3 rounded-2xl">
            {errorMsg}
          </div>
        )}

        {/* Filtros de fecha */}
        <div className="flex gap-2">
          {(["hoy", "semana", "todas"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltroFecha(f)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                filtroFecha === f
                  ? "bg-cyan-500 text-white shadow-[0_4px_15px_rgba(6,182,212,0.4)]"
                  : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
              }`}
            >
              {f === "hoy" ? "Hoy" : f === "semana" ? "Esta Semana" : "Todas"}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => <div key={n} className="h-28 bg-white/5 animate-pulse rounded-[1.5rem] border border-white/10" />)}
          </div>
        ) : citas.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-[2rem] border border-white/10">
            <span className="material-symbols-outlined text-5xl text-white/20">event_busy</span>
            <p className="text-white/50 mt-2 text-sm">No hay citas en este período.</p>
            <Link
              href="/dashboard/secretaria/agendar"
              className="inline-block mt-4 px-6 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-sm font-bold"
            >
              Agendar cita
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {citas.map((cita: any) => {
              const pac = cita.paciente;
              const doc = cita.doctor;
              const con = cita.consultorio;
              const pago = cita.pagos?.[0];
              const isToday = cita.fecha === hoy;

              return (
                <div
                  key={cita.id}
                  className={`bg-white/5 backdrop-blur-xl border rounded-[1.5rem] p-5 transition-all hover:bg-white/8 ${
                    isToday ? "border-cyan-500/30" : "border-white/10"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Hora/Fecha */}
                    <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-center shrink-0 border ${
                      isToday ? "bg-cyan-500/10 border-cyan-500/30" : "bg-white/5 border-white/10"
                    }`}>
                      <span className={`text-[10px] font-bold uppercase ${isToday ? "text-cyan-300" : "text-white/40"}`}>
                        {new Date(cita.fecha + "T00:00").toLocaleDateString("es-MX", { month: "short" })}
                      </span>
                      <span className={`text-xl font-black leading-none ${isToday ? "text-cyan-300" : "text-white/80"}`}>
                        {new Date(cita.fecha + "T00:00").getDate()}
                      </span>
                      <span className="text-[9px] text-white/40 font-bold">
                        {cita.hora?.slice(0, 5)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${estadoBadge(cita.estado)}`}>
                          {cita.estado}
                        </span>
                        {pago && (
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            pago.estatus === "pagado" 
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                          }`}>
                            ${pago.monto_total} MXN · {pago.estatus}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-white font-headline">
                        {pac?.usuarios ? `${pac.usuarios.nombre} ${pac.usuarios.apellidos}` : "Paciente"}
                      </h3>
                      <p className="text-xs text-white/50 mt-0.5">
                        Dr. {doc?.usuarios ? `${doc.usuarios.nombre} ${doc.usuarios.apellidos}` : "—"} · {con?.nombre || "—"}
                        {con?.sucursales?.nombre && ` · ${con.sucursales.nombre}`}
                      </p>
                      {pac?.usuarios?.telefono && (
                        <p className="text-xs text-white/40 mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">call</span>
                          {pac.usuarios.telefono}
                        </p>
                      )}
                    </div>

                    {/* Acciones */}
                    {(cita.estado === "pendiente" || cita.estado === "confirmada") && (
                      <div className="flex flex-col gap-2 shrink-0">
                        {cita.estado === "pendiente" && (
                          <button
                            type="button"
                            onClick={() => handleConfirmar(cita.id)}
                            className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition-all active:scale-95 whitespace-nowrap"
                          >
                            Confirmar
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCancelar(cita.id, pac?.usuarios ? `${pac.usuarios.nombre} ${pac.usuarios.apellidos}` : "este paciente")}
                          className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all active:scale-95"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
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
