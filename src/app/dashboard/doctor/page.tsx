"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function DoctorDashboard() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [doctorName, setDoctorName] = useState("Doctor");
  const [especialidad, setEspecialidad] = useState("");
  const [stats, setStats] = useState({ hoy: 0, pendientes: 0, completadas: 0, expedientes: 0 });
  const [citasHoy, setCitasHoy] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const hoy = new Date().toISOString().split("T")[0];

      // Cargar datos del doctor en paralelo
      const [usuarioRes, citasHoyRes, citasPendientesRes, completadasRes] = await Promise.all([
        supabase
          .from("usuarios")
          .select(`nombre, apellidos, doctores(especialidades(nombre))`)
          .eq("id", user.id)
          .single(),
        supabase
          .from("citas")
          .select(`
            id, fecha, hora, estado,
            paciente:pacientes!paciente_id(usuarios(nombre, apellidos)),
            consultorio:consultorios(nombre)
          `)
          .eq("doctor_id", user.id)
          .eq("fecha", hoy)
          .in("estado", ["pendiente", "confirmada"])
          .order("hora", { ascending: true }),
        supabase
          .from("citas")
          .select("id", { count: "exact", head: true })
          .eq("doctor_id", user.id)
          .in("estado", ["pendiente", "confirmada"]),
        supabase
          .from("citas")
          .select("id", { count: "exact", head: true })
          .eq("doctor_id", user.id)
          .eq("estado", "completada"),
      ]);

      if (usuarioRes.data) {
        const u = usuarioRes.data as any;
        setDoctorName(`${u.nombre} ${u.apellidos}`);
        const doc = Array.isArray(u.doctores) ? u.doctores[0] : u.doctores;
        setEspecialidad(doc?.especialidades?.nombre || "");
      }

      setCitasHoy(citasHoyRes.data || []);
      setStats({
        hoy: citasHoyRes.data?.length || 0,
        pendientes: citasPendientesRes.count || 0,
        completadas: completadasRes.count || 0,
        expedientes: 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  const formatHora = (h: string) => h?.slice(0, 5) || "--:--";

  const estadoColor = (estado: string) => {
    if (estado === "confirmada") return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
    if (estado === "pendiente") return "text-amber-300 bg-amber-500/10 border-amber-500/30";
    return "text-slate-400 bg-white/5 border-white/10";
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 pb-4 bg-[#002022]/80 backdrop-blur-xl border-b border-white/10 shadow-lg"
        style={{ paddingTop: "max(calc(env(safe-area-inset-top) + 1rem), 1.5rem)" }}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#00a3ad] font-headline">NexusSalud</h1>
          <p className="text-xs font-semibold text-[#00a3ad]/70 tracking-wide uppercase">Panel Médico</p>
        </div>
        <Link
          href="/"
          className="text-xs font-bold uppercase tracking-wider text-red-300 border border-red-300/40 px-3 py-2 rounded-full hover:bg-red-500/20 transition-colors"
        >
          Salir
        </Link>
      </header>

      <main className="pb-32 px-6 max-w-5xl mx-auto" style={{ paddingTop: "calc(env(safe-area-inset-top) + 5rem)" }}>
        {/* Greeting */}
        <section className="mb-8">
          <h2 className="text-4xl font-extrabold font-headline text-white tracking-tight">
            {loading ? "Cargando..." : `Hola, Dr. ${doctorName.split(" ")[0]}`}
          </h2>
          {especialidad && (
            <p className="text-[#00a3ad] font-semibold text-sm mt-1 uppercase tracking-widest">{especialidad}</p>
          )}
          <p className="text-white/60 mt-1">
            {loading ? "—" : `${stats.hoy} cita${stats.hoy !== 1 ? "s" : ""} programada${stats.hoy !== 1 ? "s" : ""} para hoy`}
          </p>
        </section>

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Hoy", val: stats.hoy, icon: "today", color: "text-cyan-400" },
            { label: "Pendientes", val: stats.pendientes, icon: "schedule", color: "text-amber-300" },
            { label: "Completadas", val: stats.completadas, icon: "check_circle", color: "text-emerald-400" },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-[1.5rem] p-4 flex flex-col items-center gap-1">
              <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
              <span className={`text-3xl font-black font-headline ${s.color}`}>
                {loading ? "—" : s.val}
              </span>
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Citas de hoy */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold font-headline text-white">Agenda de Hoy</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00a3ad] animate-pulse"></span>
              <span className="text-xs text-[#00a3ad] font-bold uppercase tracking-widest">En Vivo</span>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => <div key={n} className="h-16 bg-white/5 animate-pulse rounded-2xl" />)}
            </div>
          ) : citasHoy.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-4xl text-white/20 mb-2">event_available</span>
              <p className="text-white/40 text-sm">Sin citas para hoy</p>
            </div>
          ) : (
            <div className="space-y-3">
              {citasHoy.map((cita: any, i: number) => {
                const pac = cita.paciente;
                const con = cita.consultorio;
                const isFirst = i === 0;
                return (
                  <div
                    key={cita.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      isFirst
                        ? "bg-[#00a3ad]/10 border-[#00a3ad]/30"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center text-xs font-black ${
                        isFirst ? "bg-[#00a3ad]/20 text-[#00a3ad]" : "bg-white/5 text-white/60"
                      }`}>
                        {formatHora(cita.hora)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">
                          {pac?.usuarios ? `${pac.usuarios.nombre} ${pac.usuarios.apellidos}` : "Paciente"}
                        </h4>
                        <p className="text-xs text-white/50 mt-0.5">
                          {con?.nombre || "Consultorio"} · <span className={`font-semibold ${estadoColor(cita.estado).split(" ")[0]}`}>{cita.estado}</span>
                        </p>
                      </div>
                    </div>
                    {isFirst && (
                      <Link
                        href="/dashboard/doctor/consultas"
                        className="bg-[#00a3ad] hover:bg-[#00a3ad]/90 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg transition-all active:scale-95"
                      >
                        Atender
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Accesos Rápidos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: "/dashboard/doctor/agenda", icon: "calendar_month", label: "Mi Agenda", desc: "Todas mis citas", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
            { href: "/dashboard/doctor/consultas", icon: "stethoscope", label: "Registrar Consulta", desc: "Capturar motivo y receta", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
            { href: "/dashboard/doctor/expedientes", icon: "folder_shared", label: "Expedientes", desc: "Historial de pacientes", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group p-5 rounded-[1.5rem] border ${item.bg} hover:scale-[1.02] transition-all`}
            >
              <span className={`material-symbols-outlined text-3xl ${item.color} mb-3 block`}>{item.icon}</span>
              <h4 className="font-bold text-white font-headline mb-0.5">{item.label}</h4>
              <p className="text-xs text-white/50">{item.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
