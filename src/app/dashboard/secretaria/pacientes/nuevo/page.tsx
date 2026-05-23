"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NuevoPacienteSecretaria() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    curp: "",
    correo: "",
    telefono: "",
    curp: "",
    fecha_nacimiento: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          curp: formData.curp.toUpperCase(),
          email: formData.correo,
          password: formData.password,
          fecha_nacimiento: formData.fecha_nacimiento || "2000-01-01",
          telefono: formData.telefono,
          curp: formData.curp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocurrió un error al registrar el paciente.");
      }

      alert("Paciente registrado correctamente. Ya puede iniciar sesión en la app.");
      router.push("/dashboard/secretaria");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header
        className="fixed top-0 w-full z-50 flex justify-between items-center px-6 pb-4 bg-black/20 backdrop-blur-xl border-b border-white/10 shadow-lg"
        style={{ paddingTop: 'max(calc(env(safe-area-inset-top) + 1rem), 1.5rem)' }}
      >
        <div className="flex items-center gap-3">
          <Link href="/dashboard/secretaria" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-all text-white/70">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-cyan-400 font-headline">Alta de Paciente</h1>
        </div>
      </header>

      <main className="relative z-10 pt-safe-28 pb-32 px-6 max-w-2xl mx-auto w-full">
        <div className="mb-8">
          <p className="text-white/70 text-sm">Ingrese los datos para registrar a un nuevo paciente en la base de datos de NexusSalud.</p>
        </div>

        {error && (
          <div className="w-full bg-red-500/20 border border-red-500/50 text-red-200 text-xs p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl flex flex-col gap-5" onSubmit={handleRegister}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-1 block">Nombre(s)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-cyan-400/50">person</span>
                <input required type="text" placeholder="Ej. Juan"
                  className="w-full bg-white/5 border border-white/10 rounded-xl h-14 pl-12 pr-5 focus:ring-2 focus:ring-cyan-500 text-white placeholder:text-white/20 font-medium"
                  value={formData.nombre} maxLength={50} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-1 block">Apellidos</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-cyan-400/50">person</span>
                <input required type="text" placeholder="Ej. Pérez"
                  className="w-full bg-white/5 border border-white/10 rounded-xl h-14 pl-12 pr-5 focus:ring-2 focus:ring-cyan-500 text-white placeholder:text-white/20 font-medium"
                  value={formData.apellidos} maxLength={50} onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-1 block">CURP</label>
            <input
              type="text"
              placeholder="CURP (18 caracteres)"
              maxLength={18}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
              value={formData.curp} onChange={(e) => setFormData({ ...formData, curp: e.target.value.toUpperCase().replace(/\s/g, "") })}
            />
            <p className="text-[10px] text-white/40 mt-1 ml-1">El paciente usará este ID para iniciar sesión.</p>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-1 block">Correo Electrónico</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-cyan-400/50">mail</span>
              <input required type="email" placeholder="paciente@ejemplo.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl h-14 pl-12 pr-5 focus:ring-2 focus:ring-cyan-500 text-white placeholder:text-white/20 font-medium"
                value={formData.correo} maxLength={100} onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-1 block">Contraseña Temporal</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-cyan-400/50">lock</span>
              <input required type="password" placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl h-14 pl-12 pr-5 focus:ring-2 focus:ring-cyan-500 text-white placeholder:text-white/20 font-medium"
                value={formData.password} maxLength={64} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-1 block">Teléfono</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-cyan-400/50">call</span>
                <input type="tel" placeholder="55 1234 5678"
                  className="w-full bg-white/5 border border-white/10 rounded-xl h-14 pl-12 pr-5 focus:ring-2 focus:ring-cyan-500 text-white placeholder:text-white/20 font-medium"
                  value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-1 block">Fecha de Nacimiento</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-cyan-400/50">calendar_today</span>
                <input required type="date"
                  className="w-full bg-white/5 border border-white/10 rounded-xl h-14 pl-12 pr-5 focus:ring-2 focus:ring-cyan-500 text-white placeholder:text-white/20 font-medium"
                  value={formData.fecha_nacimiento} onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full h-16 mt-6 rounded-full bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-headline font-bold text-lg shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
          >
            <span>{loading ? "Registrando..." : "Registrar Paciente"}</span>
            <span className="material-symbols-outlined">{loading ? "hourglass_empty" : "how_to_reg"}</span>
          </button>
        </form>
      </main>
    </>
  );
}
