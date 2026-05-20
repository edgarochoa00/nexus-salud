"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function ExpedienteMedico() {
  const supabase = createClient();
  const [paciente, setPaciente] = useState<any>(null);
  const [consultas, setConsultas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Cargar datos del paciente
      const { data: userData } = await supabase
        .from("usuarios")
        .select("nombre, apellidos, telefono, correo, pacientes(fecha_nacimiento)")
        .eq("id", user.id)
        .single();

      if (userData) setPaciente(userData);

      // Cargar expediente y consultas
      const { data: expData } = await supabase
        .from("expedientes")
        .select(`
          id,
          consultas(
            id,
            fecha_hora,
            motivo,
            receta,
            citas(
              fecha,
              hora,
              doctor:usuarios!doctor_id(nombre, apellidos, doctores(especialidades(nombre))),
              consultorio:consultorios(nombre, sucursales(nombre))
            )
          )
        `)
        .eq("paciente_id", user.id)
        .single();

      if (expData?.consultas) {
        // Ordenar consultas por fecha descendente
        const sorted = [...expData.consultas].sort(
          (a: any, b: any) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime()
        );
        setConsultas(sorted);
      }

      setLoading(false);
    }
    load();
  }, []);

  const calcEdad = (fechaNac?: string) => {
    if (!fechaNac) return "—";
    const birth = new Date(fechaNac);
    const hoy = new Date();
    let edad = hoy.getFullYear() - birth.getFullYear();
    if (hoy.getMonth() < birth.getMonth() || (hoy.getMonth() === birth.getMonth() && hoy.getDate() < birth.getDate())) {
      edad--;
    }
    return `${edad} años`;
  };

  const formatFecha = (iso: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("es-MX", {
      day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  const pacData = paciente as any;
  const fechaNac = pacData?.pacientes?.[0]?.fecha_nacimiento || pacData?.pacientes?.fecha_nacimiento;

  return (
    <main className="pb-32 px-5 max-w-lg mx-auto space-y-8 relative z-10 w-full" style={{ paddingTop: "1.5rem" }}>
      <div className="mb-6">
        <h1 className="font-headline font-bold text-3xl tracking-tight text-white mb-1">Expediente Médico</h1>
        <p className="text-white/50 text-sm">Tu historial de consultas y datos personales.</p>
      </div>

      {/* Datos Personales */}
      <section className="space-y-3">
        <h2 className="font-headline font-extrabold text-white text-xl tracking-wide px-1">Datos Personales</h2>
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[24px] p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((n) => <div key={n} className="h-8 bg-white/5 animate-pulse rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Nombre completo</span>
                <p className="text-white font-bold text-lg font-headline mt-0.5">
                  {pacData ? `${pacData.nombre} ${pacData.apellidos}` : "—"}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-cyan-400 mb-0.5">
                  <span className="material-symbols-outlined text-sm">cake</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest">Edad</span>
                </div>
                <p className="text-white font-semibold">{calcEdad(fechaNac)}</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-cyan-400 mb-0.5">
                  <span className="material-symbols-outlined text-sm">event</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest">Nacimiento</span>
                </div>
                <p className="text-white font-semibold text-sm">
                  {fechaNac ? new Date(fechaNac + "T00:00").toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" }) : "—"}
                </p>
              </div>
              {pacData?.telefono && (
                <div>
                  <div className="flex items-center gap-1.5 text-cyan-400 mb-0.5">
                    <span className="material-symbols-outlined text-sm">call</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest">Teléfono</span>
                  </div>
                  <p className="text-white font-semibold text-sm">{pacData.telefono}</p>
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5 text-cyan-400 mb-0.5">
                  <span className="material-symbols-outlined text-sm">mail</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest">Correo</span>
                </div>
                <p className="text-white/70 font-semibold text-xs">{pacData?.correo || "—"}</p>
              </div>
              <div className="col-span-2 pt-4 border-t border-white/10">
                <div className="flex items-center gap-1.5 text-cyan-400 mb-1">
                  <span className="material-symbols-outlined text-sm">folder_shared</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest">Total de consultas</span>
                </div>
                <p className="text-white font-black text-2xl font-headline">{consultas.length}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Historial de Consultas */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <h2 className="font-headline font-extrabold text-white text-xl tracking-wide">Historial</h2>
          <Link href="/dashboard/paciente/citas" className="text-xs font-bold text-cyan-400 uppercase tracking-wider hover:opacity-80 transition-opacity">
            Ver citas →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => <div key={n} className="h-24 bg-white/5 animate-pulse rounded-[1.5rem]" />)}
          </div>
        ) : consultas.length === 0 ? (
          <div className="text-center py-12 bg-white/5 border border-white/10 rounded-[1.5rem]">
            <span className="material-symbols-outlined text-4xl text-white/20">stethoscope</span>
            <p className="text-white/40 text-sm mt-2">Aún no tienes consultas registradas.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {consultas.map((consulta: any) => {
              const cita = consulta.citas;
              const doc = cita?.doctor;
              const con = cita?.consultorio;
              const espInfo = doc?.doctores?.[0]?.especialidades || doc?.doctores?.especialidades;
              const especialidad = espInfo?.nombre;
              const isExpanded = expandedId === consulta.id;

              return (
                <div
                  key={consulta.id}
                  className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] overflow-hidden cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : consulta.id)}
                >
                  <div className="p-5 flex gap-4 items-start hover:bg-white/5 transition-all">
                    <div className="bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-2xl shrink-0">
                      <span className="material-symbols-outlined text-cyan-400">stethoscope</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="text-[11px] font-bold text-cyan-300 uppercase tracking-widest mb-0.5">
                            {formatFecha(consulta.fecha_hora)}
                          </p>
                          <h3 className="text-white font-bold font-headline">
                            Dr. {doc ? `${doc.nombre} ${doc.apellidos}` : "—"}
                          </h3>
                          {especialidad && (
                            <p className="text-white/50 text-xs font-semibold uppercase tracking-wide">{especialidad}</p>
                          )}
                        </div>
                        <span className={`material-symbols-outlined text-white/30 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                          expand_more
                        </span>
                      </div>
                      {consulta.motivo && (
                        <p className="text-white/60 text-sm mt-2 italic line-clamp-2">"{consulta.motivo}"</p>
                      )}
                    </div>
                  </div>

                  {/* Expandido: receta y detalles */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
                      {con && (
                        <div>
                          <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Consultorio</span>
                          <p className="text-white/70 text-sm mt-0.5">
                            {con.nombre}{con.sucursales?.nombre && ` · ${con.sucursales.nombre}`}
                          </p>
                        </div>
                      )}
                      {consulta.motivo && (
                        <div>
                          <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Motivo</span>
                          <p className="text-white/80 text-sm mt-0.5">{consulta.motivo}</p>
                        </div>
                      )}
                      {consulta.receta && (
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-emerald-400 text-sm">medication</span>
                            <span className="text-[10px] text-emerald-300 uppercase font-bold tracking-widest">Receta / Indicaciones</span>
                          </div>
                          <p className="text-white/80 text-sm leading-relaxed">{consulta.receta}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
