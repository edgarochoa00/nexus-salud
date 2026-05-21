"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { obtenerCitaEnProceso, guardarCitaEnProceso } from "@/utils/citaStore";

export default function SucursalSelection() {
  const supabase = createClient();
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    supabase.from("sucursales").select("*").order("nombre").then(({ data }) => {
      setSucursales(data ?? []);
      setLoading(false);
      // Pre-select if already stored
      const { sucursal } = obtenerCitaEnProceso();
      if (sucursal && data) {
        const found = data.find((s: any) => s.nombre === sucursal);
        if (found) setSelectedId(found.id);
      }
    });
  }, []);

  const handleSelect = (suc: any) => {
    setSelectedId(suc.id);
    guardarCitaEnProceso({ sucursal: suc.nombre });
  };

  const icons = ["location_city", "north", "south", "east", "west", "place"];

  return (
    <main className="relative pt-safe-24 pb-40 px-6 max-w-5xl mx-auto z-10 w-full">
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((n) => <div key={n} className="h-48 bg-white/5 animate-pulse rounded-3xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sucursales.map((suc: any, idx: number) => {
            const isActive = selectedId === suc.id;
            return (
              <div
                key={suc.id}
                onClick={() => handleSelect(suc)}
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
                    {icons[idx % icons.length]}
                  </span>
                </div>
                <h3 className="text-white font-headline text-xl font-bold mb-2">{suc.nombre}</h3>
                <p className="text-slate-400 text-sm flex-grow">{suc.direccion ?? "Sin dirección registrada"}</p>

                <div className="mt-6 flex items-center justify-between">
                  {isActive ? (
                    <>
                      <span className="text-xs font-semibold text-[var(--color-primary-fixed-dim)] uppercase tracking-tighter flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-primary-fixed-dim)]"></span>
                        Seleccionada
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
      )}

      <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-6">
        <Link
          href="/dashboard/paciente/agendar/horario"
          className={`w-full text-center md:w-auto px-12 py-4 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-container)] text-white font-headline font-bold text-lg shadow-[0_10px_30px_rgba(0,105,112,0.4)] hover:shadow-[0_15px_40px_rgba(0,163,173,0.5)] active:scale-95 transition-all duration-200 ${
            !selectedId ? "opacity-40 pointer-events-none" : ""
          }`}
        >
          Continuar
        </Link>
      </div>
    </main>
  );
}
