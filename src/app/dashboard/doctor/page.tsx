"use client";

import React from "react";
import Link from "next/link";

const consultasHoy = [
  { time: "09:30", patient: "Ana García Méndez", sala: "Sala 04", active: true },
  { time: "10:15", patient: "Carlos Ruiz", sala: "Sala 02", active: false },
  { time: "11:00", patient: "Elena Soler", sala: "Sala 05", active: false },
];

const proximasCitas = [
  { label: "Mañana, 14 Mayo", title: "Reunión de Staff Médico", detail: "08:00 AM - Auditorio B", active: true },
  { label: "Jueves, 16 Mayo", title: "Cirugía Programada", detail: "10:30 AM - Quirófano 1", active: false },
];

const expedientesRecientes = [
  { patient: "Jorge Valdivia", id: "#88291-JV", tag: "Urgencias", time: "Hace 2h" },
  { patient: "Sofía Martínez", id: "#99012-SM", tag: "Rutina", time: "Ayer" },
  { patient: "Roberto Gómez", id: "#11203-RG", tag: "Resultados", time: "Ayer" },
];

export default function DoctorDashboard() {
  return (
    <>
      {/* TopAppBar */}
      <header 
        className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 pb-4 bg-black/20 backdrop-blur-xl border-b border-white/10 shadow-lg"
        style={{ paddingTop: 'max(calc(env(safe-area-inset-top) + 1rem), 1.5rem)' }}
      >
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#00a3ad] font-headline">NexusSalud</h1>
            <p className="text-xs font-semibold text-[#00a3ad]/80 tracking-wide uppercase">Panel de Control</p>
          </div>
        </div>
        <Link
          href="/"
          className="text-xs font-bold uppercase tracking-wider text-red-300 border border-red-300/40 px-3 py-2 rounded-full hover:bg-red-500/20 transition-colors"
        >
          Salir
        </Link>
      </header>

      <main className="pt-safe-28 pb-32 px-6 max-w-7xl mx-auto">
        {/* Hero Greeting */}
        <section className="mb-10">
          <h2 className="text-4xl font-extrabold font-headline text-white mb-2 tracking-tight">Hola, Dr. Juan</h2>
          <p className="text-white/70 max-w-md">Tienes {consultasHoy.length} consultas programadas para hoy.</p>
        </section>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Consultas de hoy: Large Card */}
          <div className="md:col-span-8 bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl" style={{ boxShadow: "inset 1px 1px 0px rgba(255,255,255,0.1)" }}>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h3 className="text-xl font-bold font-headline text-[#00a3ad] mb-1">Consultas de hoy</h3>
                <p className="text-sm text-white/50">Estado actual de la clínica</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[#00a3ad]/20 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#00a3ad] animate-pulse"></span>
              </div>
            </div>
            <div className="space-y-4">
              {consultasHoy.map((c, i) => (
                <div key={i} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${c.active ? "bg-[#00a3ad]/20 text-[#00a3ad]" : i === 1 ? "bg-white/10 text-white/70" : "bg-white/5 text-white/30"}`}>
                      {c.time}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{c.patient}</h4>
                      <p className="text-xs text-white/60 font-medium">{c.sala}</p>
                    </div>
                  </div>
                  {c.active ? (
                    <Link href="/dashboard/doctor/consultas" className="bg-[#00a3ad] hover:bg-[#00a3ad]/90 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg transition-transform active:scale-95">
                      Atender
                    </Link>
                  ) : (
                    <span className="text-xs font-bold text-white/40 px-4">Esperando...</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Próximas Citas: Side Card */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 flex-1 shadow-2xl" style={{ boxShadow: "inset 1px 1px 0px rgba(255,255,255,0.1)" }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold font-headline text-white">Próximas Citas</h3>
                <span className="material-symbols-outlined text-[#00a3ad]">calendar_today</span>
              </div>
              <div className="space-y-6">
                {proximasCitas.map((cita, i) => (
                  <div key={i} className={`relative pl-6 border-l-2 ${cita.active ? "border-[#00a3ad]/30" : "border-white/20"}`}>
                    <div className={`absolute -left-[5px] top-0 w-2 h-2 rounded-full ${cita.active ? "bg-[#00a3ad]" : "bg-white/30"}`}></div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${cita.active ? "text-[#00a3ad]" : "text-white/40"}`}>{cita.label}</p>
                    <h4 className="font-bold text-sm text-white">{cita.title}</h4>
                    <p className="text-xs text-white/60">{cita.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Expedientes Recientes: Full Width Card */}
          <div className="md:col-span-12 bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 mt-2 shadow-2xl" style={{ boxShadow: "inset 1px 1px 0px rgba(255,255,255,0.1)" }}>
            <h3 className="text-xl font-bold font-headline text-white mb-8">Expedientes Recientes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {expedientesRecientes.map((exp, i) => (
                <Link key={i} href="/dashboard/doctor/expedientes" className="group p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-2xl bg-[#00a3ad]/20 flex items-center justify-center text-[#00a3ad] mb-4 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">folder_shared</span>
                  </div>
                  <h4 className="font-bold text-white mb-1">{exp.patient}</h4>
                  <p className="text-[11px] text-white/50 font-medium mb-3 uppercase tracking-wider">ID: {exp.id}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] bg-white/10 px-2 py-1 rounded-md font-bold text-[#00a3ad] uppercase">{exp.tag}</span>
                    <span className="text-[10px] text-white/40">{exp.time}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
