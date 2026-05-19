"use client";

"use client";

import React from "react";
import Link from "next/link";

const barHeights = ["h-3/5", "h-2/5", "h-4/5", "h-3/5", "h-full", "h-4/5", "h-2/5"];

export default function AdminDashboard() {
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
            className="text-xs font-bold uppercase tracking-wider text-red-300 border border-red-300/40 px-3 py-2 rounded-full hover:bg-red-500/20 transition-colors"
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
        <section className="mb-12">
          <h1 className="text-5xl font-extrabold text-white font-headline tracking-tight mb-2">Hola, Administrador</h1>
          <p className="text-slate-400 text-lg">Panel de gestión central</p>
        </section>

        {/* Bento Grid Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Hero: Total Citas */}
          <div className="lg:col-span-2 rounded-[2rem] p-8 flex flex-col justify-between min-h-[320px] shadow-2xl overflow-hidden relative group" style={{ background: "rgba(0,163,173,0.1)", backdropFilter: "blur(24px)", borderTop: "1px solid rgba(255,255,255,0.2)", borderLeft: "1px solid rgba(255,255,255,0.2)" }}>
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
              <span className="material-symbols-outlined text-cyan-400" style={{ fontSize: "96px" }}>calendar_month</span>
            </div>
            <div>
              <span className="text-cyan-300 font-semibold tracking-widest uppercase text-xs mb-2 block">Resumen de Actividad</span>
              <h2 className="text-white text-2xl font-bold mb-6">Total de Citas</h2>
              <div className="flex items-center gap-2 mb-8">
                <span className="text-4xl font-bold text-white font-headline">50</span>
                <span className="text-cyan-300/60 text-sm font-medium uppercase tracking-wider">Citas Totales</span>
              </div>
            </div>
            {/* Mini bar chart */}
            <div className="flex items-end gap-2 h-20">
              {barHeights.map((h, i) => (
                <div key={i} className={`w-full bg-cyan-400/20 rounded-t-lg ${h} transition-all hover:bg-cyan-400/40`}></div>
              ))}
            </div>
          </div>

          {/* Side Stats Stack */}
          <div className="flex flex-col gap-6">
            {[
              { label: "Citas por App", value: "40", icon: "smartphone", color: "bg-[#006970]/20 text-[#7df4ff]" },
              { label: "Citas por Secretaría", value: "10", icon: "support_agent", color: "bg-[#3a5f94]/20 text-[#a7c8ff]" },
              { label: "Citas Canceladas", value: "4", icon: "event_busy", color: "bg-red-900/20 text-red-400" },
            ].map((stat, i) => (
              <div key={i} className="rounded-[1.5rem] p-6 flex items-center justify-between group hover:bg-white/5 transition-all" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined">{stat.icon}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gestión de Consultorios Banner */}
        <div className="grid grid-cols-1 gap-8 mb-12">
          <Link href="/dashboard/admin/consultorios" className="relative group h-64 overflow-hidden rounded-[2.5rem] block">
            <img
              alt="Consultorio médico moderno"
              className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:scale-110 transition-transform duration-700"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUolgOFXNCNugD5xmCTjXkEGs2zWxdWa4EjD9NElm1tCBCz5KXbfu8VsVbKt9w3xxTkRhJ6zqP1A8LFWEhb8Uv4sis4SWv48OzxPrJEULojauGHIUTmAvThO4oAhJVYnTFZePMMB3aJia3xK_4w7Na1DNkQGEHNIGUFtYXyLfvGuKix4kDC7n1YQXWTiqj7w2MELttfG2cn_qM-d9gQzmwUt8-5XQ300Lae06rcdUlPHwufchV3Dqh0pJOAtRfQWEqDC7oDMZTavw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#002022] via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-10">
              <div className="w-14 h-14 rounded-2xl bg-[#006970]/30 backdrop-blur-md flex items-center justify-center text-white mb-4">
                <span className="material-symbols-outlined text-3xl">meeting_room</span>
              </div>
              <h3 className="text-3xl font-bold text-white font-headline mb-2">Gestión de Consultorios</h3>
              <p className="text-slate-300">Control de disponibilidad y asignación de espacios físicos.</p>
            </div>
            <button className="absolute top-8 right-8 w-12 h-12 rounded-full flex items-center justify-center text-white hover:bg-[#006970] transition-colors" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </Link>
        </div>
      </main>
    </>
  );
}
