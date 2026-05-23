"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function AdminConsultorios() {
  const supabase = createClient();
  const [branches, setBranches] = useState<any[]>([]);
  
  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [sucursalId, setSucursalId] = useState("");
  
  // Estados del sistema
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Listado de consultorios
  const [consultoriosList, setConsultoriosList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // 1. Cargar sucursales y consultorios
  const loadData = async () => {
    setLoadingList(true);
    try {
      // Cargar sucursales
      const { data: sucData, error: sucErr } = await supabase
        .from("sucursales")
        .select("*")
        .order("nombre", { ascending: true });

      if (sucErr) console.error("Error cargando sucursales:", sucErr.message);
      else {
        setBranches(sucData || []);
        if (sucData && sucData.length > 0) {
          setSucursalId(sucData[0].id.toString());
        }
      }

      // Cargar consultorios uniendo sucursales
      const { data: conData, error: conErr } = await supabase
        .from("consultorios")
        .select(`
          id,
          nombre,
          sucursal_id,
          sucursales (
            nombre
          )
        `)
        .order("created_at", { ascending: false });

      if (conErr) throw conErr;
      
      setConsultoriosList(conData || []);
    } catch (err: any) {
      console.error("Error al cargar consultorios:", err);
      setErrorMsg("No se pudieron cargar los consultorios.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. Registrar consultorio
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const { error } = await supabase
        .from("consultorios")
        .insert({
          nombre: nombre.trim(),
          sucursal_id: Number(sucursalId),
        });

      if (error) {
        if (error.message.includes("unique")) {
          throw new Error("Ya existe un consultorio con este nombre en la sucursal seleccionada.");
        }
        throw error;
      }

      setSuccessMsg("✓ Consultorio registrado exitosamente.");
      setNombre("");
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error al registrar el consultorio.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Eliminar consultorio
  const handleDelete = async (id: number, nombreCon: string) => {
    const confirm = window.confirm(`¿Estás seguro de que deseas eliminar el "${nombreCon}"? Esto cancelará o eliminará todas las citas y asignaciones en cascada.`);
    if (!confirm) return;

    try {
      const { error } = await supabase
        .from("consultorios")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      setSuccessMsg("✓ Consultorio eliminado correctamente.");
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "No se pudo eliminar el consultorio.");
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
            <h1 className="font-headline font-bold text-lg tracking-tight text-white">Gestión de Consultorios</h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-24 pb-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Formulario (Columna izquierda) */}
          <div className="lg:col-span-5">
            <div className="p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#f59e0b]/10 rounded-full blur-[80px]"></div>
              
              <h2 className="text-2xl font-bold font-headline text-white mb-6">Nuevo Consultorio / Sala</h2>
              
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
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">Nombre / Identificador</label>
                  <input
                    className="w-full px-4 py-3.5 rounded-2xl text-white placeholder-slate-500 outline-none focus:border-[#00a3ad]"
                    placeholder="Ej. Consultorio A-101"
                    type="text"
                    required
                    value={nombre} maxLength={50} onChange={(e) => setNombre(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">Ubicación (Sucursal)</label>
                  <select
                    className="w-full px-4 py-3.5 rounded-2xl text-white bg-cyan-950/80 outline-none border border-white/10"
                    value={sucursalId}
                    onChange={(e) => setSucursalId(e.target.value)}
                    required
                  >
                    {branches.length === 0 ? (
                      <option value="" disabled>Cargando sucursales...</option>
                    ) : (
                      branches.map((suc) => (
                        <option key={suc.id} value={suc.id} className="bg-cyan-950 text-white">
                          {suc.nombre}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#00a3ad] disabled:bg-slate-700 text-white font-headline font-extrabold py-4 rounded-2xl shadow-[0_10px_30px_rgba(0,163,173,0.3)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    <span className="material-symbols-outlined">{loading ? "hourglass_empty" : "meeting_room"}</span>
                    {loading ? "Registrando..." : "Registrar Consultorio"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Listado (Columna derecha) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold font-headline text-white">Consultorios Registrados</h2>
                <p className="text-slate-400 text-sm">Disponibilidad física en las sedes</p>
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
            ) : consultoriosList.length === 0 ? (
              <div className="rounded-[1.5rem] p-10 text-center border border-white/10 bg-white/5">
                <span className="material-symbols-outlined text-cyan-400 text-5xl mb-4">meeting_room</span>
                <h3 className="font-bold text-white mb-2">No hay consultorios registrados</h3>
                <p className="text-slate-400 text-sm">Usa el formulario de la izquierda para registrar tu primer consultorio.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 max-h-[680px] overflow-y-auto pr-2">
                {consultoriosList.map((con) => {
                  const branchName = con.sucursales?.nombre || "Sin Sucursal";
                  return (
                    <div
                      key={con.id}
                      className="rounded-[1.5rem] p-5 flex items-center justify-between transition-all hover:bg-white/5 border border-white/10 bg-white/5"
                      style={{ backdropFilter: "blur(20px)" }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                          <span className="material-symbols-outlined">meeting_room</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-white font-headline">
                            {con.nombre}
                          </h3>
                          <p className="text-xs text-cyan-300 font-semibold tracking-wider uppercase mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">store</span> {branchName}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(con.id, con.nombre)}
                        className="w-10 h-10 rounded-full flex items-center justify-center border border-red-500/20 text-red-400 bg-red-950/20 hover:bg-red-500 hover:text-white transition-all active:scale-95 duration-200"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
