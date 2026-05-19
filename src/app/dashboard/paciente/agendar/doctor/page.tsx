"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function DoctorSelection() {
  const [selectedFilter, setSelectedFilter] = useState("Todos");
  const filters = ["Todos", "Cardiología", "Pediatría", "Neurología"];
  const doctors = [
    { name: "Dra. Elena Gomez", specialty: "Cardiología Clínica", price: "$650 MXN", gender: "female" },
    { name: "Dr. Ricardo Maza", specialty: "Medicina General", price: "$450 MXN", gender: "male" },
    { name: "Dra. Sofia Mendez", specialty: "Dermatología", price: "$800 MXN", gender: "female" },
  ];
  const filteredDoctors =
    selectedFilter === "Todos"
      ? doctors
      : doctors.filter((doc) => doc.specialty.includes(selectedFilter));

  return (
    <main className="relative pt-safe-24 pb-32 px-6 max-w-2xl mx-auto w-full z-10">
      
      {/* Progress Stepper & Header overrides (Title inside main body context if needed) */}
      <div className="mb-8 flex flex-col">
        <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold opacity-80">
          Paso 2 de 4
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-white font-headline">
          Selección de Doctor
        </h1>
      </div>

      {/* Search & Filter Section */}
      <div className="mb-8">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-cyan-400/60 group-focus-within:text-cyan-400 transition-colors">
              search
            </span>
          </div>
          <input 
            className="w-full bg-white/10 border-none rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/40 focus:ring-2 focus:ring-[var(--color-primary-container)]/50 backdrop-blur-md transition-all font-body text-sm" 
            placeholder="Buscar por nombre o especialidad..." 
            type="text"
          />
        </div>
        
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-full text-xs whitespace-nowrap transition-colors ${
                selectedFilter === filter
                  ? "bg-[var(--color-primary-container)] text-white font-semibold"
                  : "bg-white/5 backdrop-blur-md border border-white/10 font-medium text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor List */}
      <div className="space-y-6">
        {filteredDoctors.map((doc, idx) => (
          <div key={idx} className="bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] flex flex-col gap-5 relative group overflow-hidden border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
            <div className="flex gap-5 items-start">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-[var(--color-primary-container)]/20 flex items-center justify-center border border-white/10">
                  <span className="material-symbols-outlined text-4xl text-cyan-200">
                    {doc.gender}
                  </span>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-headline font-bold text-xl text-white">{doc.name}</h3>
                    <p className="text-cyan-400 font-medium text-sm">{doc.specialty}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/50 uppercase tracking-tighter">Consulta</p>
                    <p className="font-headline font-extrabold text-cyan-400 text-lg">{doc.price}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* The link goes to selecting a branch or directly to the calendar depending on flow. Let's go to branch selection. */}
            <Link href="/dashboard/paciente/agendar/sucursal" className="block text-center w-full bg-[var(--color-primary-container)] text-white font-headline font-bold py-4 rounded-2xl hover:bg-[var(--color-primary-container)]/90 transition-all active:scale-95 shadow-lg shadow-[var(--color-primary-container)]/20">
              Seleccionar
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
