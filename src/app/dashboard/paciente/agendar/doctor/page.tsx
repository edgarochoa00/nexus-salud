"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { obtenerCitaEnProceso, guardarCitaEnProceso } from "@/utils/citaStore";

export default function DoctorSelection() {
  const supabase = createClient();
  const [turnosByDoctor, setTurnosByDoctor] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [especialidadFiltro, setEspecialidadFiltro] = useState<string | null>(null);

  useEffect(() => {
    const { especialidad } = obtenerCitaEnProceso();
    if (especialidad) setEspecialidadFiltro(especialidad);

    supabase
      .from("doctor_consultorios")
      .select(`
        id,
        doctor_id,
        consultorio_id,
        dia_semana,
        hora_inicio,
        hora_fin,
        doctores(
          id,
          precio_consulta,
          especialidad_id,
          especialidades(nombre),
          usuarios(nombre, apellidos)
        ),
        consultorios(
          id,
          nombre,
          sucursal_id,
          sucursales(id, nombre, direccion)
        )
      `)
      .then(({ data, error }) => {
        if (error) console.error("Error fetching doctors:", error);
        setTurnosByDoctor(data ?? []);
        setLoading(false);
      });
  }, []);

  // Deduplicate doctors, keeping their best/first slot
  const uniqueDoctors = turnosByDoctor.reduce((acc: any[], turno: any) => {
    const exists = acc.find((d) => d.doctor_id === turno.doctor_id);
    if (!exists) acc.push(turno);
    return acc;
  }, []);

  const filtered = uniqueDoctors.filter((t: any) => {
    const dr = t.doctores;
    const usr = dr?.usuarios;
    const esp = dr?.especialidades?.nombre ?? "";
    const nombre = `${usr?.nombre ?? ""} ${usr?.apellidos ?? ""}`.toLowerCase();
    const matchSearch = nombre.includes(busqueda.toLowerCase()) || esp.toLowerCase().includes(busqueda.toLowerCase());
    const matchEsp = !especialidadFiltro || esp === especialidadFiltro;
    return matchSearch && matchEsp;
  });

  const handleSelect = (turno: any) => {
    const dr = turno.doctores;
    const usr = dr?.usuarios;
    const suc = turno.consultorios?.sucursales;
    setSelectedDoctorId(turno.doctor_id);
    guardarCitaEnProceso({
      doctor_id: turno.doctor_id,
      doctor_nombre: `${usr?.nombre ?? ""} ${usr?.apellidos ?? ""}`.trim(),
      especialidad: dr?.especialidades?.nombre ?? especialidadFiltro ?? "",
      precio: dr?.precio_consulta ?? 0,
      sucursal: suc?.nombre ?? "",
    });
  };

  return (
    <main className="relative pt-safe-24 pb-32 px-6 max-w-2xl mx-auto w-full z-10">
      <div className="mb-8 flex flex-col">
        <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold opacity-80">
          Paso 2 de 3
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-white font-headline">
          Selección de Doctor
        </h1>
        {especialidadFiltro && (
          <p className="text-xs text-[var(--color-primary-container)] mt-1">Filtrando por: {especialidadFiltro}</p>
        )}
      </div>

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
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-white/5 animate-pulse rounded-[2.5rem]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white/5 rounded-[2rem] border border-white/10">
          <span className="material-symbols-outlined text-5xl text-white/20">search_off</span>
          <p className="text-white/50 mt-2">No hay doctores disponibles para esta especialidad.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((turno: any) => {
            const dr = turno.doctores;
            const usr = dr?.usuarios;
            const suc = turno.consultorios?.sucursales;
            const esp = dr?.especialidades?.nombre;
            const isSelected = selectedDoctorId === turno.doctor_id;

            return (
              <div
                key={turno.doctor_id}
                className={`bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] flex flex-col gap-5 relative group overflow-hidden border shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] transition-all ${
                  isSelected ? "border-[var(--color-primary-container)] bg-[var(--color-primary-container)]/5" : "border-white/10"
                }`}
              >
                <div className="flex gap-5 items-start">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-[var(--color-primary-container)]/20 flex items-center justify-center border border-white/10">
                      <span className="material-symbols-outlined text-4xl text-cyan-200">
                        stethoscope
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-headline font-bold text-xl text-white">
                          {usr?.nombre} {usr?.apellidos}
                        </h3>
                        <p className="text-cyan-400 font-medium text-sm">{esp}</p>
                        {suc && <p className="text-white/40 text-xs mt-0.5">{suc.nombre}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-white/50 uppercase tracking-tighter">Consulta</p>
                        <p className="font-headline font-extrabold text-cyan-400 text-lg">
                          ${dr?.precio_consulta ?? 0} MXN
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelect(turno)}
                  className={`block text-center w-full font-headline font-bold py-4 rounded-2xl active:scale-95 shadow-lg transition-all ${
                    isSelected
                      ? "bg-emerald-500 text-white shadow-emerald-500/20"
                      : "bg-[var(--color-primary-container)] text-white hover:bg-[var(--color-primary-container)]/90 shadow-[var(--color-primary-container)]/20"
                  }`}
                >
                  {isSelected ? "✓ Seleccionado" : "Seleccionar"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8">
        <Link
          href="/dashboard/paciente/agendar/horario"
          className={`block w-full text-center py-5 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-container)] text-white font-headline font-bold text-lg transition-all ${
            !selectedDoctorId ? "opacity-40 pointer-events-none" : "hover:scale-[1.02] active:scale-95"
          }`}
        >
          Continuar
        </Link>
      </div>
    </main>
  );
}
