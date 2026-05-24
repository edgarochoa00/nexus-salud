"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function PacientePerfil() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState<any>(null);

  const fetchPerfil = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("usuarios")
      .select(`
        nombre, apellidos, correo, telefono, curp,
        pacientes(fecha_nacimiento)
      `)
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setPerfil({
        ...data,
        fecha_nacimiento: (data.pacientes as any)?.[0]?.fecha_nacimiento || (data.pacientes as any)?.fecha_nacimiento
      });
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchPerfil();
  }, [fetchPerfil]);

  return (
    <main className="relative z-10 px-6 pb-32 max-w-2xl mx-auto w-full pt-28">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/paciente" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="font-headline font-bold text-2xl text-white tracking-tight">Mi Perfil</h1>
      </div>

      {loading ? (
        <div className="h-64 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-white/20 text-4xl animate-spin">progress_activity</span>
        </div>
      ) : perfil ? (
        <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/20 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
          
          <div className="flex items-center gap-5 mb-8 relative z-10">
            <div className="w-20 h-20 rounded-[1.5rem] bg-[var(--color-primary-container)] flex items-center justify-center text-white text-3xl font-black font-headline shadow-[0_0_20px_rgba(0,163,173,0.3)]">
              {perfil.nombre?.charAt(0)}{perfil.apellidos?.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold font-headline text-white tracking-tight leading-tight">
                {perfil.nombre} {perfil.apellidos}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-500/30">
                  Paciente
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-[var(--color-primary-container)]">mail</span>
              <div>
                <p className="text-xs text-white/50 font-bold uppercase tracking-widest mb-0.5">Correo Electrónico</p>
                <p className="text-white font-medium">{perfil.correo}</p>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-[var(--color-primary-container)]">phone</span>
              <div>
                <p className="text-xs text-white/50 font-bold uppercase tracking-widest mb-0.5">Teléfono</p>
                <p className="text-white font-medium">{perfil.telefono || "No especificado"}</p>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-[var(--color-primary-container)]">cake</span>
              <div>
                <p className="text-xs text-white/50 font-bold uppercase tracking-widest mb-0.5">Fecha de Nacimiento</p>
                <p className="text-white font-medium">{perfil.fecha_nacimiento || "No especificada"}</p>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-[var(--color-primary-container)]">badge</span>
              <div>
                <p className="text-xs text-white/50 font-bold uppercase tracking-widest mb-0.5">CURP</p>
                <p className="text-white font-medium">{perfil.curp || "No asignada"}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-white/50">Error al cargar el perfil.</p>
        </div>
      )}
    </main>
  );
}
