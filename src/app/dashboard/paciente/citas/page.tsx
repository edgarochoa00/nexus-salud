"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function MisCitasList() {
  const supabase = createClient();
  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState<"proximas" | "historial">("proximas");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const hoy = new Date().toISOString().split("T")[0];

    const { data: citasData, error } = await supabase
      .from("citas")
      .select(`
        id, fecha, hora, estado,
        doctor:doctores!doctor_id(usuarios(nombre, apellidos), especialidades(nombre)),
        consultorio:consultorios(nombre, sucursales(nombre)),
        pagos(folio, monto_total, estatus),
        cancelaciones(motivo, reembolsos(estatus))
      `)
      .eq("paciente_id", user.id)
      .order("fecha", { ascending: vista === "proximas" });

    let data = citasData || [];
    if (vista === "proximas") {
      data = data.filter((c: any) => c.fecha >= hoy && ["pendiente", "confirmada"].includes(c.estado));
    } else {
      data = data.filter((c: any) => c.fecha < hoy || ["completada", "cancelada"].includes(c.estado));
    }

    setCitas(data);
    setLoading(false);
  }, [supabase, vista]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCancelar = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas cancelar esta cita?")) return;
    const { error } = await supabase.from("citas").update({ estado: "cancelada" }).eq("id", id);
    if (error) alert("Error: " + error.message);
    else {
      setSuccessMsg("Cita cancelada. Revisa tus notificaciones en la campana superior.");
      setTimeout(() => setSuccessMsg(""), 4000);
      fetchData();
    }
  };

  const estadoBadge = (estado: string) => {
    const map: Record<string, { color: string; label: string }> = {
      pendiente: { color: "text-amber-300 bg-amber-500/10 border-amber-500/30", label: "Pendiente" },
      confirmada: { color: "text-cyan-300 bg-cyan-500/10 border-cyan-500/30", label: "Confirmada" },
      completada: { color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30", label: "Completada" },
      cancelada: { color: "text-red-300 bg-red-500/10 border-red-500/30", label: "Cancelada" },
      no_asistio: { color: "text-slate-400 bg-slate-500/10 border-slate-500/30", label: "No asistió" },
    };
    return map[estado] || { color: "text-white/40", label: estado };
  };

  return (
    <main className="relative z-10 px-6 pt-28 pb-32 max-w-4xl mx-auto w-full">
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold text-white font-headline tracking-tight">Mis Citas</h2>
        <p className="text-white/50 text-sm mt-1">Gestiona tus consultas y revisa tu historial.</p>
      </div>

      {successMsg && (
        <div className="mb-4 bg-green-500/20 border border-green-500/40 text-green-300 text-sm font-semibold px-4 py-3 rounded-2xl">
          {successMsg}
        </div>
      )}

      {/* Tabs Vista */}
      <div className="flex items-center gap-2 mb-6">
        {(["proximas", "historial"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setVista(v)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
              vista === v
                ? "bg-[var(--color-primary-container,#00a3ad)] text-white shadow-md"
                : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
            }`}
          >
            {v === "proximas" ? "Próximas" : "Historial"}
          </button>
        ))}
        <Link
          href="/dashboard/paciente/agendar"
          className="ml-auto px-5 py-2 rounded-full text-sm font-bold bg-white/10 text-white/70 border border-white/10 hover:bg-white/20 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Agendar
        </Link>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => <div key={n} className="h-28 bg-white/5 animate-pulse rounded-[1.5rem] border border-white/10" />)}
        </div>
      ) : citas.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-[2rem] border border-white/10">
          <span className="material-symbols-outlined text-4xl text-white/20">event_busy</span>
          <p className="text-white/50 text-sm mt-2">
            {vista === "proximas" ? "No tienes citas próximas." : "No hay historial de citas."}
          </p>
          {vista === "proximas" && (
            <Link href="/dashboard/paciente/agendar" className="inline-block mt-4 px-6 py-2 rounded-full bg-[var(--color-primary-container,#00a3ad)] text-white text-sm font-bold">
              Agendar ahora
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {citas.map((cita: any) => {
            const doc = cita.doctor;
            const con = cita.consultorio;
            const pago = cita.pagos?.[0];
            const espInfo = doc?.especialidades;
            const especialidad = espInfo?.nombre;
            const badge = estadoBadge(cita.estado);

            return (
              <div
                key={cita.id}
                className="bg-white/5 backdrop-blur-2xl border border-white/10 p-5 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-white/8 group"
              >
                <div className="flex items-center gap-5">
                  {/* Fecha */}
                  <div className="flex flex-col items-center justify-center bg-white/5 border border-white/10 p-3 rounded-2xl min-w-[72px] text-center">
                    <span className="text-white/60 font-bold text-xs uppercase">
                      {new Date(cita.fecha + "T00:00").toLocaleDateString("es-MX", { month: "short" })}
                    </span>
                    <span className="text-white font-black text-2xl leading-none font-headline">
                      {new Date(cita.fecha + "T00:00").getDate()}
                    </span>
                    <span className="text-white/40 text-xs font-bold">{cita.hora?.slice(0, 5)}</span>
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                      {pago && (
                        <span className="text-[10px] font-bold text-white/40">
                          ${pago.monto_total} · {pago.estatus}
                        </span>
                      )}
                    </div>
                    <h4 className="text-white text-lg font-bold font-headline">
                      Dr. {doc?.usuarios ? `${doc.usuarios.nombre} ${doc.usuarios.apellidos}` : "—"}
                    </h4>
                    {especialidad && (
                      <p className="text-xs text-cyan-300 font-semibold uppercase tracking-widest">{especialidad}</p>
                    )}
                    
                    {/* Sección de Reembolsos / Cancelaciones */}
                    {cita.estado === "cancelada" && (
                      <div className="mt-2 flex flex-col gap-2 max-w-md">
                        {cita.cancelaciones?.[0]?.motivo && (
                          <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 leading-relaxed">
                            <strong className="block text-[10px] uppercase tracking-wider text-red-400 mb-0.5">Motivo:</strong>
                            {cita.cancelaciones[0].motivo}
                          </p>
                        )}
                        {cita.cancelaciones?.[0]?.reembolsos && cita.cancelaciones[0].reembolsos.length > 0 ? (
                          <span className="self-start inline-block text-[10px] font-bold px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md">
                            Aplica Reembolso
                          </span>
                        ) : (
                          cita.cancelaciones && cita.cancelaciones.length > 0 && (
                            <span className="self-start inline-block text-[10px] font-bold px-2 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-md">
                              Penalización: Sin Reembolso (&lt; 24h)
                            </span>
                          )
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-white/50 text-xs mt-0.5">
                      <span className="material-symbols-outlined text-xs">location_on</span>
                      {con?.nombre || "—"}{con?.sucursales?.nombre && ` · ${con.sucursales.nombre}`}
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-3">
                  {(cita.estado === "pendiente" || cita.estado === "confirmada") && (
                    <Link
                      href={`/dashboard/paciente/citas/${cita.id}`}
                      className="px-5 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold hover:bg-red-500/20 transition-all text-center inline-block"
                    >
                      Ver Detalle / Cancelar
                    </Link>
                  )}
                  {cita.estado === "completada" && (
                    <Link
                      href="/dashboard/paciente/expediente"
                      className="px-5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold hover:bg-emerald-500/20 transition-all"
                    >
                      Ver Expediente
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
