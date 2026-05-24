"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function DoctorExpedientes() {
  const supabase = createClient();
  const [expedientes, setExpedientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const fetchExpedientes = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Cargar expedientes de pacientes que han tenido citas con este doctor (usando admin client para saltar RLS en citas de otros doctores)
    const res = await fetch(`/api/doctor/expedientes?doctorId=${user.id}`);
    const result = await res.json();

    if (!result.success) {
      console.error("Error al cargar expedientes:", result.error);
      setLoading(false);
      return;
    }

    const data = result.expedientes;

    // Deduplicar por paciente_id y mapear a la estructura que espera la vista
    const seen = new Set<string>();
    const unique = (data || [])
      .filter((c: any) => {
        if (seen.has(c.paciente_id)) return false;
        seen.add(c.paciente_id);
        return true;
      })
      .map((c: any) => {
        const pacRaw = c.paciente || {};
        const usrRaw = pacRaw.usuarios || {};
        const expRaw = pacRaw.expedientes || {};
        
        return {
          paciente_id: c.paciente_id,
          paciente: {
            id: usrRaw.id,
            nombre: usrRaw.nombre,
            apellidos: usrRaw.apellidos,
            telefono: usrRaw.telefono,
            correo: usrRaw.correo,
            pacientes: {
              fecha_nacimiento: pacRaw.fecha_nacimiento
            },
            expedientes: [
              {
                expedientes: {
                  id: expRaw.id,
                  consultas: expRaw.consultas || []
                }
              }
            ]
          }
        };
      });

    setExpedientes(unique);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchExpedientes(); }, [fetchExpedientes]);

  const filtrado = expedientes.filter((e: any) => {
    const nombre = `${e.paciente?.nombre} ${e.paciente?.apellidos}`.toLowerCase();
    return nombre.includes(busqueda.toLowerCase());
  });

  const calcEdad = (fechaNac?: string) => {
    if (!fechaNac) return "—";
    const birth = new Date(fechaNac);
    const hoy = new Date();
    let edad = hoy.getFullYear() - birth.getFullYear();
    if (hoy.getMonth() < birth.getMonth() || (hoy.getMonth() === birth.getMonth() && hoy.getDate() < birth.getDate())) edad--;
    return `${edad} años`;
  };

  const formatFecha = (iso: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
  };

  return (
    <>
      <header
        className="w-full sticky top-0 z-50 backdrop-blur-xl flex justify-between items-center px-6 pb-4 bg-[#002022]/80 border-b border-white/10 shadow-lg"
        style={{ paddingTop: "max(calc(env(safe-area-inset-top) + 1rem), 1.5rem)" }}
      >
        <div className="flex items-center gap-4">
          <Link href="/dashboard/doctor" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors text-white">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <span className="text-lg font-bold text-white font-headline tracking-tight">Expedientes de Pacientes</span>
        </div>
        <button type="button" onClick={fetchExpedientes} className="text-[#00a3ad] p-2 rounded-full hover:bg-white/10 transition-all">
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-6 pb-32 space-y-6">
        {/* Buscador */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30">search</span>
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-white placeholder-slate-500 outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          />
        </div>

        <div className="flex items-center gap-2">
          <h2 className="font-headline text-xl font-bold text-white">Mis Pacientes</h2>
          <span className="px-2.5 py-1 bg-[#00a3ad]/10 text-[#00a3ad] text-xs font-bold rounded-full border border-[#00a3ad]/20">
            {filtrado.length}
          </span>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => <div key={n} className="h-20 bg-white/5 animate-pulse rounded-[1.5rem]" />)}
          </div>
        ) : filtrado.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-[2rem] border border-white/10">
            <span className="material-symbols-outlined text-5xl text-white/20">folder_open</span>
            <p className="text-white/50 mt-2">
              {busqueda ? "Sin resultados para tu búsqueda." : "No hay expedientes disponibles aún."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtrado.map((item: any) => {
              const pac = item.paciente as any;
              const pacData = pac?.pacientes?.[0] || pac?.pacientes;
              const fechaNac = pacData?.fecha_nacimiento;
              const expList = pac?.expedientes?.[0]?.expedientes || [];
              const consultas = expList?.[0]?.consultas || expList?.consultas || [];
              const isExpanded = expanded === item.paciente_id;

              return (
                <div
                  key={item.paciente_id}
                  className="bg-white/5 border border-white/10 rounded-[1.5rem] overflow-hidden"
                >
                  {/* Cabecera del paciente */}
                  <div
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all"
                    onClick={() => setExpanded(isExpanded ? null : item.paciente_id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#00a3ad]/10 border border-[#00a3ad]/20 flex items-center justify-center text-[#00a3ad]">
                        <span className="material-symbols-outlined">person</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-white font-headline">
                          {pac ? `${pac.nombre} ${pac.apellidos}` : "Paciente"}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-white/40 mt-0.5">
                          {pac?.telefono && <span>{pac.telefono}</span>}
                          <span>{pac?.telefono ? "· " : ""}{Array.isArray(consultas) ? consultas.length : 0} consulta{Array.isArray(consultas) && consultas.length !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`material-symbols-outlined text-white/30 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                      expand_more
                    </span>
                  </div>

                  {/* Historial de consultas expandido */}
                  {isExpanded && (
                    <div className="border-t border-white/10 p-5 space-y-3 bg-black/10">
                      <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-3">
                        Historial de Consultas — {Array.isArray(consultas) ? consultas.length : 0} registros
                      </p>
                      {Array.isArray(consultas) && consultas.length === 0 ? (
                        <p className="text-white/30 text-sm">Sin consultas registradas para este paciente.</p>
                      ) : (
                        Array.isArray(consultas) && consultas.map((c: any) => (
                          <div key={c.id} className="bg-white/5 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between items-start">
                              <p className="text-[10px] font-bold text-[#00a3ad] uppercase tracking-widest">
                                {formatFecha(c.fecha_hora)}
                              </p>
                              {c.citas?.doctor?.usuarios && (
                                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[12px]">stethoscope</span>
                                  Dr. {c.citas.doctor.usuarios.nombre} {c.citas.doctor.usuarios.apellidos}
                                </p>
                              )}
                            </div>
                            {c.motivo && (
                              <p className="text-sm text-white/80"><span className="font-bold text-white/50">Motivo:</span> {c.motivo}</p>
                            )}
                            {c.receta && (
                              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                                <p className="text-[10px] text-emerald-300 uppercase font-bold mb-1">Receta</p>
                                <p className="text-xs text-white/70">{c.receta}</p>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
