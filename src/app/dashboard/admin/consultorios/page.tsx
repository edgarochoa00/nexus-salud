"use client";

import React from "react";
import Link from "next/link";

const consultorios = [
  { id: "C-01", name: "Consultorio 1", doctor: "Dr. Juan Pérez", spec: "Cardiología", status: "Ocupado", statusColor: "text-red-400 bg-red-900/20 border-red-500/30" },
  { id: "C-02", name: "Consultorio 2", doctor: "Dra. Ana López", spec: "Dermatología", status: "Disponible", statusColor: "text-green-400 bg-green-900/20 border-green-500/30" },
  { id: "C-03", name: "Consultorio 3", doctor: "Dr. Carlos Ruiz", spec: "Pediatría", status: "En descanso", statusColor: "text-yellow-400 bg-yellow-900/20 border-yellow-500/30" },
  { id: "C-04", name: "Sala de Urgencias", doctor: "Dr. Roberto Gómez", spec: "Urgencias", status: "Ocupado", statusColor: "text-red-400 bg-red-900/20 border-red-500/30" },
];

export default function AdminConsultorios() {
  return (
    <>
      <header className="safe-header bg-cyan-950/40 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
        <div className="flex items-center justify-between px-6 h-16 w-full">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin" className="text-cyan-400 active:scale-95 transition-transform hover:bg-white/10 p-2 rounded-full">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <h1 className="font-headline font-bold text-lg tracking-tight text-white">Gestión de Consultorios</h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-safe-24 pb-32 px-6 max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-extrabold font-headline text-white">Espacios Físicos</h2>
            <p className="text-slate-400 text-sm">Control de disponibilidad en tiempo real</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-widest">En vivo</span>
          </div>
        </div>

        <div className="space-y-4">
          {consultorios.map((c) => (
            <div key={c.id} className="rounded-[1.5rem] p-5 flex items-center justify-between transition-all hover:bg-white/5" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#006970]/20 flex flex-col items-center justify-center border border-white/10">
                  <span className="material-symbols-outlined text-[#00a3ad]">meeting_room</span>
                  <span className="text-[10px] text-white/50 font-bold">{c.id}</span>
                </div>
                <div>
                  <h3 className="font-bold text-white font-headline">{c.name}</h3>
                  <p className="text-sm text-white/60">{c.doctor} · {c.spec}</p>
                </div>
              </div>
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${c.statusColor}`}>{c.status}</span>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
