"use client";

import React from "react";
import Link from "next/link";

export default function AdminAcerca() {
  return (
    <>
      <header className="safe-header bg-cyan-950/40 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
        <div className="flex items-center justify-between px-6 h-16 w-full">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin" className="text-cyan-400 active:scale-95 transition-transform hover:bg-white/10 p-2 rounded-full">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <h1 className="font-headline font-bold text-lg tracking-tight text-white">Acerca de NexusSalud</h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-safe-24 pb-32 px-6 max-w-2xl mx-auto space-y-8">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center text-center py-8">
          <div className="w-20 h-20 rounded-3xl bg-[#00a3ad]/20 border border-[#00a3ad]/30 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[#00a3ad]" style={{ fontSize: "40px" }}>local_hospital</span>
          </div>
          <h2 className="text-3xl font-extrabold font-headline text-white mb-2">NexusSalud</h2>
          <p className="text-[#00a3ad] font-semibold text-sm uppercase tracking-widest">Plataforma Médica Integral</p>
          <span className="mt-3 text-xs text-white/40 font-medium tracking-wider">Versión 2.4.0 · Build 2025</span>
        </div>

        {/* Info Cards */}
        <div className="space-y-4">
          {[
            { icon: "shield", title: "Seguridad de datos", desc: "Cifrado AES-256 y cumplimiento con normativas de salud HIPAA y NOM-004." },
            { icon: "devices", title: "Multiplataforma", desc: "Disponible en iOS, Android y Web. Sincronización en tiempo real entre dispositivos." },
            { icon: "support", title: "Soporte técnico", desc: "Atención 24/7 para usuarios premium. Canal de soporte: soporte@nexussalud.com" },
            { icon: "update", title: "Actualizaciones", desc: "Actualizaciones automáticas para garantizar la última versión del sistema siempre disponible." },
          ].map((item, i) => (
            <div key={i} className="rounded-[1.5rem] p-5 flex items-start gap-4" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="w-12 h-12 rounded-2xl bg-[#00a3ad]/20 flex items-center justify-center text-[#00a3ad] shrink-0">
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer legal */}
        <div className="text-center pt-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-white/20"></div>
            <span className="material-symbols-outlined text-white/40 text-sm">security</span>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-white/20"></div>
          </div>
          <p className="text-[10px] text-white/30 tracking-widest uppercase">© 2025 NexusSalud · Todos los derechos reservados</p>
        </div>
      </main>
    </>
  );
}
