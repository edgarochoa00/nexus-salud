"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import BackgroundAccents from "@/components/ui/BackgroundAccents";
import { GlassCard } from "@/components/ui/GlassCard";
import { InputGlass } from "@/components/ui/InputGlass";
import { ButtonGradient } from "@/components/ui/ButtonGradient";
import { createClient } from "@/utils/supabase/client";

export default function UniversalLogin() {
  const router = useRouter();
  const supabase = createClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Buscar el correo asociado al username vía API route (server-side seguro)
      const res = await fetch("/api/auth/find-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });

      if (!res.ok) {
        setError("Usuario no encontrado. Verifica tu ID de usuario.");
        return;
      }

      const { email } = await res.json();

      // 2. Iniciar sesión con el correo encontrado + contraseña
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !data.user) {
        if (authError?.message.includes("Email not confirmed")) {
          setError("Debes confirmar tu correo electrónico. Revisa tu bandeja de entrada.");
        } else {
          setError("Contraseña incorrecta o ID no válido. Inténtalo de nuevo.");
        }
        return;
      }

      // 3. Obtener rol y redirigir
      const { data: perfil } = await supabase
        .from("usuarios")
        .select("rol")
        .eq("id", data.user.id)
        .single();

      const rutasPorRol: Record<string, string> = {
        admin: "/dashboard/admin",
        doctor: "/dashboard/doctor",
        secretaria: "/dashboard/secretaria",
        paciente: "/dashboard/paciente",
      };

      // Si no hay perfil todavía, ir a paciente por defecto
      const destino = rutasPorRol[perfil?.rol ?? "paciente"] ?? "/dashboard/paciente";
      router.push(destino);

    } catch (err) {
      console.error("Error en login:", err);
      setError("Error inesperado. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BackgroundAccents />
      <main className="w-full max-w-[420px] mx-auto pt-10 px-4">
        <GlassCard className="flex flex-col items-center">
          <div className="mb-6 w-full flex flex-col items-center">
            <h2 className="text-3xl font-bold tracking-tight mb-1 font-headline text-white">NexusSalud</h2>
            <p className="text-white/60 text-sm text-center">Conectando Espacios, Agendas y Pacientes</p>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-white">Iniciar Sesión</h1>
            <p className="text-[var(--color-primary)]/80 mt-2 text-xs font-medium tracking-wide uppercase">Acceso Seguro</p>
          </div>

          {error && (
            <div className="w-full bg-red-500/20 border border-red-500/50 text-red-200 text-xs p-3 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}

          <form className="w-full flex flex-col gap-5" onSubmit={handleLogin}>
            <InputGlass
              id="username"
              label="ID de Usuario"
              placeholder="Ej. juanperez"
              type="text"
              icon="badge"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <InputGlass
              id="password"
              label="Contraseña"
              placeholder="••••••••"
              type="password"
              icon="lock"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="pt-2">
              <ButtonGradient type="submit" icon={loading ? "hourglass_empty" : "arrow_forward"}>
                {loading ? "INGRESANDO..." : "INGRESAR"}
              </ButtonGradient>
            </div>

            <button
              onClick={() => router.push("/registro-paciente")}
              className="w-full h-12 border border-white/10 rounded-full text-sm font-medium hover:bg-white/5 transition-all mt-2 text-white"
              type="button"
            >
              Crear Cuenta
            </button>
          </form>

          <div className="mt-10 flex flex-col items-center gap-6 w-full">
            <div className="flex items-center gap-3 w-full justify-center">
              <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-white/20"></div>
              <span className="material-symbols-outlined text-white/40 text-sm">security</span>
              <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-white/20"></div>
            </div>
            <button type="button" onClick={() => setError("Soporte: soporte@nexussalud.app")}
              className="text-xs text-white/60 hover:text-white transition-colors">
              Términos y Condiciones · Ayuda Técnica
            </button>
          </div>
        </GlassCard>
      </main>
    </>
  );
}
