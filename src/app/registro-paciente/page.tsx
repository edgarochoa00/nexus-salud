"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import BackgroundAccents from "@/components/ui/BackgroundAccents";
import { GlassCard } from "@/components/ui/GlassCard";
import { InputGlass } from "@/components/ui/InputGlass";
import { ButtonGradient } from "@/components/ui/ButtonGradient";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function RegistroPaciente() {
  const router = useRouter();
  const supabase = createClient();
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    telefono: "",
    username: "",
    correo: "",
    password: "",
    fecha_nacimiento: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.fecha_nacimiento) {
      setError("Por favor selecciona tu fecha de nacimiento.");
      setLoading(false);
      return;
    }

    // Validar que el username no tenga espacios o caracteres especiales
    const usernameValido = /^[a-zA-Z0-9._-]{3,20}$/.test(formData.username);
    if (!usernameValido) {
      setError("El ID de usuario solo puede tener letras, números, puntos o guiones (3-20 caracteres).");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        telefono: formData.telefono,
        username: formData.username,
        email: formData.correo,
        password: formData.password,
        fecha_nacimiento: formData.fecha_nacimiento,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Error al crear la cuenta.");
      setLoading(false);
      return;
    }

    alert(`¡Registro exitoso! Tu ID de usuario es: ${formData.username.toLowerCase()}\nConsérvalo para iniciar sesión.`);
    router.push("/");
  };

  return (
    <>
      <BackgroundAccents />
      <main className="w-full max-w-[420px] mx-auto pt-10 px-4 pb-20">
        <GlassCard className="flex flex-col items-center">
          <div className="mb-6 w-full flex flex-col items-center">
            <h2 className="text-3xl font-bold tracking-tight mb-1 font-headline text-white">NexusSalud</h2>
            <p className="text-white/60 text-sm text-center">Registro de Paciente</p>
          </div>

          {error && (
            <div className="w-full bg-red-500/20 border border-red-500/50 text-red-200 text-xs p-3 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}

          <form className="w-full flex flex-col gap-5" onSubmit={handleRegister}>
            <InputGlass
              id="nombre" label="Nombre" placeholder="Ej. Juan"
              type="text" icon="person" value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
            <InputGlass
              id="apellidos" label="Apellidos" placeholder="Ej. Pérez Gómez"
              type="text" icon="badge" value={formData.apellidos}
              onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
            />
            <InputGlass
              id="telefono" label="Teléfono" placeholder="Ej. 5551234567"
              type="tel" icon="phone" value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            />
            <div>
              <InputGlass
                id="username" label="ID de Usuario" placeholder="Ej. juanperez (sin espacios)"
                type="text" icon="badge" value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, "") })}
              />
              <p className="text-[10px] text-white/40 mt-1 ml-1">Este será tu identificador para iniciar sesión. 3-20 caracteres.</p>
            </div>
            <InputGlass
              id="fecha_nacimiento" label="Fecha de Nacimiento"
              type="date" icon="calendar_today" value={formData.fecha_nacimiento}
              onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
            />
            <InputGlass
              id="correo" label="Correo Electrónico" placeholder="correo@ejemplo.com"
              type="email" icon="mail" value={formData.correo}
              onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
            />
            <InputGlass
              id="password" label="Contraseña" placeholder="••••••••"
              type="password" icon="lock" value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <div className="pt-4">
              <ButtonGradient type="submit" icon={loading ? "hourglass_empty" : "how_to_reg"}>
                {loading ? "REGISTRANDO..." : "REGISTRARSE"}
              </ButtonGradient>
            </div>
          </form>

          <div className="mt-8 flex flex-col items-center gap-6 w-full">
            <div className="flex items-center gap-3 w-full justify-center">
              <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-white/20"></div>
              <span className="material-symbols-outlined text-white/40 text-sm">security</span>
              <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-white/20"></div>
            </div>
            <Link href="/" className="text-xs text-white/80 hover:text-white transition-colors font-semibold">
              ¿Ya tienes cuenta? Inicia sesión aquí
            </Link>
          </div>
        </GlassCard>
      </main>
    </>
  );
}
