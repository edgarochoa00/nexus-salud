"use client";

import React from "react";
import Link from "next/link";

export default function ExpedienteMedico() {
  const historial = [
    { date: "15 OCT 2023", doc: "Dr. Eduardo Ramírez", spec: "Cardiología", reason: "Revisión de presión arterial", icon: "ecg", color: "[#00a3ad]" },
    { date: "02 SEP 2023", doc: "Dra. Ana López", spec: "Medicina General", reason: "Chequeo anual", icon: "stethoscope", color: "[#7df4ff]" },
    { date: "12 JUL 2023", doc: "Laboratorios Central", spec: "Estudios clínicos", reason: "Estudios de sangre", icon: "biotech", color: "[#62d8da]" }
  ];

  return (
    <main className="pt-safe-24 pb-32 px-5 max-w-lg mx-auto space-y-8 relative z-10 w-full">
      {/* Top Header handled by Layout, adding Title below */}
      <div className="mb-8">
        <h1 className="font-headline font-bold text-3xl tracking-tight text-white mb-2">Expediente Médico</h1>
        <p className="text-white/70 text-sm">Consulta tus datos personales e historial de consultas.</p>
      </div>

      {/* Sección Datos Personales */}
      <section className="space-y-4">
        <h2 className="font-headline font-extrabold text-white text-xl tracking-wide px-1">Datos Personales</h2>
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[24px] p-6 grid grid-cols-2 gap-6 relative overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[var(--color-primary-container)]">
              <span className="material-symbols-outlined text-[18px]">cake</span>
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Edad</span>
            </div>
            <p className="text-white font-semibold text-lg">32 años</p>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[var(--color-primary-container)]">
              <span className="material-symbols-outlined text-[18px]">bloodtype</span>
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Tipo</span>
            </div>
            <p className="text-white font-semibold text-lg">O+</p>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[var(--color-primary-container)]">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Alergias</span>
            </div>
            <p className="text-white font-semibold text-lg">Ninguna</p>
          </div>
          <div className="col-span-2 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-[var(--color-primary-container)] mb-1">
              <span className="material-symbols-outlined text-[18px]">medical_information</span>
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Padecimientos Actuales</span>
            </div>
            <p className="text-white font-medium text-base">Hipertensión controlada</p>
          </div>
        </div>
      </section>

      {/* Sección Historial de Consultas */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <h2 className="font-headline font-extrabold text-white text-xl tracking-wide">Historial</h2>
          <Link href="/dashboard/paciente/citas" className="text-[12px] font-bold text-[var(--color-primary-container)] uppercase tracking-tighter cursor-pointer hover:opacity-80 transition-opacity">
            Ver todo
          </Link>
        </div>
        
        <div className="space-y-4">
          {historial.map((item, idx) => (
            <Link href={`/dashboard/paciente/expediente/${idx}`} key={idx} className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[24px] p-5 flex gap-4 items-start transition-all hover:bg-white/10 active:scale-95 cursor-pointer shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
              <div className="bg-[var(--color-primary-container)]/20 p-3 rounded-2xl">
                <span className={`material-symbols-outlined text-${item.color}`}>{item.icon}</span>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-[var(--color-primary-container)] opacity-80">{item.date}</span>
                  <span className="material-symbols-outlined text-white/40 text-sm">chevron_right</span>
                </div>
                <h3 className="text-white font-bold text-md leading-tight">{item.doc}</h3>
                <p className="text-white/60 text-xs font-medium uppercase tracking-wide">{item.spec}</p>
                <p className="text-white/80 text-sm mt-2 italic">"{item.reason}"</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
