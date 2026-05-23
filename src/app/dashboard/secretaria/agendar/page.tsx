"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { guardarCitaEnProceso, obtenerCitaEnProceso } from "@/utils/citaStore";

export default function SecretariaEspecialidadSelection() {
  const supabase = createClient();
  const [especialidades, setEspecialidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [pacienteBusqueda, setPacienteBusqueda] = useState("");
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [selectedPaciente, setSelectedPaciente] = useState<any | null>(null);
  const [buscando, setBuscando] = useState(false);

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

  const buscarPacientes = async () => {
    if (!pacienteBusqueda.trim()) return;
    setBuscando(true);
    const { data } = await supabase
      .from("usuarios")
      .select("id, nombre, apellidos, correo, usuario")
      .eq("rol", "paciente")
      .or(`nombre.ilike.%${pacienteBusqueda}%,apellidos.ilike.%${pacienteBusqueda}%,usuario.ilike.%${pacienteBusqueda}%`)
      .limit(5);
    setPacientes(data ?? []);
    setBuscando(false);
  };

  const handleSelectPaciente = (p: any) => {
    setSelectedPaciente(p);
    guardarCitaEnProceso({
      paciente_id: p.id,
      paciente_nombre: `${p.nombre} ${p.apellidos}`,
    });
  };

  const handleSelectEsp = (esp: any) => {
    setSelected(esp.id);
    guardarCitaEnProceso({ especialidad: esp.nombre });
  };

  const canContinue = !!selected && !!selectedPaciente;

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

      <section className="mb-8 text-center">
        <h2 className="font-headline text-4xl font-extrabold text-white mb-3 tracking-tight leading-tight">
          ¿Para quién es la <span className="text-[var(--color-primary-container)]">cita</span>?
        </h2>
      </section>

      {/* Paciente Search */}
      <div className="max-w-md mx-auto mb-8">
        <label className="text-xs font-bold text-[var(--color-primary-container)] uppercase tracking-widest mb-2 block">Paciente</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40">search</span>
            <input
              type="text"
              placeholder="Buscar paciente por nombre o ID..."
              value={pacienteBusqueda}
              onChange={(e) => setPacienteBusqueda(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && buscarPacientes()}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all backdrop-blur-md"
            />
          </div>
          <button
            type="button"
            onClick={buscarPacientes}
            disabled={buscando}
            className="px-4 py-2 bg-[var(--color-primary-container)] text-white rounded-2xl font-bold text-sm transition-all hover:bg-[var(--color-primary-container)]/80 disabled:opacity-50"
          >
            {buscando ? "..." : "Buscar"}
          </button>
        </div>

        {pacientes.length > 0 && !selectedPaciente && (
          <div className="mt-2 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {pacientes.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPaciente(p)}
                className="w-full text-left px-4 py-3 hover:bg-white/10 transition-all border-b border-white/5 last:border-0"
              >
                <p className="text-white font-medium text-sm">{p.nombre} {p.apellidos}</p>
                <p className="text-white/40 text-xs">{p.correo}</p>
              </button>
            ))}
          </div>
        )}

        {selectedPaciente && (
          <div className="mt-2 bg-[var(--color-primary-container)]/10 border border-[var(--color-primary-container)]/30 rounded-2xl px-4 py-3 flex justify-between items-center">
            <div>
              <p className="text-white font-medium text-sm">{selectedPaciente.nombre} {selectedPaciente.apellidos}</p>
              <p className="text-white/40 text-xs"></p>
            </div>
            <button type="button" onClick={() => { setSelectedPaciente(null); setPacientes([]); }} className="text-white/40 hover:text-white text-xs">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}
      </div>

      {/* Specialty Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => <div key={n} className="h-40 bg-white/5 animate-pulse rounded-[2.5rem]" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {especialidades.map((esp) => {
            const isActive = selected === esp.id;
            return (
              <button
                key={esp.id}
                type="button"
                onClick={() => handleSelectEsp(esp)}
                className={`bg-white/5 backdrop-blur-2xl border shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] p-6 rounded-[2.5rem] flex flex-col items-center text-center transition-all duration-300 group hover:bg-white/10 hover:-translate-y-1 ${
                  isActive ? "border-[var(--color-primary-container)] bg-[var(--color-primary-container)]/10" : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300 ${isActive ? "bg-[var(--color-primary-container)]/30" : "bg-[var(--color-primary-container)]/20"}`}>
                  <span className="material-symbols-outlined text-[var(--color-primary-container)] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {icons[esp.nombre] ?? "medical_services"}
                  </span>
                </div>
                <h3 className="font-headline font-bold text-white text-lg">{esp.nombre}</h3>
                {isActive && <span className="mt-2 text-[10px] font-bold text-[var(--color-primary-container)] uppercase tracking-widest">Seleccionada ✓</span>}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-12 text-center">
        <Link
          href="/dashboard/secretaria/agendar/doctor"
          className={`block w-full py-5 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-container)] text-white font-headline font-bold text-lg shadow-[0_20px_40px_-10px_rgba(0,105,112,0.4)] hover:scale-[1.02] active:scale-95 transition-all ${!canContinue ? "opacity-40 pointer-events-none" : ""}`}
        >
          Continuar
        </Link>
        <p className="mt-6 text-sm text-[#bcc9ca] font-medium">
          ¿Necesitas volver al panel principal?{" "}
          <Link href="/dashboard/secretaria" className="ml-1 underline underline-offset-4">Cancelar</Link>
        </p>
      </div>
    </main>
  );
}
