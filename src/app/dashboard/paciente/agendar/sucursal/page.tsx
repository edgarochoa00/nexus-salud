"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function SucursalSelection() {
  const [selectedBranch, setSelectedBranch] = useState("Sur");

  const branches = [
    { id: "Norte", name: "Sucursal Norte", address: "Av. Libertador 4500. Edificio Nexus, Piso 4.", icon: "north" },
    { id: "Sur", name: "Sucursal Sur", address: "Calle San Martín 120. Galería Los Andes.", icon: "south" },
    { id: "Centro", name: "Sucursal Centro", address: "Av. 9 de Julio 1000. Centro Médico Integral.", icon: "location_city" },
    { id: "Este", name: "Sucursal Este", address: "Ruta 202 km 5. Polo Tecnológico San Fernando.", icon: "east" },
  ];

  return (
    <main className="relative pt-safe-24 pb-40 px-6 max-w-5xl mx-auto z-10 w-full">
      {/* Progress Indicator */}
      <div className="mb-10 flex flex-col items-center">
        <div className="text-cyan-400/80 font-label text-xs uppercase tracking-widest mb-2">Paso 3 de 4</div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-12 rounded-full bg-[var(--color-primary-container)] shadow-[0_0_12px_rgba(0,163,173,0.5)]"></div>
          <div className="h-1.5 w-12 rounded-full bg-[var(--color-primary-container)] shadow-[0_0_12px_rgba(0,163,173,0.5)]"></div>
          <div className="h-1.5 w-12 rounded-full bg-[var(--color-primary-container)] shadow-[0_0_12px_rgba(0,163,173,0.5)]"></div>
          <div className="h-1.5 w-12 rounded-full bg-white/10"></div>
        </div>
        <h2 className="mt-8 font-headline text-3xl font-extrabold text-white text-center leading-tight">
          Selección de Sucursal
        </h2>
        <p className="mt-4 text-cyan-100/60 text-center max-w-md text-sm">
          Por favor, elija la ubicación física donde se llevará a cabo la atención médica.
        </p>
      </div>

      {/* Bento Grid for Branches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {branches.map((branch) => {
          const isActive = selectedBranch === branch.id;

          return (
            <div 
              key={branch.id}
              onClick={() => setSelectedBranch(branch.id)}
              className={`rounded-3xl p-6 group cursor-pointer hover:scale-[1.02] transition-all duration-300 flex flex-col h-full ${
                isActive 
                  ? "bg-[var(--color-primary)]/15 backdrop-blur-2xl border border-[var(--color-primary-fixed-dim)]/50 shadow-[0_0_20px_rgba(0,163,173,0.2)]"
                  : "bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]"
              }`}
            >
              <div className={`p-3 rounded-2xl w-fit mb-6 transition-colors ${
                isActive ? "bg-[var(--color-primary-container)]/40" : "bg-[var(--color-primary)]/20 group-hover:bg-[var(--color-primary)]/40"
              }`}>
                <span 
                  className="material-symbols-outlined text-[var(--color-primary-fixed)] text-3xl"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {branch.icon}
                </span>
              </div>
              <h3 className="text-white font-headline text-xl font-bold mb-2">{branch.name}</h3>
              <p className="text-slate-400 text-sm flex-grow">{branch.address}</p>
              
              <div className="mt-6 flex items-center justify-between">
                {isActive ? (
                  <>
                    <span className="text-xs font-semibold text-[var(--color-primary-fixed-dim)] uppercase tracking-tighter flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[var(--color-primary-fixed-dim)]"></span>
                      Seleccionado
                    </span>
                    <span className="material-symbols-outlined text-[var(--color-primary-container)]">check_circle</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-semibold text-[#62d8da] uppercase tracking-tighter flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#62d8da] animate-pulse"></span>
                      Disponible
                    </span>
                    <span className="material-symbols-outlined text-white/20 group-hover:text-cyan-400 transition-colors">arrow_forward_ios</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action Bar */}
      <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-6">
        <Link href="/dashboard/paciente/agendar/horario" className="w-full text-center md:w-auto px-12 py-4 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-container)] text-white font-headline font-bold text-lg shadow-[0_10px_30px_rgba(0,105,112,0.4)] hover:shadow-[0_15px_40px_rgba(0,163,173,0.5)] active:scale-95 transition-all duration-200">
          Continuar
        </Link>
      </div>
    </main>
  );
}
