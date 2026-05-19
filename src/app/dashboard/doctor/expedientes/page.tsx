"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import type { Expediente } from "@/types/supabase";

export default function DoctorExpedientes() {
  const supabase = createClient();
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNomForm, setShowNomForm] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [nomForm, setNomForm] = useState({
    motivo_consulta: "", ta: "", temperatura: "", frecuencia_cardiaca: "",
    resumen_clinico: "", diagnostico: "", plan_tratamiento: "",
  });

  // Paciente fijo de demostración — en producción viene de la cita activa
  const DEMO_PACIENTE_ID = ""; // Se llenaría con el id del paciente de la cita

  const fetchExpedientes = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    // RLS en Supabase ya garantiza que solo vea sus propias notas (NOM-004)
    const { data } = await supabase
      .from("expedientes")
      .select("*, paciente:perfiles!paciente_id(nombre, curp)")
      .eq("doctor_id", user.id)
      .order("fecha", { ascending: false });

    setExpedientes((data as Expediente[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchExpedientes(); }, [fetchExpedientes]);

  const handleGuardarNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    // En producción, paciente_id vendría de la cita activa seleccionada
    // Por ahora usamos el primer expediente existente como referencia o un paciente demo
    const pacienteId = expedientes[0]?.paciente_id || DEMO_PACIENTE_ID;

    if (!pacienteId) {
      alert("Selecciona un paciente primero desde la pantalla de Consultas.");
      return;
    }

    const { error } = await supabase.from("expedientes").insert({
      paciente_id: pacienteId,
      doctor_id: userId,
      fecha: new Date().toISOString().split("T")[0],
      ...nomForm,
    });

    if (error) { alert("Error al guardar: " + error.message); return; }

    alert("Nota médica guardada correctamente en el expediente.");
    setShowNomForm(false);
    setNomForm({ motivo_consulta: "", ta: "", temperatura: "", frecuencia_cardiaca: "", resumen_clinico: "", diagnostico: "", plan_tratamiento: "" });
    fetchExpedientes();
  };

  return (
    <>
      <header className="w-full top-0 sticky z-50 backdrop-blur-xl shadow-lg flex justify-between items-center px-6 pb-4 bg-white/10 border border-white/15"
        style={{ paddingTop: 'max(calc(env(safe-area-inset-top) + 1rem), 1.5rem)' }}>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/doctor" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors text-white">
            <span className="material-symbols-outlined">chevron_left</span>
          </Link>
          <span className="text-lg font-bold text-white font-headline tracking-tight">Gestión de Expedientes</span>
        </div>
        <button type="button" onClick={() => setShowNomForm(true)}
          className="flex items-center gap-2 bg-[#00a3ad] hover:bg-[#00a3ad]/80 text-white px-4 py-2 rounded-full text-xs font-bold transition-colors">
          <span className="material-symbols-outlined text-sm">edit_document</span>
          Nueva Nota (NOM-004)
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-8 pb-32 space-y-8">
        {loading ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-white/20 animate-spin">progress_activity</span>
          </div>
        ) : expedientes.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-[2rem] border border-white/10">
            <span className="material-symbols-outlined text-5xl text-white/20">folder_open</span>
            <p className="text-white/50 mt-2">No hay expedientes registrados aún.</p>
            <button onClick={() => setShowNomForm(true)}
              className="mt-4 bg-[#00a3ad] text-white px-6 py-2 rounded-full text-sm font-bold">
              Crear primera nota
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="font-headline text-2xl font-bold text-white">
              Expedientes — Solo mis registros
            </h2>
            <p className="text-white/40 text-xs uppercase tracking-wider">
              NOM-004-SSA3-2012 · {expedientes.length} notas médicas
            </p>
            {expedientes.map((exp, i) => (
              <div key={exp.id} className="bg-white/10 backdrop-blur-xl border border-white/15 p-6 rounded-[1.5rem] flex gap-6 hover:bg-white/15 transition-all duration-300">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#00a3ad]/20 flex items-center justify-center text-[#00a3ad] border border-[#00a3ad]/30">
                    <span className="material-symbols-outlined">event_note</span>
                  </div>
                  {i < expedientes.length - 1 && <div className="w-0.5 h-full bg-white/10 mt-4 rounded-full"></div>}
                </div>
                <div className="flex-grow space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-[#00a3ad] uppercase tracking-widest">{exp.fecha}</p>
                      <h3 className="text-lg font-bold text-white">{exp.motivo_consulta}</h3>
                      <p className="text-xs text-white/50">{(exp.paciente as any)?.nombre ?? "Paciente"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-black/20 rounded-xl p-4 border border-white/10">
                    {exp.ta && <div><p className="text-[10px] text-white/40 uppercase">TA</p><p className="text-sm text-white/80">{exp.ta}</p></div>}
                    {exp.temperatura && <div><p className="text-[10px] text-white/40 uppercase">Temp</p><p className="text-sm text-white/80">{exp.temperatura}</p></div>}
                    {exp.frecuencia_cardiaca && <div><p className="text-[10px] text-white/40 uppercase">FC</p><p className="text-sm text-white/80">{exp.frecuencia_cardiaca}</p></div>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/20 rounded-xl p-4 border border-white/10">
                    <div>
                      <p className="text-[10px] font-bold text-white/50 uppercase">Diagnóstico y Evolución (NOM-004)</p>
                      <p className="text-sm font-semibold text-white/90 mt-1">{exp.diagnostico}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white/50 uppercase">Plan de Tratamiento</p>
                      <p className="text-sm font-semibold text-white/90 mt-1">{exp.plan_tratamiento}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal NOM-004 */}
      {showNomForm && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#083344] border border-white/10 w-full max-w-2xl rounded-[2rem] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowNomForm(false)} className="absolute top-6 right-6 text-white/50 hover:text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="text-2xl font-bold text-white font-headline mb-2">Nota de Evolución Médica</h2>
            <p className="text-white/60 text-sm mb-6 uppercase tracking-wider font-semibold">CUMPLIMIENTO NOM-004-SSA3-2012</p>

            <form className="space-y-4" onSubmit={handleGuardarNota}>
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider font-bold mb-1 block">Motivo de Consulta *</label>
                <input required type="text" value={nomForm.motivo_consulta}
                  onChange={e => setNomForm({ ...nomForm, motivo_consulta: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-[#00a3ad]" />
              </div>
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider font-bold mb-1 block">Signos Vitales</label>
                <div className="grid grid-cols-3 gap-2">
                  <input placeholder="TA (mmHg)" type="text" value={nomForm.ta}
                    onChange={e => setNomForm({ ...nomForm, ta: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00a3ad]" />
                  <input placeholder="Temp (°C)" type="text" value={nomForm.temperatura}
                    onChange={e => setNomForm({ ...nomForm, temperatura: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00a3ad]" />
                  <input placeholder="FC (lpm)" type="text" value={nomForm.frecuencia_cardiaca}
                    onChange={e => setNomForm({ ...nomForm, frecuencia_cardiaca: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00a3ad]" />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider font-bold mb-1 block">Resumen Clínico y Exploración *</label>
                <textarea required rows={3} value={nomForm.resumen_clinico}
                  onChange={e => setNomForm({ ...nomForm, resumen_clinico: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-[#00a3ad]"></textarea>
              </div>
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider font-bold mb-1 block">Diagnóstico *</label>
                <textarea required rows={2} value={nomForm.diagnostico}
                  onChange={e => setNomForm({ ...nomForm, diagnostico: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-[#00a3ad]"></textarea>
              </div>
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider font-bold mb-1 block">Plan de Tratamiento *</label>
                <textarea required rows={2} value={nomForm.plan_tratamiento}
                  onChange={e => setNomForm({ ...nomForm, plan_tratamiento: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-[#00a3ad]"></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-4">
                <button type="button" onClick={() => setShowNomForm(false)} className="text-white/60 hover:text-white font-bold px-4">Cancelar</button>
                <button type="submit" className="bg-[#00a3ad] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-[#00a3ad]/80 transition-colors">
                  Firmar y Guardar Nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
