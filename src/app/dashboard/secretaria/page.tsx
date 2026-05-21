"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function SecretariaDashboard() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [secretariaName, setSecretariaName] = useState("Secretaria");
  const [citasHoy, setCitasHoy] = useState<any[]>([]);
  const [sucursales, setSucursales] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const hoy = new Date().toISOString().split("T")[0];

    const [usuarioRes, citasRes, sucursalesRes] = await Promise.all([
      supabase.from("usuarios").select("nombre, apellidos").eq("id", user.id).single(),
      supabase.from("citas")
        .select(`
          id, fecha, hora, estado,
          paciente:pacientes!paciente_id(usuarios(nombre, apellidos)),
          doctor:doctores!doctor_id(usuarios(nombre, apellidos), especialidades(nombre)),
          consultorio:consultorios(nombre)
        `)
        .eq("fecha", hoy)
        .in("estado", ["pendiente", "confirmada"])
        .order("hora", { ascending: true })
        .limit(3),
      supabase.from("sucursales").select("*").limit(5)
    ]);

    if (usuarioRes.data) {
      setSecretariaName(usuarioRes.data.nombre);
    }
    if (citasRes.data) {
      setCitasHoy(citasRes.data);
    }
    if (sucursalesRes.data) {
      setSucursales(sucursalesRes.data);
    }
    
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const estadoBadge = (estado: string) => {
    if (estado === "confirmada") return "text-cyan-300 bg-cyan-500/10 border-cyan-500/30";
    if (estado === "pendiente") return "text-amber-300 bg-amber-500/10 border-amber-500/30";
    return "text-slate-400 bg-white/5 border-white/10";
  };

  return (
    <main className="relative pt-safe-24 pb-32 px-6 max-w-lg mx-auto">
      {/* Header */}
      <section className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-white font-headline text-3xl font-extrabold tracking-tight mb-1">
              {loading ? "Cargando..." : `Hola, ${secretariaName.split(" ")[0]}`}
            </h1>
            <p className="text-cyan-100/80 font-medium">Panel de Recepción</p>
          </div>
          <Link
            href="/"
            className="text-xs font-bold uppercase tracking-wider text-red-300 border border-red-300/40 px-3 py-2 rounded-full hover:bg-red-500/20 transition-colors"
          >
            Salir
          </Link>
        </div>
      </section>

      {/* Quick Action Buttons */}
      <section className="mb-10 grid grid-cols-2 gap-4">
        <Link href="/dashboard/secretaria/agendar" className="bg-white/10 backdrop-blur-2xl rounded-3xl p-5 border border-white/20 hover:bg-white/20 transition-all active:scale-95 flex flex-col items-center justify-center gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-14 h-14 rounded-[1rem] bg-cyan-500/20 flex items-center justify-center text-cyan-300">
            <span className="material-symbols-outlined text-3xl">event_upcoming</span>
          </div>
          <span className="text-white font-bold text-sm tracking-wide">Agendar Cita</span>
        </Link>
        
        <Link href="/dashboard/secretaria/pacientes/nuevo" className="bg-white/10 backdrop-blur-2xl rounded-3xl p-5 border border-white/20 hover:bg-white/20 transition-all active:scale-95 flex flex-col items-center justify-center gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-14 h-14 rounded-[1rem] bg-emerald-500/20 flex items-center justify-center text-emerald-300">
            <span className="material-symbols-outlined text-3xl">person_add</span>
          </div>
          <span className="text-white font-bold text-sm tracking-wide">Nuevo Paciente</span>
        </Link>
      </section>

      {/* Próximas Citas (Hoy) */}
      <section className="mb-10">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-white/70 text-sm font-bold uppercase tracking-widest">Próximas Citas</h2>
            <p className="text-white/40 text-xs mt-0.5">Para el día de hoy</p>
          </div>
          <Link href="/dashboard/secretaria/citas" className="text-cyan-400 text-xs font-bold hover:text-cyan-300 transition-colors">Ver Todas</Link>
        </div>

        <div className="space-y-3">
          {loading ? (
            [1, 2, 3].map((n) => <div key={n} className="h-20 bg-white/5 animate-pulse rounded-2xl border border-white/10" />)
          ) : citasHoy.length === 0 ? (
            <div className="text-center py-8 bg-white/5 rounded-2xl border border-white/10">
              <span className="material-symbols-outlined text-3xl text-white/20 mb-2">event_busy</span>
              <p className="text-white/50 text-sm font-medium">No hay citas pendientes hoy</p>
            </div>
          ) : (
            citasHoy.map((cita) => (
              <div key={cita.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm leading-none">{cita.hora?.slice(0, 5)}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm truncate max-w-[150px]">
                      {cita.paciente?.usuarios ? `${cita.paciente.usuarios.nombre} ${cita.paciente.usuarios.apellidos}` : "Paciente"}
                    </h4>
                    <p className="text-white/50 text-xs mt-0.5 truncate max-w-[150px]">
                      Dr. {cita.doctor?.usuarios ? cita.doctor.usuarios.nombre : "—"} · {cita.doctor?.especialidades?.nombre}
                    </p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border shrink-0 ${estadoBadge(cita.estado)}`}>
                  {cita.estado}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Sedes Disponibles Carousel */}
      <section className="mb-10">
        <h2 className="text-white/70 text-sm font-bold uppercase tracking-widest mb-4">Sedes Disponibles</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
          {loading ? (
            [1, 2].map(n => <div key={n} className="h-32 min-w-[240px] bg-white/5 animate-pulse rounded-2xl border border-white/10" />)
          ) : sucursales.length === 0 ? (
            <p className="text-white/50 text-sm">No hay sedes disponibles.</p>
          ) : (
            sucursales.map((sede, i) => {
              const defaultImg = i % 2 === 0 
               ? "https://lh3.googleusercontent.com/aida-public/AB6AXuAhwG0H4o0mJWLVQlRNAF7h279s-_k-46qiJgWUJC44ldFJr9XDIkalmZOEgu9cygw0u67LCcSDIqjyxxb6SsuPGLD1djjCMkS6BXd4I0KrU6M5bBYi0wlxDpitJ_xMeRa9oO2c69FIw0dyy20ZUFzObr0WRFth_gd759tDdefOX9AAEzVRfYIfc7TpoASsiMX8qVFAHfN2ub0D1bVo-Kqkb7HuHBH7eUEceA-9Fbb7RgYcBJiCRjorhINadRavxxNJPZuXXsjBlPE"
               : "https://lh3.googleusercontent.com/aida-public/AB6AXuDXxrk-CAYl_oD4_o6Do9g_AzEOZ-URVtbtJWs7pqVKzu63Cgy9KX6G5dJGlrw68HOKi5OFAsDH8a5eboWm5aWsMiSA0aVZNMsUTOWyTpN0JHU_r88U5mbTIo3P-hndXiyXgrzb3bw7begh-1UuO1tboEaVUKVVFPVqCKRVKJb0RhUBVpT3IVjQ4kiUNAnZcKEAF0DoVXXHvkqQS08clNTDUrQtkJiZ_qv8WewDQJVnfCBvrLtekZ4lHo4IArURywo_WyHoPx6cqfE";
              
              return (
                <div key={sede.id} className="bg-white/10 backdrop-blur-2xl min-w-[240px] rounded-2xl overflow-hidden shadow-lg border border-white/20 relative group">
                  <div className="h-24 w-full relative">
                    <img 
                      alt={sede.nombre} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      src={defaultImg} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-3 left-3">
                      <span className="text-white font-headline font-bold text-sm block">{sede.nombre}</span>
                    </div>
                  </div>
                  <div className="px-3 py-2 bg-white/5 flex justify-between items-center">
                    <span className="text-white/50 text-[10px] uppercase font-bold truncate max-w-[120px]">{sede.direccion || "Sucursal"}</span>
                    <div className="flex items-center text-cyan-300 text-[10px] font-bold">
                      <span className="material-symbols-outlined text-[12px] mr-0.5">check_circle</span>
                      Activa
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
