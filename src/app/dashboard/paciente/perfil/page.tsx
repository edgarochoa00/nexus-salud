"use client";

import React from "react";
export default function PerfilPaciente() {
  const handleAbout = () => {
    window.alert("NexusSalud conecta pacientes, doctores y sedes médicas en una sola plataforma.");
  };

  return (
    <main className="pt-safe-24 pb-32 px-6 max-w-2xl mx-auto space-y-8 relative z-10 w-full">
      {/* Top Navigation - Adding specific title */}
      <div className="mb-4">
        <h1 className="font-headline font-bold text-3xl tracking-tight text-white">Mi Perfil</h1>
      </div>

      {/* User Section */}
      <section className="flex flex-col items-center text-center">
        <div className="space-y-1 mt-4">
          <h2 className="font-headline font-extrabold text-3xl tracking-tight text-white">Juan Pérez</h2>
          <p className="font-label text-sm font-semibold uppercase tracking-widest text-[var(--color-primary-container)]">ID: NS-99283</p>
          <span className="inline-block px-4 py-1.5 mt-2 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 text-xs font-medium text-white/90 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
            Paciente Premium
          </span>
        </div>
      </section>

      {/* Menu Options: Bento Glass Grid */}
      <section className="grid grid-cols-1 gap-4">
        {/* Datos Personales */}
        <button
          type="button"
          onClick={() => window.alert("Puedes actualizar tus datos en ventanilla mientras se habilita la edición en app.")}
          className="w-full text-left bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-5 flex items-center justify-between hover:bg-white/20 transition-all duration-300 active:scale-[0.98] group shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-container)]/20 flex items-center justify-center text-[var(--color-primary-container)]">
              <span className="material-symbols-outlined">account_circle</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">Datos Personales</h3>
              <p className="text-xs text-white/60">Información básica y contacto</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-white/40 group-hover:text-[var(--color-primary-container)] transition-colors">chevron_right</span>
        </button>

        {/* Acerca de */}
        <button
          type="button"
          onClick={handleAbout}
          className="w-full text-left bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-5 flex items-center justify-between hover:bg-white/20 transition-all duration-300 active:scale-[0.98] group shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white/70">
              <span className="material-symbols-outlined">info</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">Acerca de NexusSalud</h3>
              <p className="text-xs text-white/60">Información de la plataforma</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-white/40 group-hover:text-[var(--color-primary-container)] transition-colors">chevron_right</span>
        </button>

      </section>
    </main>
  );
}
