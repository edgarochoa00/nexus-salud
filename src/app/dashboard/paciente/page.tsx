import React from "react";
import Link from "next/link";

export default function PacienteDashboard() {
  return (
    <main className="relative pt-safe-24 pb-32 px-6 max-w-lg mx-auto">
      {/* Welcome Header */}
      <section className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-white font-headline text-3xl font-extrabold tracking-tight mb-1">
              Hola, Alejandro
            </h1>
            <p className="text-teal-100/80 font-medium">Bienvenido a NexusSalud</p>
          </div>
          <Link
            href="/"
            className="text-xs font-bold uppercase tracking-wider text-red-300 border border-red-300/40 px-3 py-2 rounded-full hover:bg-red-500/20 transition-colors"
          >
            Salir
          </Link>
        </div>
      </section>

      {/* Next Appointment Spotlight */}
      <section className="mb-10">
        <h2 className="text-white/70 text-sm font-bold uppercase tracking-widest mb-4">
          Próxima Cita
        </h2>
        <div className="bg-white/10 backdrop-blur-2xl rounded-[2rem] p-6 relative overflow-hidden group shadow-2xl border border-white/20">
          <div className="absolute top-0 right-0 p-4">
            <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse shadow-[0_0_12px_#5dd8e2]"></div>
          </div>
          <div className="flex gap-5 items-start">
            <div className="bg-[var(--color-primary)]/30 backdrop-blur-md p-4 rounded-2xl flex flex-col items-center justify-center min-w-[70px] border border-white/10">
              <span className="text-white font-headline font-extrabold text-2xl">24</span>
              <span className="text-teal-200 text-xs font-bold uppercase">OCT</span>
            </div>
            <div>
              <h3 className="text-white font-headline font-bold text-xl mb-1">
                Consulta General
              </h3>
              <p className="text-teal-100/90 text-sm flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[18px]">medical_services</span>
                Dr. Roberto Jiménez
              </p>
              <div className="flex gap-3">
                <span className="bg-white/10 px-3 py-1 rounded-full text-xs text-white border border-white/10 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">schedule</span> 10:30 AM
                </span>
                <span className="bg-white/10 px-3 py-1 rounded-full text-xs text-white border border-white/10 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">location_on</span> Torre A
                </span>
              </div>
            </div>
          </div>
          {/* Radiant Glow Border */}
          <div className="absolute inset-0 border-2 border-[var(--color-primary-container)]/40 rounded-[2rem] pointer-events-none"></div>
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="mb-10">
        <h2 className="text-white/70 text-sm font-bold uppercase tracking-widest mb-4">
          Acceso Rápido
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <Link href="/dashboard/paciente/agendar" className="bg-white/10 backdrop-blur-2xl aspect-square rounded-3xl flex flex-col items-center justify-center gap-2 p-2 hover:bg-white/20 transition-all active:scale-95 border border-white/20 shadow-[inset_1px_1px_0_rgba(255,255,255,0.2)]">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-container)]/20 flex items-center justify-center text-[#5dd8e2]">
              <span className="material-symbols-outlined text-3xl">event_upcoming</span>
            </div>
            <span className="text-[10px] text-white font-bold uppercase text-center leading-tight">
              Agendar<br/>Cita
            </span>
          </Link>
          <Link href="/dashboard/paciente/citas" className="bg-white/10 backdrop-blur-2xl aspect-square rounded-3xl flex flex-col items-center justify-center gap-2 p-2 hover:bg-white/20 transition-all active:scale-95 border border-white/20 shadow-[inset_1px_1px_0_rgba(255,255,255,0.2)]">
            <div className="w-12 h-12 rounded-2xl bg-[#9fc2fe]/20 flex items-center justify-center text-[#d5e3ff]">
              <span className="material-symbols-outlined text-3xl">calendar_month</span>
            </div>
            <span className="text-[10px] text-white font-bold uppercase text-center leading-tight">
              Mis<br/>Citas
            </span>
          </Link>
          <Link href="/dashboard/paciente/expediente" className="bg-white/10 backdrop-blur-2xl aspect-square rounded-3xl flex flex-col items-center justify-center gap-2 p-2 hover:bg-white/20 transition-all active:scale-95 border border-white/20 shadow-[inset_1px_1px_0_rgba(255,255,255,0.2)]">
            <div className="w-12 h-12 rounded-2xl bg-[#16a3a5]/20 flex items-center justify-center text-[#81f4f6]">
              <span className="material-symbols-outlined text-3xl">clinical_notes</span>
            </div>
            <span className="text-[10px] text-white font-bold uppercase text-center leading-tight">
              Mi<br/>Expediente
            </span>
          </Link>
        </div>
      </section>

      {/* Facility Carousel */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white/70 text-sm font-bold uppercase tracking-widest">
            Nuestra Clínica
          </h2>
          <Link href="/dashboard/paciente/perfil" className="text-teal-400 text-xs font-bold cursor-pointer hover:text-teal-300 transition-colors">Ver Mapa</Link>
        </div>
        
        {/* We use flex gap-4 overflow-x-auto to recreate the horizontal scrolling carousel */}
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-6 px-6">
          
          {/* Facility Card 1 */}
          <div className="bg-white/10 backdrop-blur-2xl min-w-[280px] rounded-[2rem] overflow-hidden shadow-xl border border-white/20 group">
            <div className="h-40 w-full relative">
              <img 
                alt="Clínica México" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhwG0H4o0mJWLVQlRNAF7h279s-_k-46qiJgWUJC44ldFJr9XDIkalmZOEgu9cygw0u67LCcSDIqjyxxb6SsuPGLD1djjCMkS6BXd4I0KrU6M5bBYi0wlxDpitJ_xMeRa9oO2c69FIw0dyy20ZUFzObr0WRFth_gd759tDdefOX9AAEzVRfYIfc7TpoASsiMX8qVFAHfN2ub0D1bVo-Kqkb7HuHBH7eUEceA-9Fbb7RgYcBJiCRjorhINadRavxxNJPZuXXsjBlPE" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4">
                <span className="text-white font-headline font-bold text-lg">Clínica México</span>
                <div className="flex items-center text-teal-200 text-xs gap-1">
                  <span className="material-symbols-outlined text-[14px]">star</span>
                  4.9 (240 reseñas)
                </div>
              </div>
            </div>
            <div className="p-4 flex justify-between items-center">
              <span className="text-white/80 text-xs">CDMX, Polanco</span>
              <Link href="/dashboard/paciente/citas" className="bg-[var(--color-primary-container)] text-white px-4 py-2 rounded-full text-xs font-bold transition-all hover:shadow-[0_0_15px_#00a3ad]">
                Detalles
              </Link>
            </div>
          </div>

          {/* Facility Card 2 */}
          <div className="bg-white/10 backdrop-blur-2xl min-w-[280px] rounded-[2rem] overflow-hidden shadow-xl border border-white/20 group">
            <div className="h-40 w-full relative">
              <img 
                alt="Laboratorios" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXxrk-CAYl_oD4_o6Do9g_AzEOZ-URVtbtJWs7pqVKzu63Cgy9KX6G5dJGlrw68HOKi5OFAsDH8a5eboWm5aWsMiSA0aVZNMsUTOWyTpN0JHU_r88U5mbTIo3P-hndXiyXgrzb3bw7begh-1UuO1tboEaVUKVVFPVqCKRVKJb0RhUBVpT3IVjQ4kiUNAnZcKEAF0DoVXXHvkqQS08clNTDUrQtkJiZ_qv8WewDQJVnfCBvrLtekZ4lHo4IArURywo_WyHoPx6cqfE" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4">
                <span className="text-white font-headline font-bold text-lg">Centro de Diagnóstico</span>
                <div className="flex items-center text-teal-200 text-xs gap-1">
                  <span className="material-symbols-outlined text-[14px]">star</span>
                  4.8 (115 reseñas)
                </div>
              </div>
            </div>
            <div className="p-4 flex justify-between items-center">
              <span className="text-white/80 text-xs">CDMX, Satélite</span>
              <Link href="/dashboard/paciente/citas" className="bg-[var(--color-primary-container)] text-white px-4 py-2 rounded-full text-xs font-bold transition-all hover:shadow-[0_0_15px_#00a3ad]">
                Detalles
              </Link>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
