"use client";

import React, { useState } from "react";
import Link from "next/link";

const especialidades = ["Cardiología", "Pediatría", "Dermatología", "Neurología", "Ginecología"];

export default function AdminRegistroDoctores() {
  const [selectedEsp, setSelectedEsp] = useState("Cardiología");
  const [showPass, setShowPass] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <>
      <header className="safe-header bg-cyan-950/40 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
        <div className="flex items-center justify-between px-6 h-16 w-full">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin" className="text-cyan-400 active:scale-95 transition-transform hover:bg-white/10 p-2 rounded-full">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <h1 className="font-headline font-bold text-lg tracking-tight text-white">Registro de Doctores</h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-safe-24 pb-32 px-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Context Hero */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 text-cyan-400 w-fit" style={{ background: "rgba(0,163,173,0.1)", backdropFilter: "blur(24px)" }}>
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Portal Administrativo</span>
            </div>
            <h2 className="text-4xl font-headline font-extrabold text-white leading-tight">
              Expanda su <span className="text-[#00a3ad]">equipo médico</span>
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed font-light">
              Añada nuevos profesionales a la red de NexusSalud manteniendo los más altos estándares de seguridad y precisión digital.
            </p>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <div className="p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#006970]/20 rounded-full blur-[80px]"></div>
              {success && (
                <div className="mb-4 bg-green-500/20 border border-green-500/40 text-green-300 text-sm font-semibold px-4 py-3 rounded-2xl text-center">
                  ✓ Profesional registrado exitosamente
                </div>
              )}
              <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[{ label: "Nombre", placeholder: "Ej. Ricardo" }, { label: "Apellido", placeholder: "Ej. Milla" }].map((f) => (
                    <div key={f.label} className="space-y-2">
                      <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">{f.label}</label>
                      <input
                        className="w-full px-5 py-4 rounded-2xl text-white placeholder-slate-500 outline-none focus:border-[#00a3ad]"
                        placeholder={f.placeholder}
                        type="text"
                        style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.3s ease" }}
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">Teléfono</label>
                    <input className="w-full px-5 py-4 rounded-2xl text-white placeholder-slate-500 outline-none" placeholder="+52 000 000 0000" type="tel" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">Edad</label>
                    <input className="w-full px-5 py-4 rounded-2xl text-white placeholder-slate-500 outline-none" placeholder="35" type="number" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">Contraseña</label>
                  <div className="relative">
                    <input className="w-full px-5 py-4 rounded-2xl text-white placeholder-slate-500 outline-none" placeholder="••••••••" type={showPass ? "text" : "password"} style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)" }} />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-cyan-400 transition-colors">
                      {showPass ? "visibility_off" : "visibility"}
                    </button>
                  </div>
                </div>

                {/* Specialty Selector */}
                <div className="space-y-4 pt-2">
                  <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">Asignación de Especialidad</label>
                  <div className="flex flex-wrap gap-2">
                    {especialidades.map((esp) => (
                      <button
                        key={esp}
                        type="button"
                        onClick={() => setSelectedEsp(esp)}
                        className="px-5 py-2.5 rounded-full text-xs font-bold transition-all active:scale-95"
                        style={selectedEsp === esp
                          ? { background: "rgba(0,163,173,0.1)", border: "1px solid rgba(0,204,217,0.3)", color: "#67e8f9", backdropFilter: "blur(24px)" }
                          : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }
                        }
                      >
                        {esp}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <button type="submit" className="w-full bg-[#00a3ad] text-white font-headline font-extrabold py-5 rounded-2xl shadow-[0_10px_30px_rgba(0,163,173,0.3)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group">
                    <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">person_add</span>
                    Registrar Profesional
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
