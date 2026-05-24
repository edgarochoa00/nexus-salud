"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function DoctorConsultas() {
  const supabase = createClient();
  const [citasCompletadas, setCitasCompletadas] = useState<any[]>([]);
  const [citasPendientes, setCitasPendientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Formulario para nueva consulta
  const [selectedCitaId, setSelectedCitaId] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [receta, setReceta] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchCitas = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [completadasRes, pendientesRes] = await Promise.all([
      supabase
        .from("citas")
        .select(`
          id, fecha, hora, estado,
          paciente:pacientes!paciente_id(id, usuarios(id, nombre, apellidos)),
          consultorio:consultorios(nombre),
          consultas(id, motivo, receta, fecha_hora)
        `)
        .eq("doctor_id", user.id)
        .eq("estado", "completada")
        .order("fecha", { ascending: false })
        .limit(20),
      supabase
        .from("citas")
        .select(`
          id, fecha, hora, estado,
          paciente:pacientes!paciente_id(id, usuarios(id, nombre, apellidos)),
          consultorio:consultorios(nombre)
        `)
        .eq("doctor_id", user.id)
        .in("estado", ["pendiente", "confirmada"])
        .order("fecha", { ascending: true })
        .order("hora", { ascending: true })
    ]);

    if (!completadasRes.error) setCitasCompletadas(completadasRes.data || []);
    if (!pendientesRes.error) setCitasPendientes(pendientesRes.data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const urlCitaId = searchParams.get("cita_id");
      if (urlCitaId) {
        setSelectedCitaId(Number(urlCitaId));
        setIsLocked(true);
      }
    }
    fetchCitas();
  }, [fetchCitas]);

  // Si la cita seleccionada ya está completada, poblar los campos con los datos existentes
  useEffect(() => {
    if (selectedCitaId && citasCompletadas.length > 0) {
      const cita = citasCompletadas.find(c => c.id === selectedCitaId);
      if (cita && cita.consultas && cita.consultas.length > 0) {
        setMotivo(cita.consultas[0].motivo || "");
        setReceta(cita.consultas[0].receta || "");
      }
    }
  }, [selectedCitaId, citasCompletadas]);

  const handleGuardarConsulta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCitaId || !motivo.trim() || !receta.trim()) {
      setErrorMsg("Debes llenar el motivo y la receta/indicaciones para completar la consulta.");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // 1. Obtener expediente del paciente desde la cita
      const cita = citasPendientes.find((c) => c.id === selectedCitaId);
      if (!cita) throw new Error("Cita no encontrada.");

      const pacienteId = cita.paciente?.id;
      if (!pacienteId) throw new Error("No se encontró el paciente de esta cita.");

      // 2. Buscar o crear expediente del paciente
      let { data: expData, error: expError } = await supabase
        .from("expedientes")
        .select("id")
        .eq("paciente_id", pacienteId)
        .single();

      if (expError || !expData) {
        // Crear expediente si no existe
        const { data: newExp, error: createErr } = await supabase
          .from("expedientes")
          .insert({ paciente_id: pacienteId })
          .select("id")
          .single();

        if (createErr || !newExp) throw new Error("No se pudo crear el expediente: " + createErr?.message);
        expData = newExp;
      }

      // 3. Insertar la consulta
      const { error: insertError } = await supabase.from("consultas").insert({
        motivo: motivo.trim(),
        receta: receta.trim() || null,
        expediente_id: expData.id,
        cita_id: selectedCitaId,
        fecha_hora: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      // 4. Actualizar el estado de la cita a 'completada'
      const { error: updateError } = await supabase
        .from("citas")
        .update({ estado: "completada" })
        .eq("id", selectedCitaId);

      if (updateError) console.error("No se pudo marcar la cita como completada:", updateError);

      setSuccessMsg("✓ Consulta registrada exitosamente en el expediente del paciente.");
      setMotivo("");
      setReceta("");
      setSelectedCitaId(null);
      setIsLocked(false);
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", window.location.pathname);
      }
      fetchCitas();
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error al guardar la consulta.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 pb-4 bg-[#002022]/80 backdrop-blur-xl border-b border-white/10 shadow-lg"
        style={{ paddingTop: "max(calc(env(safe-area-inset-top) + 1rem), 1.5rem)" }}
      >
        <div className="flex items-center gap-4">
          <Link href="/dashboard/doctor" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-all text-white/70">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-[#00a3ad] font-headline">Registrar Consulta</h1>
        </div>
      </header>

      <main className="pb-32 px-6 max-w-5xl mx-auto" style={{ paddingTop: "calc(env(safe-area-inset-top) + 5rem)" }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Formulario */}
          <div className="lg:col-span-5">
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 relative overflow-hidden" style={{ backdropFilter: "blur(20px)" }}>
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-[60px]"></div>
              <h2 className="text-2xl font-bold font-headline text-white mb-6">Nueva Consulta</h2>

              {successMsg && (
                <div className="mb-4 bg-green-500/20 border border-green-500/40 text-green-300 text-sm font-semibold px-4 py-3 rounded-2xl">
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="mb-4 bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-semibold px-4 py-3 rounded-2xl">
                  {errorMsg}
                </div>
              )}

              <form className="space-y-4 relative z-10" onSubmit={handleGuardarConsulta}>
                {/* Selector de cita */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest ml-1">
                    {isLocked || citasCompletadas.some(c => c.id === selectedCitaId) ? "Paciente Seleccionado" : "Cita (Por Atender)"}
                  </label>
                  {isLocked || citasCompletadas.some(c => c.id === selectedCitaId) ? (
                    <div
                      className="w-full px-4 py-3 rounded-2xl text-white outline-none flex items-center bg-cyan-950 opacity-90 border border-white/20 relative"
                    >
                      <span className="material-symbols-outlined mr-2 text-emerald-400 text-lg">person</span>
                      <span className="flex-1 truncate">
                        {[...citasPendientes, ...citasCompletadas].find(c => c.id === selectedCitaId)?.paciente?.usuarios 
                          ? `${[...citasPendientes, ...citasCompletadas].find(c => c.id === selectedCitaId)?.paciente?.usuarios?.nombre} ${[...citasPendientes, ...citasCompletadas].find(c => c.id === selectedCitaId)?.paciente?.usuarios?.apellidos}` 
                          : "Cargando paciente..."}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => { setSelectedCitaId(null); setIsLocked(false); setMotivo(""); setReceta(""); }}
                        className="material-symbols-outlined text-white/50 hover:text-white transition-colors absolute right-4"
                      >
                        close
                      </button>
                    </div>
                  ) : (
                    <select
                      className="w-full px-4 py-3 rounded-2xl text-white outline-none cursor-pointer appearance-none"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                      value={selectedCitaId || ""}
                      onChange={(e) => setSelectedCitaId(Number(e.target.value))}
                      required
                    >
                      <option value="" disabled>Seleccionar cita...</option>
                      {citasPendientes.map((c: any) => (
                        <option key={c.id} value={c.id} className="bg-cyan-950 text-white">
                          {c.fecha} {c.hora?.slice(0, 5)} — {c.paciente?.usuarios ? `${c.paciente.usuarios.nombre} ${c.paciente.usuarios.apellidos}` : "Paciente"}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Motivo */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest ml-1">
                    Motivo de Consulta *
                  </label>
                  <textarea
                    className="w-full px-4 py-3.5 rounded-2xl text-white placeholder-slate-500 outline-none min-h-[100px] resize-none"
                    placeholder="Dolor de muela, sensibilidad al frío..."
                    required
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>

                {/* Receta */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest ml-1">
                    Receta / Indicaciones *
                  </label>
                  <textarea
                    className="w-full px-4 py-3.5 rounded-2xl text-white placeholder-slate-500 outline-none min-h-[120px] resize-none"
                    placeholder="Amoxicilina 500mg cada 8h por 7 días. Ibuprofeno 400mg en caso de dolor..."
                    value={receta}
                    onChange={(e) => setReceta(e.target.value)}
                    required
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>

                {/* Botón de Guardar */}
                <div className="pt-2">
                  {citasCompletadas.some(c => c.id === selectedCitaId) ? (
                    <div className="w-full bg-emerald-500/20 text-emerald-300 font-headline font-bold py-4 rounded-2xl flex items-center justify-center gap-3 border border-emerald-500/30">
                      <span className="material-symbols-outlined">check_circle</span>
                      Esta consulta ya fue completada y guardada.
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={saving || !selectedCitaId}
                      className="w-full bg-emerald-600 disabled:bg-slate-700 disabled:opacity-50 text-white font-headline font-extrabold py-4 rounded-2xl shadow-[0_10px_30px_rgba(5,150,105,0.3)] hover:bg-emerald-500 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                      <span className="material-symbols-outlined">{saving ? "hourglass_empty" : "save"}</span>
                      {saving ? "Guardando..." : "Guardar en Expediente"}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Historial de citas completadas */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold font-headline text-white">Citas Completadas</h2>
                <p className="text-slate-400 text-sm">
                  {selectedCitaId ? "Historial clínico del paciente" : "Historial general"}
                </p>
              </div>
              <button type="button" onClick={fetchCitas} className="text-[#00a3ad] p-2 rounded-full hover:bg-white/5 border border-white/5 active:scale-95 transition-all">
                <span className="material-symbols-outlined">refresh</span>
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => <div key={n} className="h-20 bg-white/5 animate-pulse rounded-[1.5rem]" />)}
              </div>
            ) : (() => {
              const filtradas = citasCompletadas.filter((cita: any) => {
                if (!selectedCitaId) return true;
                const citaActual = [...citasPendientes, ...citasCompletadas].find(c => c.id === selectedCitaId);
                if (!citaActual || !citaActual.paciente) return true;
                return cita.paciente?.id === citaActual.paciente.id;
              });
              
              if (filtradas.length === 0) {
                return (
                  <div className="text-center py-12 bg-white/5 border border-white/10 rounded-[1.5rem]">
                    <span className="material-symbols-outlined text-4xl text-white/20">stethoscope</span>
                    <p className="text-white/40 text-sm mt-2">
                      {selectedCitaId ? "Este paciente no tiene historial de citas pasadas." : "No hay citas completadas aún."}
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {filtradas.map((cita: any) => {
                    const tieneConsulta = cita.consultas?.length > 0;
                    const consulta = cita.consultas?.[0];
                    return (
                      <div
                        key={cita.id}
                        className={`p-4 rounded-[1.5rem] border transition-all cursor-pointer ${
                          selectedCitaId === cita.id
                          ? "bg-emerald-500/10 border-emerald-500/40"
                          : "bg-white/5 border-white/10 hover:bg-white/8"
                      }`}
                      onClick={() => setSelectedCitaId(cita.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 text-xs font-bold">
                            {cita.hora?.slice(0, 5)}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm font-headline">
                              {cita.paciente?.usuarios ? `${cita.paciente.usuarios.nombre} ${cita.paciente.usuarios.apellidos}` : "Paciente"}
                            </h4>
                            <p className="text-xs text-white/40">{cita.fecha} · {cita.consultorio?.nombre || "—"}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${
                          tieneConsulta
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                        }`}>
                          {tieneConsulta ? "Registrada" : "Sin consulta"}
                        </span>
                      </div>
                      {tieneConsulta && consulta?.motivo && (
                        <p className="text-xs text-white/40 mt-2 ml-13 pl-13 border-t border-white/5 pt-2 truncate">
                          {consulta.motivo}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
          </div>
        </div>
      </main>
    </>
  );
}
