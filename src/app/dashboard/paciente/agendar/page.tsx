"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { guardarCitaEnProceso } from "@/utils/citaStore";

export default function SpecialtySelection() {
  const supabase = createClient();
  const [especialidades, setEspecialidades] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const icons: Record<string, string> = {
    "Odontología General": "dentistry",
    "Ortodoncia": "dentistry",
    "Pediatría": "child_care",
    "Ginecología": "female",
    "Dermatología": "dermatology",
    "Cardiología": "cardiology",
  };

  useEffect(() => {
    supabase.from("especialidades").select("*").order("nombre").then(({ data }) => {
      setEspecialidades(data ?? []);
      setLoading(false);
    });
  }, []);

  const handleSelect = (esp: any) => {
    setSelected(esp.id);
    guardarCitaEnProceso({ especialidad: esp.nombre });
  };

  return (
    <main className="relative pt-safe-24 pb-32 px-6 max-w-2xl mx-auto">
      <div className="mb-8 flex flex-col items-center">
        <span className="text-[var(--color-primary-container)] font-headline font-extrabold tracking-widest text-xs uppercase mb-2">
          Paso 1 de 3
        </span>
        <div className="flex gap-2 w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="w-1/3 h-full bg-[var(--color-primary-container)] shadow-[0_0_12px_rgba(0,163,173,0.6)]"></div>
          <div className="w-1/3 h-full bg-white/5"></div>
          <div className="w-1/3 h-full bg-white/5"></div>
          <div className="w-1/3 h-full bg-white/5"></div>
        </div>
      </div>

      <section className="mb-10 text-center">
        <h2 className="font-headline text-4xl font-extrabold text-white mb-3 tracking-tight leading-tight">
          ¿Qué <span className="text-[var(--color-primary-container)]">especialidad</span> buscas?
        </h2>
        <p className="text-[#bcc9ca] text-lg max-w-md mx-auto">
          Selecciona el área médica para encontrar a los mejores profesionales disponibles.
        </p>
      </section>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-40 bg-white/5 animate-pulse rounded-[2.5rem]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {especialidades.map((esp) => {
            const isActive = selected === esp.id;
            return (
              <button
                key={esp.id}
                type="button"
                onClick={() => handleSelect(esp)}
                className={`bg-white/5 backdrop-blur-2xl border shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] p-6 rounded-[2.5rem] flex flex-col items-center text-center transition-all duration-300 group hover:bg-white/10 hover:-translate-y-1 ${
                  isActive ? "border-[var(--color-primary-container)] bg-[var(--color-primary-container)]/10" : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300 ${isActive ? "bg-[var(--color-primary-container)]/30" : "bg-[var(--color-primary-container)]/20"}`}>
                  <span
                    className="material-symbols-outlined text-[var(--color-primary-container)] text-4xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {icons[esp.nombre] ?? "medical_services"}
                  </span>
                </div>
                <h3 className="font-headline font-bold text-white text-lg">{esp.nombre}</h3>
                {isActive && (
                  <span className="mt-2 text-[10px] font-bold text-[var(--color-primary-container)] uppercase tracking-widest">
                    Seleccionada ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-12 text-center">
        <Link
          href="/dashboard/paciente/agendar/doctor"
          className={`block w-full py-5 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-container)] text-white font-headline font-bold text-lg shadow-[0_20px_40px_-10px_rgba(0,105,112,0.4)] hover:scale-[1.02] active:scale-95 transition-all ${!selected ? "opacity-50 pointer-events-none" : ""}`}
        >
          Continuar
        </Link>
        <p className="mt-6 text-sm text-[#bcc9ca] font-medium">
          ¿No encuentras lo que buscas?{" "}
          <Link href="/dashboard/paciente/perfil" className="ml-1 underline underline-offset-4 hover:text-[var(--color-primary-container)] transition-colors">
            Contáctanos
          </Link>
        </p>
      </div>
    </main>
  );
}
