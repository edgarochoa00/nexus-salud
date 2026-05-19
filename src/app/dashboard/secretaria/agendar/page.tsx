import React from "react";
import Link from "next/link";

export default function SpecialtySelection() {
  const specialties = [
    { name: "Cardiología", desc: "Corazón y circulatorio", icon: "cardiology", link: "/dashboard/secretaria/agendar/doctor" },
    { name: "Pediatría", desc: "Salud infantil", icon: "child_care", link: "/dashboard/secretaria/agendar/doctor" },
    { name: "Dermatología", desc: "Cuidado de la piel", icon: "dermatology", link: "/dashboard/secretaria/agendar/doctor" },
    { name: "Ginecología", desc: "Salud reproductiva", icon: "female", link: "/dashboard/secretaria/agendar/doctor" },
    { name: "Odontología", desc: "Cuidado dental", icon: "dentistry", link: "/dashboard/secretaria/agendar/doctor" },
    { name: "Más", desc: "Ver todas", icon: "grid_view", link: "/dashboard/secretaria/agendar/especialidades" },
  ];

  return (
    <main className="relative pt-safe-24 pb-32 px-6 max-w-2xl mx-auto">
      {/* Progress Stepper */}
      <div className="mb-8 flex flex-col items-center">
        <span className="text-[var(--color-primary-container)] font-headline font-extrabold tracking-widest text-xs uppercase mb-2">
          Paso 1 de 4
        </span>
        <div className="flex gap-2 w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="w-1/4 h-full bg-[var(--color-primary-container)] shadow-[0_0_12px_rgba(0,163,173,0.6)]"></div>
          <div className="w-1/4 h-full bg-white/5"></div>
          <div className="w-1/4 h-full bg-white/5"></div>
          <div className="w-1/4 h-full bg-white/5"></div>
        </div>
      </div>

      {/* Header Section */}
      <section className="mb-10 text-center">
        <h2 className="font-headline text-4xl font-extrabold text-white mb-3 tracking-tight leading-tight">
          ¿Para quién es la <span className="text-[var(--color-primary-container)]">cita</span>?
        </h2>
        <div className="max-w-md mx-auto mb-8 text-left mt-6">
          <label className="text-xs font-bold text-[var(--color-primary-container)] uppercase tracking-widest mb-2 block">Paciente</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40">search</span>
            <input 
              type="text" 
              placeholder="Buscar paciente por nombre o ID..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all backdrop-blur-md"
            />
          </div>
        </div>
      </section>

      {/* Specialty Grid */}
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {specialties.map((spec) => (
          <Link 
            key={spec.name} 
            href={spec.link}
            className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] shadow-[inset_1px_1px_0_rgba(255,255,255,0.15)] p-6 rounded-[2.5rem] flex flex-col items-center text-center transition-all duration-300 group hover:bg-white/10 hover:-translate-y-1 hover:border-white/20"
          >
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-container)]/20 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300">
              <span 
                className="material-symbols-outlined text-[var(--color-primary-container)] text-4xl" 
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {spec.icon}
              </span>
            </div>
            <h3 className="font-headline font-bold text-white text-lg">{spec.name}</h3>
            <p className="text-xs text-[#bcc9ca] mt-1">{spec.desc}</p>
          </Link>
        ))}
      </div>

      {/* Secondary Action */}
      <div className="mt-12 text-center">
        <Link href="/dashboard/secretaria/agendar/doctor" className="block w-full py-5 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-container)] text-white font-headline font-bold text-lg shadow-[0_20px_40px_-10px_rgba(0,105,112,0.4)] hover:scale-[1.02] active:scale-95 transition-all">
          Continuar
        </Link>
        <p className="mt-6 text-sm text-[#bcc9ca] font-medium hover:text-[var(--color-primary-container)] transition-colors">
          ¿Necesitas volver al panel principal?
          <Link href="/dashboard/secretaria" className="ml-1 underline underline-offset-4">
            Cancelar
          </Link>
        </p>
      </div>
    </main>
  );
}
