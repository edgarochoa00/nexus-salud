"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function AdminRegistroDoctores() {
  const supabase = createClient();
  const [specialties, setSpecialties] = useState<any[]>([]);
  
  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [curp, setCurp] = useState("");
  const [password, setPassword] = useState("");
  const [telefono, setTelefono] = useState("");
  const [especialidadId, setEspecialidadId] = useState("");
  const [precioConsulta, setPrecioConsulta] = useState("500");
  
  // Estados del sistema
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Listado de doctores
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // 1. Cargar especialidades y lista de doctores al iniciar
  const loadData = async () => {
    setLoadingList(true);
    try {
      // Cargar especialidades
      const { data: espData, error: espErr } = await supabase
        .from("especialidades")
        .select("*")
        .order("nombre", { ascending: true });

      if (espErr) console.error("Error cargando especialidades:", espErr.message);
      else {
        setSpecialties(espData || []);
        if (espData && espData.length > 0) {
          setEspecialidadId(espData[0].id.toString());
        }
      }

      // Cargar lista de doctores
      const res = await fetch("/api/admin/doctores");
      const result = await res.json();
      if (result.success) {
        setDoctorsList(result.doctors || []);
      } else {
        console.error("Error al cargar doctores:", result.error);
      }
    } catch (err) {
      console.error("Error de conexión:", err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. Manejo de Registro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/doctores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          apellidos,
          correo,
          curp,
          password,
          telefono,
          especialidad_id: especialidadId,
          precio_consulta: precioConsulta,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo registrar el doctor.");
      }

      setSuccessMsg("✓ Médico registrado exitosamente.");
      
      // Limpiar formulario
      setNombre("");
      setApellidos("");
      setCorreo("");
      setCurp("");
      setPassword("");
      setTelefono("");
      
      // Recargar lista de doctores
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Manejo de Eliminación
  const handleDelete = async (id: string, nombreDoc: string) => {
    const confirm = window.confirm(`¿Estás seguro de que deseas eliminar la cuenta del doctor ${nombreDoc}? Esta acción no se puede deshacer.`);
    if (!confirm) return;

    try {
      const res = await fetch(`/api/admin/doctores?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo eliminar el doctor.");
      }

      setSuccessMsg("✓ Profesional eliminado correctamente de Supabase.");
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "No se pudo eliminar el doctor.");
    }
  };

  return (
    <>
      <header className="safe-header bg-cyan-950/40 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
        <div className="flex items-center justify-between px-6 h-16 w-full">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin" className="text-cyan-400 active:scale-95 transition-transform hover:bg-white/10 p-2 rounded-full">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <h1 className="font-headline font-bold text-lg tracking-tight text-white">Registro de Doctores</h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-24 pb-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Formulario (Columna izquierda) */}
          <div className="lg:col-span-5">
            <div className="p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00a3ad]/10 rounded-full blur-[80px]"></div>
              
              <h2 className="text-2xl font-bold font-headline text-white mb-6">Nuevo Profesional</h2>
              
              {successMsg && (
                <div className="mb-6 bg-green-500/20 border border-green-500/40 text-green-300 text-sm font-semibold px-4 py-3 rounded-2xl text-center">
                  {successMsg}
                </div>
              )}

              {errorMsg && (
                <div className="mb-6 bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-semibold px-4 py-3 rounded-2xl text-center">
                  {errorMsg}
                </div>
              )}

              <form className="space-y-4 relative z-10" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">Nombre</label>
                    <input
                      className="w-full px-4 py-3.5 rounded-2xl text-white placeholder-slate-500 outline-none focus:border-[#00a3ad]"
                      placeholder="Ricardo"
                      type="text"
                      required
                      value={nombre} maxLength={50} onChange={(e) => setNombre(e.target.value)}
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">Apellido</label>
                    <input
                      className="w-full px-4 py-3.5 rounded-2xl text-white placeholder-slate-500 outline-none focus:border-[#00a3ad]"
                      placeholder="Milla"
                      type="text"
                      required
                      value={apellidos} maxLength={50} onChange={(e) => setApellidos(e.target.value)}
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">Correo Electrónico (Opcional si usa Teléfono)</label>
                  <input
                    className="w-full px-4 py-3.5 rounded-2xl text-white placeholder-slate-500 outline-none"
                    placeholder="doctor@nexussalud.app"
                    type="email"
                    value={correo} maxLength={100}
                    onChange={(e) => setCorreo(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">CURP</label>
                    <input
                      className="w-full px-4 py-3.5 rounded-2xl text-white placeholder-slate-500 outline-none"
                      placeholder="CURP (18 caracteres)"
                      type="text"
                      required
                      value={curp}
                      maxLength={18}
                      onChange={(e) => setCurp(e.target.value.toUpperCase())}
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">Teléfono (Opcional si usa Correo)</label>
                    <input
                      className="w-full px-4 py-3.5 rounded-2xl text-white placeholder-slate-500 outline-none"
                      placeholder="5512345678"
                      type="tel"
                      value={telefono}
                      maxLength={10}
                      onChange={(e) => setTelefono(e.target.value)}
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">Contraseña</label>
                  <div className="relative">
                    <input
                      className="w-full px-4 py-3.5 rounded-2xl text-white placeholder-slate-500 outline-none"
                      placeholder="••••••••"
                      required
                      type={showPass ? "text" : "password"}
                      value={password} maxLength={64}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors">
                      {showPass ? "visibility_off" : "visibility"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">Especialidad</label>
                    <select
                      className="w-full px-4 py-3.5 rounded-2xl text-white bg-cyan-950/80 outline-none border border-white/10"
                      value={especialidadId}
                      onChange={(e) => setEspecialidadId(e.target.value)}
                      required
                    >
                      {specialties.length === 0 ? (
                        <option value="" disabled>Cargando especialidades...</option>
                      ) : (
                        specialties.map((esp) => (
                          <option key={esp.id} value={esp.id} className="bg-cyan-950 text-white">
                            {esp.nombre}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">Precio Consulta ($)</label>
                    <input
                      className="w-full px-4 py-3.5 rounded-2xl text-white placeholder-slate-500 outline-none"
                      placeholder="500"
                      type="number"
                      required
                      value={precioConsulta}
                      onChange={(e) => setPrecioConsulta(e.target.value)}
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#00a3ad] disabled:bg-slate-700 text-white font-headline font-extrabold py-4 rounded-2xl shadow-[0_10px_30px_rgba(0,163,173,0.3)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    <span className="material-symbols-outlined">{loading ? "hourglass_empty" : "person_add"}</span>
                    {loading ? "Registrando..." : "Registrar Profesional"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Listado de Doctores (Columna derecha) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold font-headline text-white">Directorio Médico</h2>
                <p className="text-slate-400 text-sm">Doctores registrados en tiempo real</p>
              </div>
              <button
                type="button"
                onClick={loadData}
                className="material-symbols-outlined text-cyan-400 p-2 hover:bg-white/5 rounded-full border border-white/5 active:scale-95 transition-all"
              >
                refresh
              </button>
            </div>

            {loadingList ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-24 w-full bg-white/5 animate-pulse rounded-[1.5rem] border border-white/10"></div>
                ))}
              </div>
            ) : doctorsList.length === 0 ? (
              <div className="rounded-[1.5rem] p-10 text-center border border-white/10 bg-white/5">
                <span className="material-symbols-outlined text-cyan-400 text-5xl mb-4">medical_services</span>
                <h3 className="font-bold text-white mb-2">No hay médicos registrados</h3>
                <p className="text-slate-400 text-sm">Completa el formulario de la izquierda para registrar el primer profesional.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 max-h-[680px] overflow-y-auto pr-2">
                {doctorsList.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-[1.5rem] p-5 flex items-center justify-between transition-all hover:bg-white/5 border border-white/10 bg-white/5"
                    style={{ backdropFilter: "blur(20px)" }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <span className="material-symbols-outlined">stethoscope</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-white font-headline">
                          Dr. {doc.nombre} {doc.apellidos}
                        </h3>
                        <p className="text-xs text-cyan-300 font-semibold tracking-wider uppercase mb-1">
                          {doc.especialidad_nombre}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                          
                          {doc.telefono && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">call</span> {doc.telefono}
                            </span>
                          )}
                          <span className="flex items-center gap-1 font-bold text-emerald-400">
                            <span className="material-symbols-outlined text-xs text-emerald-400">payments</span> ${doc.precio_consulta} MXN
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(doc.id, `${doc.nombre} ${doc.apellidos}`)}
                      className="w-10 h-10 rounded-full flex items-center justify-center border border-red-500/20 text-red-400 bg-red-950/20 hover:bg-red-500 hover:text-white transition-all active:scale-95 duration-200"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
