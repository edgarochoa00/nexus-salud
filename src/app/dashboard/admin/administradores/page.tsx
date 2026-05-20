"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function AdminRegistroAdministradores() {
  const supabase = createClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [telefono, setTelefono] = useState("");
  
  // Estados del sistema
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Listado de administradores
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // 1. Obtener usuario actual y cargar administradores
  const loadData = async () => {
    setLoadingList(true);
    try {
      // Obtener el ID del administrador logueado para seguridad
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        setCurrentUserId(userData.user.id);
      }

      // Cargar lista de administradores
      const res = await fetch("/api/admin/administradores");
      const result = await res.json();
      if (result.success) {
        setAdminsList(result.admins || []);
      } else {
        console.error("Error al cargar administradores:", result.error);
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

  // 2. Registrar administrador
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/administradores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          apellidos,
          correo,
          username,
          password,
          telefono,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo registrar el administrador.");
      }

      setSuccessMsg("✓ Administrador registrado exitosamente.");
      
      // Limpiar formulario
      setNombre("");
      setApellidos("");
      setCorreo("");
      setUsername("");
      setPassword("");
      setTelefono("");
      
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Eliminar administrador
  const handleDelete = async (id: string, nombreAdmin: string) => {
    if (id === currentUserId) {
      alert("Por motivos de seguridad, no puedes eliminar tu propia cuenta de administrador mientras estás en sesión.");
      return;
    }

    const confirm = window.confirm(`¿Estás seguro de que deseas eliminar al administrador ${nombreAdmin}? Esta acción no se puede deshacer.`);
    if (!confirm) return;

    try {
      const res = await fetch(`/api/admin/administradores?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo eliminar el administrador.");
      }

      setSuccessMsg("✓ Administrador eliminado correctamente.");
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "No se pudo eliminar el administrador.");
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
            <h1 className="font-headline font-bold text-lg tracking-tight text-white">Registro de Administradores</h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-24 pb-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Formulario (Columna izquierda) */}
          <div className="lg:col-span-5">
            <div className="p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#a855f7]/10 rounded-full blur-[80px]"></div>
              
              <h2 className="text-2xl font-bold font-headline text-white mb-6">Nuevo Administrador</h2>
              
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
                      placeholder="Ej. Carlos"
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">Apellido</label>
                    <input
                      className="w-full px-4 py-3.5 rounded-2xl text-white placeholder-slate-500 outline-none focus:border-[#00a3ad]"
                      placeholder="Ej. Gómez"
                      type="text"
                      required
                      value={apellidos}
                      onChange={(e) => setApellidos(e.target.value)}
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                  <input
                    className="w-full px-4 py-3.5 rounded-2xl text-white placeholder-slate-500 outline-none"
                    placeholder="admin@nexussalud.app"
                    type="email"
                    required
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">ID Usuario (Login)</label>
                    <input
                      className="w-full px-4 py-3.5 rounded-2xl text-white placeholder-slate-500 outline-none"
                      placeholder="admin_nexus"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">Teléfono</label>
                    <input
                      className="w-full px-4 py-3.5 rounded-2xl text-white placeholder-slate-500 outline-none"
                      placeholder="5534567890"
                      type="tel"
                      value={telefono}
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors">
                      {showPass ? "visibility_off" : "visibility"}
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#00a3ad] disabled:bg-slate-700 text-white font-headline font-extrabold py-4 rounded-2xl shadow-[0_10px_30px_rgba(0,163,173,0.3)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    <span className="material-symbols-outlined">{loading ? "hourglass_empty" : "admin_panel_settings"}</span>
                    {loading ? "Registrando..." : "Registrar Administrador"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Listado de Administradores (Columna derecha) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold font-headline text-white">Equipo de Administradores</h2>
                <p className="text-slate-400 text-sm">Cuentas con acceso total de configuración</p>
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
            ) : adminsList.length === 0 ? (
              <div className="rounded-[1.5rem] p-10 text-center border border-white/10 bg-white/5">
                <span className="material-symbols-outlined text-cyan-400 text-5xl mb-4">admin_panel_settings</span>
                <h3 className="font-bold text-white mb-2">No hay administradores</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 max-h-[680px] overflow-y-auto pr-2">
                {adminsList.map((admin) => (
                  <div
                    key={admin.id}
                    className="rounded-[1.5rem] p-5 flex items-center justify-between transition-all hover:bg-white/5 border border-white/10 bg-white/5"
                    style={{ backdropFilter: "blur(20px)" }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <span className="material-symbols-outlined">admin_panel_settings</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-white font-headline">
                          {admin.nombre} {admin.apellidos} {admin.id === currentUserId && <span className="text-xs text-cyan-300 font-bold bg-cyan-950 px-2 py-0.5 rounded-full ml-2">Tú</span>}
                        </h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">badge</span> {admin.usuario}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">mail</span> {admin.correo}
                          </span>
                        </div>
                      </div>
                    </div>

                    {admin.id !== currentUserId && (
                      <button
                        type="button"
                        onClick={() => handleDelete(admin.id, `${admin.nombre} ${admin.apellidos}`)}
                        className="w-10 h-10 rounded-full flex items-center justify-center border border-red-500/20 text-red-400 bg-red-950/20 hover:bg-red-500 hover:text-white transition-all active:scale-95 duration-200"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    )}
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
