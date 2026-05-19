"use client";

import React from "react";
import Link from "next/link";
import LogoutButton from "@/components/ui/LogoutButton";

export default function SecretariaDashboard() {
  const sedes = [
    {
      id: 1,
      name: "Clínica México",
      subtitle: "Sede Principal",
      imgSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjv5CqdVf1X-0TRetZkn2WzHk3PbQWyXBvoeWrpmMA4dC1hdCmUTp1UkWi33sdn3XrJ0yEZimSFrX-inEBxpW0ar212xi4R8A_KO7E241bwfY33txvQYSM_tC53rtDitxwj9jESePJ649sKHrRUX5Ua8s9xl6F8BZMH4Lk7dZmHbhnrlWMx7x08iWL3G_ISFu4FoyPrAvX9Fh4YNWT5s6fOq2DW6xD6bZNucLoVnuLW50sVORZHKCKBNOgx6cA9NbInOrjJQT3-OA",
    },
    {
      id: 2,
      name: "Sucursal Norte",
      subtitle: "Centro de Diagnóstico",
      imgSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuC86bEOlg61MB_8Dwc8HFsfW0D8g9BkPPrfERfkQZ54remUYM0qriMi1X6tCYr_Wzr_f76jYyHpZmfkb0k6jRBH8vqibPSc5CCUsWjQ3zmp0Knl5KVj7hwLyuAl08f6c6RMp8mf2XD_PrgMQh1dEy1gnzC7FpBMzItUS03xyoHl0OUI1n1TCyXBCT1nr_MbJtbGceRDorQmhHISEGLO00zpkF7KFdW7GihxLhbdcfwT_Ms_Bi8e_tMYctUm8zIF9tQTUeX7lbbxd6s",
    }
  ];

  const citas = [
    { id: 1, time: "10:30", period: "AM", patient: "Juan Pérez", spec: "Cardiología", active: true },
    { id: 2, time: "11:15", period: "AM", patient: "María Rodríguez", spec: "Dermatología", active: false },
    { id: 3, time: "12:00", period: "PM", patient: "Roberto Sánchez", spec: "Nutrición", active: false },
  ];

  return (
    <>
      {/* TopAppBar */}
      <header className="safe-header fixed top-0 w-full z-40 flex justify-between items-center px-6 py-4 bg-cyan-950/40 backdrop-blur-xl border-b border-white/10 shadow-[0_32px_32px_-4px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-headline font-bold text-xl text-white tracking-tight">Hola, Elena</h1>
            <p className="text-[10px] text-cyan-400 font-semibold uppercase tracking-widest">Panel de Gestión Operativa</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LogoutButton />
          <button
            type="button"
            onClick={() => window.alert("No hay notificaciones nuevas.")}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            <span className="material-symbols-outlined text-cyan-400">notifications</span>
          </button>
        </div>
      </header>

      <main className="pt-safe-24 pb-32 px-6 max-w-5xl mx-auto space-y-10 relative z-10 w-full">
        {/* Carrusel de Sedes */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="font-headline font-bold text-lg text-white/90">Sedes Disponibles</h2>
            <Link href="/dashboard/secretaria/citas" className="text-xs font-semibold text-cyan-400 cursor-pointer hover:text-cyan-300 transition-colors">Ver todas</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {sedes.map((sede) => (
              <div key={sede.id} className="bg-white/10 backdrop-blur-2xl border border-white/10 flex-none w-64 rounded-3xl overflow-hidden relative group shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
                <img 
                  alt={sede.name} 
                  className="w-full h-40 object-cover opacity-70 group-hover:scale-110 transition-transform duration-700" 
                  src={sede.imgSrc} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-950 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="font-headline font-bold text-white">{sede.name}</h3>
                  <p className="text-xs text-white/60">{sede.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Botones de Acción Rápida */}
        <section className="grid grid-cols-3 gap-4">
          <Link href="/dashboard/secretaria/agendar" className="bg-[#083344]/40 backdrop-blur-3xl border border-white/15 flex flex-col items-center justify-center p-4 md:p-8 rounded-[2rem] aspect-square transition-all active:scale-95 group shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-2 md:mb-4 group-hover:bg-cyan-500/30 transition-colors">
              <span className="material-symbols-outlined text-3xl md:text-4xl text-cyan-400">calendar_add_on</span>
            </div>
            <span className="font-headline font-bold text-white text-xs md:text-base text-center">Agendar Cita</span>
          </Link>
          <Link href="/dashboard/secretaria/citas" className="bg-[#083344]/40 backdrop-blur-3xl border border-white/15 flex flex-col items-center justify-center p-4 md:p-8 rounded-[2rem] aspect-square transition-all active:scale-95 group shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-2 md:mb-4 group-hover:bg-cyan-500/30 transition-colors">
              <span className="material-symbols-outlined text-3xl md:text-4xl text-cyan-400">event_note</span>
            </div>
            <span className="font-headline font-bold text-white text-xs md:text-base text-center">Citas</span>
          </Link>
          <Link href="/dashboard/secretaria/pacientes/nuevo" className="bg-[#083344]/40 backdrop-blur-3xl border border-white/15 flex flex-col items-center justify-center p-4 md:p-8 rounded-[2rem] aspect-square transition-all active:scale-95 group shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-2 md:mb-4 group-hover:bg-cyan-500/30 transition-colors">
              <span className="material-symbols-outlined text-3xl md:text-4xl text-cyan-400">person_add</span>
            </div>
            <span className="font-headline font-bold text-white text-xs md:text-base text-center">Nuevo Paciente</span>
          </Link>
        </section>

        {/* Resumen de Citas Próximas */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h2 className="font-headline font-bold text-lg text-white/90">Próximas Citas</h2>
            <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-tighter">Hoy: {citas.length} Pendientes</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {citas.map((cita) => (
              <div 
                key={cita.id} 
                className={`bg-[#083344]/40 backdrop-blur-3xl border border-white/15 p-5 rounded-[1.5rem] flex items-center justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] border-l-4 ${cita.active ? 'border-l-cyan-400' : 'border-l-transparent'}`}
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex flex-col items-center justify-center border border-white/10 shrink-0">
                    <span className={`${cita.active ? 'text-cyan-400' : 'text-white/80'} font-headline font-extrabold text-sm`}>{cita.time}</span>
                    <span className="text-[8px] text-white/50 uppercase font-bold">{cita.period}</span>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-white text-md">{cita.patient}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/20">
                        {cita.spec}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
