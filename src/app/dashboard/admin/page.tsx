"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function AdminDashboard() {
  const supabase = createClient();
  const [stats, setStats] = useState({
    doctores: 0,
    asistentes: 0,
    admins: 0,
    sucursales: 0,
    consultorios: 0,
    asignaciones: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        // Ejecutar consultas en paralelo para máxima velocidad y eficiencia
        const [
          { count: docCount },
          { count: asisCount },
          { count: adminCount },
          { count: sucCount },
          { count: conCount },
          { count: asigCount },
        ] = await Promise.all([
          supabase.from("usuarios").select("*", { count: "exact", head: true }).eq("rol", "doctor"),
          supabase.from("usuarios").select("*", { count: "exact", head: true }).eq("rol", "secretaria"),
          supabase.from("usuarios").select("*", { count: "exact", head: true }).eq("rol", "admin"),
          supabase.from("sucursales").select("*", { count: "exact", head: true }),
          supabase.from("consultorios").select("*", { count: "exact", head: true }),
          supabase.from("doctor_consultorios").select("*", { count: "exact", head: true }),
        ]);

        setStats({
          doctores: docCount || 0,
          asistentes: asisCount || 0,
          admins: adminCount || 0,
          sucursales: sucCount || 0,
          consultorios: conCount || 0,
          asignaciones: asigCount || 0,
        });
      } catch (err) {
        console.error("Error al cargar estadísticas en tiempo real:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const bentoItems = [
    {
      title: "Alta de Doctores",
      desc: "Registra profesionales médicos, especialidades y precios de consulta.",
      icon: "medical_services",
      href: "/dashboard/admin/doctores",
      count: stats.doctores,
      countLabel: "Médicos activos",
      color: "from-cyan-500/20 to-teal-500/10 border-cyan-500/30 text-cyan-300",
      iconColor: "text-cyan-400",
    },
    {
      title: "Alta de Recepcionistas",
      desc: "Gestiona asistentes y personal de recepción asignados a clínicas.",
      icon: "support_agent",
      href: "/dashboard/admin/asistentes",
      count: stats.asistentes,
      countLabel: "Asistentes activos",
      color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-300",
      iconColor: "text-blue-400",
    },
    {
      title: "Alta de Administradores",
      desc: "Incorpora personal administrativo para control de sedes y finanzas.",
      icon: "admin_panel_settings",
      href: "/dashboard/admin/administradores",
      count: stats.admins,
      countLabel: "Administradores",
      color: "from-purple-500/20 to-fuchsia-500/10 border-purple-500/30 text-purple-300",
      iconColor: "text-purple-400",
    },
    {
      title: "Alta de Consultorios",
      desc: "Administra espacios físicos y consultorios dentro de cada sede.",
      icon: "meeting_room",
      href: "/dashboard/admin/consultorios",
      count: stats.consultorios,
      countLabel: "Consultorios",
      color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300",
      iconColor: "text-amber-400",
    },
    {
      title: "Alta de Sucursales",
      desc: "Añade y edita sedes físicas y clínicas de la red NexusSalud.",
      icon: "domain",
      href: "/dashboard/admin/sucursales",
      count: stats.sucursales,
      countLabel: "Sucursales/Sedes",
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300",
      iconColor: "text-emerald-400",
    },
    {
      title: "Asignación de Horarios",
      desc: "Agenda la disponibilidad semanal de médicos en consultorios.",
      icon: "calendar_month",
      href: "/dashboard/admin/asignaciones",
      count: stats.asignaciones,
      countLabel: "Turnos asignados",
      color: "from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-300",
      iconColor: "text-rose-400",
    },
  ];

  return (
    <>
      {/* TopAppBar */}
      <header 
        className="bg-cyan-950/40 backdrop-blur-xl text-cyan-400 sticky top-0 z-50 border-b border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] flex justify-between items-center w-full px-6 pb-4"
        style={{ paddingTop: 'max(calc(env(safe-area-inset-top) + 1rem), 1.5rem)' }}
      >
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold tracking-tight text-white font-headline">NexusSalud</span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-xs font-bold uppercase tracking-wider text-red-300 border border-red-300/40 px-4 py-2 rounded-full hover:bg-red-500/20 transition-colors"
          >
            Salir
          </Link>
          <button
            type="button"
            onClick={() => window.alert("No hay notificaciones nuevas.")}
            className="material-symbols-outlined text-white p-2 hover:bg-white/10 transition-colors rounded-full"
          >
            notifications
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-32">
        {/* Welcome */}
        <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl font-extrabold text-white font-headline tracking-tight mb-2">Panel Administrativo</h1>
            <p className="text-slate-400 text-lg">Control total de personal, sedes, consultorios y horarios de atención</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 w-fit">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-widest">Base de Datos Conectada</span>
          </div>
        </section>

        {/* Bento Grid Command Center */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bentoItems.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className={`group relative overflow-hidden rounded-[2rem] p-8 flex flex-col justify-between min-h-[260px] shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-950/20 border bg-gradient-to-br ${item.color}`}
              style={{ backdropFilter: "blur(24px)" }}
            >
              {/* Background glowing circle on hover */}
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/5 blur-2xl group-hover:bg-white/10 transition-colors duration-500"></div>
              
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300 ${item.iconColor}`}>
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                  </div>
                  <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 bg-white/5 border border-white/10 group-hover:bg-white/20 group-hover:text-white transition-all duration-300">
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>
                </div>
                
                <h3 className="text-2xl font-bold text-white font-headline mb-2 tracking-tight group-hover:text-white transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-300/80 text-sm leading-relaxed font-light mb-6">
                  {item.desc}
                </p>
              </div>

              <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                {loading ? (
                  <div className="w-16 h-6 bg-white/5 animate-pulse rounded-lg"></div>
                ) : (
                  <span className="text-3xl font-black text-white font-headline">{item.count}</span>
                )}
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{item.countLabel}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
