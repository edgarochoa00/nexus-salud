"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function AdminAsignaciones() {
  const supabase = createClient();

  // Datos cargados para los Selects
  const [doctors, setDoctors] = useState<any[]>([]);
  const [consultorios, setConsultorios] = useState<any[]>([]);

  // Estados del formulario
  const [doctorId, setDoctorId] = useState("");
  const [consultorioId, setConsultorioId] = useState("");
  const [diasSemana, setDiasSemana] = useState<string[]>(["lunes"]);
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFin, setHoraFin] = useState("18:00");

  // Estados del sistema
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Listado de asignaciones
  const [assignmentsList, setAssignmentsList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // 1. Cargar doctores, consultorios y asignaciones existentes
  const loadData = async () => {
    setLoadingList(true);
    setErrorMsg("");
    try {
      // a. Cargar Doctores (Usuarios con rol='doctor' y su especialidad)
      const { data: docData, error: docErr } = await supabase
        .from("usuarios")
        .select(`
          id,
          nombre,
          apellidos,
          doctores (
            especialidades (
              nombre
            )
          )
        `)
        .eq("rol", "doctor")
        .order("nombre", { ascending: true });

      if (docErr) {
        console.error("Error cargando doctores:", docErr.message);
      } else {
        const formattedDocs = (docData || []).map((u: any) => {
          const docInfo = u.doctores?.[0] || u.doctores || {};
          const espInfo = docInfo.especialidades || {};
          return {
            id: u.id,
            fullName: `Dr. ${u.nombre} ${u.apellidos}`,
            especialidad: espInfo.nombre || "Sin Especialidad",
          };
        });
        setDoctors(formattedDocs);
        if (formattedDocs.length > 0 && !doctorId) {
          setDoctorId(formattedDocs[0].id);
        }
      }

      // b. Cargar Consultorios (con sucursal)
      const { data: conData, error: conErr } = await supabase
        .from("consultorios")
        .select(`
          id,
          nombre,
          sucursales (
            nombre
          )
        `)
        .order("nombre", { ascending: true });

      if (conErr) {
        console.error("Error cargando consultorios:", conErr.message);
      } else {
        setConsultorios(conData || []);
        if (conData && conData.length > 0 && !consultorioId) {
          setConsultorioId(conData[0].id.toString());
        }
      }

      // c. Cargar Asignaciones de Horarios/Consultorios
      const { data: asigData, error: asigErr } = await supabase
        .from("doctor_consultorios")
        .select(`
          id,
          doctor_id,
          consultorio_id,
          dia_semana,
          hora_inicio,
          hora_fin,
          doctores (
            usuarios!doctores_id_fkey (
              nombre,
              apellidos
            ),
            especialidades (
              nombre
            )
          ),
          consultorios (
            nombre,
            sucursales (
              nombre
            )
          )
        `)
        .order("dia_semana", { ascending: true })
        .order("hora_inicio", { ascending: true });

      if (asigErr) throw asigErr;

      setAssignmentsList(asigData || []);
    } catch (err: any) {
      console.error("Error al cargar asignaciones:", err);
      setErrorMsg("Error cargando datos de Supabase. Asegúrate de ejecutar las migraciones SQL en tu editor.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. Registrar nueva asignación
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    // Validar horarios
    if (horaInicio >= horaFin) {
      setErrorMsg("La hora de inicio debe ser menor que la hora de fin.");
      setLoading(false);
      return;
    }

    try {
      if (diasSemana.length === 0) {
        setErrorMsg("Debes seleccionar al menos un día de la semana.");
        setLoading(false);
        return;
      }

      const tInicio = horaInicio.length === 5 ? `${horaInicio}:00` : horaInicio;
      const tFin = horaFin.length === 5 ? `${horaFin}:00` : horaFin;

      // Validate all selected days
      for (const dia of diasSemana) {
        const choqueConsultorio = assignmentsList.find((asig) => {
          if (asig.dia_semana === dia && asig.consultorio_id === Number(consultorioId)) {
            if (tInicio < asig.hora_fin && tFin > asig.hora_inicio) return true;
          }
          return false;
        });

        if (choqueConsultorio) {
          const docConflicto = choqueConsultorio.doctores?.usuarios?.nombre || "otro médico";
          const docApellidos = choqueConsultorio.doctores?.usuarios?.apellidos || "";
          setErrorMsg(`Choque de horario: El consultorio ya está ocupado el ${dia} de ${choqueConsultorio.hora_inicio.slice(0,5)} a ${choqueConsultorio.hora_fin.slice(0,5)} por Dr. ${docConflicto} ${docApellidos}.`);
          setLoading(false);
          return;
        }
        
        const choqueDoctor = assignmentsList.find((asig) => {
          if (asig.dia_semana === dia && asig.doctor_id === doctorId) {
            if (tInicio < asig.hora_fin && tFin > asig.hora_inicio) return true;
          }
          return false;
        });

        if (choqueDoctor) {
          const conConflicto = choqueDoctor.consultorios?.nombre || "otro consultorio";
          setErrorMsg(`Choque de horario: El médico ya tiene turno en ${conConflicto} el ${dia} de ${choqueDoctor.hora_inicio.slice(0,5)} a ${choqueDoctor.hora_fin.slice(0,5)}.`);
          setLoading(false);
          return;
        }
      }

      // Insert all
      const inserts = diasSemana.map((dia) => ({
        doctor_id: doctorId,
        consultorio_id: Number(consultorioId),
        dia_semana: dia,
        hora_inicio: tInicio,
        hora_fin: tFin,
      }));

      const { error } = await supabase.from("doctor_consultorios").insert(inserts);

      if (error) {
        throw error;
      }

      setSuccessMsg("✓ Asignación de horario y consultorio registrada exitosamente.");
      loadData();
    } catch (err: any) {
      console.error("Error al guardar asignación:", err);
      setErrorMsg(err.message || "Ocurrió un error al registrar la asignación.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Eliminar asignación
  const handleDelete = async (id: number, doctorName: string, consultorioName: string, dia: string) => {
    const confirm = window.confirm(
      `¿Estás seguro de que deseas retirar la asignación de ${doctorName} en el "${consultorioName}" los días ${dia}?`
    );
    if (!confirm) return;

    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { error } = await supabase
        .from("doctor_consultorios")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setSuccessMsg("✓ Asignación retirada correctamente.");
      loadData();
    } catch (err: any) {
      console.error("Error al eliminar asignación:", err);
      setErrorMsg(err.message || "No se pudo retirar la asignación.");
    }
  };

  // Capitalizar textos de día de semana
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <>
      <header className="safe-header bg-cyan-950/40 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
        <div className="flex items-center justify-between px-6 h-16 w-full">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin" className="text-cyan-400 active:scale-95 transition-transform hover:bg-white/10 p-2 rounded-full">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <h1 className="font-headline font-bold text-lg tracking-tight text-white">Asignación de Horarios y Consultorios</h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-24 pb-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Formulario (Columna izquierda) */}
          <div className="lg:col-span-5">
            <div className="p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden bg-white/5 border border-white/10" style={{ backdropFilter: "blur(20px)" }}>
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-[80px]"></div>
              
              <h2 className="text-2xl font-bold font-headline text-white mb-6">Asignar Turno / Horario</h2>
              
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
                {/* Selector de Médico */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-rose-300 uppercase tracking-widest ml-1">Médico Profesional</label>
                  <select
                    className="w-full px-4 py-3.5 rounded-2xl text-white bg-cyan-950/80 outline-none border border-white/10"
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    required
                  >
                    {doctors.length === 0 ? (
                      <option value="" disabled>Cargando médicos...</option>
                    ) : (
                      doctors.map((doc) => (
                        <option key={doc.id} value={doc.id} className="bg-cyan-950 text-white">
                          {doc.fullName} ({doc.especialidad})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Selector de Consultorio */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-rose-300 uppercase tracking-widest ml-1">Consultorio / Consultorio Físico</label>
                  <select
                    className="w-full px-4 py-3.5 rounded-2xl text-white bg-cyan-950/80 outline-none border border-white/10"
                    value={consultorioId}
                    onChange={(e) => setConsultorioId(e.target.value)}
                    required
                  >
                    {consultorios.length === 0 ? (
                      <option value="" disabled>Cargando consultorios...</option>
                    ) : (
                      consultorios.map((con) => {
                        const branchName = con.sucursales?.nombre || "Sin Sucursal";
                        return (
                          <option key={con.id} value={con.id} className="bg-cyan-950 text-white">
                            {con.nombre} — {branchName}
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>

                {/* Selector de Día */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-rose-300 uppercase tracking-widest ml-1">Días de la Semana (Múltiples)</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                    {["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"].map(dia => (
                      <label key={dia} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-white/20 bg-cyan-950/50 text-rose-500 focus:ring-rose-500/50"
                          checked={diasSemana.includes(dia)}
                          onChange={(e) => {
                            if (e.target.checked) setDiasSemana([...diasSemana, dia]);
                            else setDiasSemana(diasSemana.filter(d => d !== dia));
                          }}
                        />
                        <span className="text-sm text-slate-300 group-hover:text-white transition-colors capitalize">{dia}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Horas */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-rose-300 uppercase tracking-widest ml-1">Hora Inicio</label>
                    <input
                      className="w-full px-4 py-3.5 rounded-2xl text-white placeholder-slate-500 outline-none focus:border-rose-400"
                      type="time"
                      required
                      value={horaInicio}
                      onChange={(e) => setHoraInicio(e.target.value)}
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-rose-300 uppercase tracking-widest ml-1">Hora Fin</label>
                    <input
                      className="w-full px-4 py-3.5 rounded-2xl text-white placeholder-slate-500 outline-none focus:border-rose-400"
                      type="time"
                      required
                      value={horaFin}
                      onChange={(e) => setHoraFin(e.target.value)}
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading || doctors.length === 0 || consultorios.length === 0}
                    className="w-full bg-rose-600 disabled:bg-slate-700 text-white font-headline font-extrabold py-4 rounded-2xl shadow-[0_10px_30px_rgba(225,29,72,0.3)] hover:bg-rose-500 hover:shadow-[0_10px_35px_rgba(225,29,72,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    <span className="material-symbols-outlined">{loading ? "hourglass_empty" : "calendar_month"}</span>
                    {loading ? "Asignando..." : "Asignar Horario"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Listado (Columna derecha) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold font-headline text-white">Disponibilidad Asignada</h2>
                <p className="text-slate-400 text-sm">Cronograma y agendas activas por consultorio</p>
              </div>
              <button
                type="button"
                onClick={loadData}
                className="material-symbols-outlined text-rose-400 p-2 hover:bg-white/5 rounded-full border border-white/5 active:scale-95 transition-all"
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
            ) : assignmentsList.length === 0 ? (
              <div className="rounded-[1.5rem] p-10 text-center border border-white/10 bg-white/5">
                <span className="material-symbols-outlined text-rose-400 text-5xl mb-4">calendar_month</span>
                <h3 className="font-bold text-white mb-2">No hay horarios asignados</h3>
                <p className="text-slate-400 text-sm">Registra un turno para un médico usando el formulario de la izquierda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 max-h-[680px] overflow-y-auto pr-2">
                {assignmentsList.map((asig) => {
                  // Aplanar nombres para el despliegue
                  const docUser = asig.doctores?.usuarios || {};
                  const doctorName = docUser.nombre ? `Dr. ${docUser.nombre} ${docUser.apellidos}` : "Médico Desconocido";
                  const specialty = asig.doctores?.especialidades?.nombre || "Sin Especialidad";
                  const conName = asig.consultorios?.nombre || "Consultorio Desconocido";
                  const branchName = asig.consultorios?.sucursales?.nombre || "Sin Sucursal";

                  // Formatear horas para visualización más amigable (quitar segundos extras si existen)
                  const formatTime = (t: string) => {
                    if (!t) return "";
                    const parts = t.split(":");
                    if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
                    return t;
                  };

                  return (
                    <div
                      key={asig.id}
                      className="rounded-[1.5rem] p-5 flex items-center justify-between transition-all hover:bg-white/5 border border-white/10 bg-white/5"
                      style={{ backdropFilter: "blur(20px)" }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                          <span className="material-symbols-outlined">schedule</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-white font-headline">
                            {doctorName}
                          </h3>
                          <p className="text-xs text-rose-300 font-semibold tracking-wider uppercase mb-1">
                            {specialty}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">meeting_room</span> {conName} ({branchName})
                            </span>
                            <span className="flex items-center gap-1 font-bold text-cyan-300">
                              <span className="material-symbols-outlined text-xs">event</span> {capitalize(asig.dia_semana)}
                            </span>
                            <span className="flex items-center gap-1 text-emerald-400">
                              <span className="material-symbols-outlined text-xs">alarm</span> {formatTime(asig.hora_inicio)} - {formatTime(asig.hora_fin)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(asig.id, doctorName, conName, capitalize(asig.dia_semana))}
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
