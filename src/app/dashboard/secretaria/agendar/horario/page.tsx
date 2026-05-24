"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { obtenerCitaEnProceso, guardarCitaEnProceso } from "@/utils/citaStore";
import { createClient } from "@/utils/supabase/client";

export default function SecretariaHorarioSelection() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [cita, setCita] = useState<any>({});

  const [schedules, setSchedules] = useState<any[]>([]);

  
  useEffect(() => {
    setIsMounted(true);
    const dataCita = obtenerCitaEnProceso();
    setCita(dataCita);
    const supabase = createClient();
    const { doctor_id, sucursal } = dataCita;
    if (doctor_id) {
      supabase
        .from("doctor_consultorios")
        .select("dia_semana, hora_inicio, hora_fin, consultorios(sucursales(nombre))")
        .eq("doctor_id", doctor_id)
        .then(({ data }) => {
          if (data) {
            // Eliminamos el filtro por sucursal para que muestre TODOS los días del doctor
            setSchedules(data);
          }
        });
    }
  }, []);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const adjustedFirstDay = (firstDay + 6) % 7;

  const calendarDays: Array<{ date: Date | null }> = [];
  for (let i = 0; i < adjustedFirstDay; i++) calendarDays.push({ date: null });
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({ date: new Date(currentYear, currentMonth, d) });
  }

  
  
  const mapDiaSemana = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  const isDayAvailable = (date: Date) => {
    if (schedules.length === 0) return true; // Si no hay horarios, permite todos (fallback)
    const dayName = mapDiaSemana[date.getDay()];
    // Ojo: en BD puede decir "miércoles" con acento, normalizamos
    return schedules.some(s => s.dia_semana.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === dayName);
  };

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const goNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };
  const goPrevMonth = () => {
    const now = new Date();
    if (currentYear === now.getFullYear() && currentMonth === now.getMonth()) return;
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  useEffect(() => {
    if (selectedDate && selectedTime) {
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const dd = String(selectedDate.getDate()).padStart(2, "0");
      guardarCitaEnProceso({ fecha: `${yyyy}-${mm}-${dd}`, hora: selectedTime });
    }
  }, [selectedDate, selectedTime]);

    const canContinue = !!selectedDate && !!selectedTime;

  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loadingHours, setLoadingHours] = useState(false);

  useEffect(() => {
    if (selectedDate && cita.doctor_id) {
      setLoadingHours(true);
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const dd = String(selectedDate.getDate()).padStart(2, "0");
      const fechaStr = `${yyyy}-${mm}-${dd}`;

      fetch(`/api/paciente/agendar/horarios_ocupados?doctorId=${cita.doctor_id}&fecha=${fechaStr}`, {
        cache: 'no-store'
      })
        .then(res => res.json())
        .then(result => {
          if (result.success && result.horarios) {
            setBookedTimes(result.horarios.map((d: any) => d.hora.slice(0, 5)));
          }
          setLoadingHours(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingHours(false);
        });
    } else {
      setBookedTimes([]);
    }
  }, [selectedDate, cita.doctor_id]);
  
    const generateTimeSlots = () => {
    if (!selectedDate || schedules.length === 0) return { morning: [], afternoon: [] };
    const dayName = mapDiaSemana[selectedDate.getDay()];
    const schedule = schedules.find(s => s.dia_semana.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === dayName);
    if (!schedule) return { morning: [], afternoon: [] };

    const slots: string[] = [];
    let [currentH, currentM] = schedule.hora_inicio.split(":").map(Number);
    const [endH, endM] = schedule.hora_fin.split(":").map(Number);
    
    while (currentH < endH || (currentH === endH && currentM < endM)) {
      const timeStr = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;
      slots.push(timeStr);
      currentM += 30;
      if (currentM >= 60) {
        currentH += 1;
        currentM -= 60;
      }
    }

    return {
      morning: slots.filter(t => parseInt(t.split(":")[0]) < 12),
      afternoon: slots.filter(t => parseInt(t.split(":")[0]) >= 12)
    };
  };

  const { morning: validMorningTimes, afternoon: validAfternoonTimes } = generateTimeSlots();

  const isTodaySelected = selectedDate && selectedDate.toDateString() === today.toDateString();
  const nowHour = today.getHours();
  const nowMin = today.getMinutes();

  const isTimePast = (timeStr: string) => {
    if (!isTodaySelected) return false;
    const [h, m] = timeStr.split(":").map(Number);
    if (h < nowHour) return true;
    if (h === nowHour && m <= nowMin) return true;
    return false;
  };

  if (!isMounted) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin material-symbols-outlined text-4xl text-cyan-400">progress_activity</div></div>;

  return (
    <main className="relative z-10 px-6 pt-safe-24 pb-32 space-y-6 max-w-lg mx-auto w-full">
      <div className="mb-2">
        <h1 className="font-headline font-bold text-2xl tracking-tight text-white">Agendar Cita</h1>
      </div>

      {/* Summary Card */}
      <section className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[inset_1px_1px_0_rgba(255,255,255,0.1)] rounded-[1.5rem] p-4 flex items-center space-x-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary-container)]/40 to-[var(--color-primary-container)]/10 border border-white/10 flex items-center justify-center text-[var(--color-primary-container)]">
          <span className="material-symbols-outlined text-3xl">medical_services</span>
        </div>
        <div className="flex-1">
          <h3 className="font-headline font-bold text-white text-base">{cita.doctor_nombre ?? "Doctor"}</h3>
          <p className="text-white/50 text-xs">{cita.especialidad ?? "Especialidad"} • {cita.sucursal ?? "Sucursal"}</p>
          {cita.paciente_nombre && (
            <p className="text-[var(--color-primary-container)] text-xs mt-0.5">Paciente: {cita.paciente_nombre}</p>
          )}
        </div>
      </section>

      {/* Calendar */}
      <section className="space-y-4">
        <h2 className="font-headline font-semibold text-lg flex items-center text-white">
          <span className="material-symbols-outlined mr-2 text-[var(--color-primary-container)]">calendar_today</span>
          Seleccionar Fecha
        </h2>
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[inset_1px_1px_0_rgba(255,255,255,0.1)] rounded-3xl p-6">
          <div className="flex justify-between items-center mb-6">
            <span className="font-headline font-bold text-white">{monthNames[currentMonth]} {currentYear}</span>
            <div className="flex space-x-4">
              <button type="button" onClick={goPrevMonth} className="material-symbols-outlined text-white/30 hover:text-cyan-400 cursor-pointer transition-colors">chevron_left</button>
              <button type="button" onClick={goNextMonth} className="material-symbols-outlined text-white/30 hover:text-cyan-400 cursor-pointer transition-colors">chevron_right</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-y-4 text-center">
            {["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map((day) => (
              <div key={day} className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{day}</div>
            ))}
            {calendarDays.map((dayObj, i) => {
              if (!dayObj.date) return <div key={i} />;
              const d = dayObj.date;
              const isPast = d < today && d.toDateString() !== today.toDateString();
              const isAvailable = isDayAvailable(d);
              const isSelected = selectedDate?.toDateString() === d.toDateString();
              const isToday = d.toDateString() === today.toDateString();
              return (
                <div
                  key={i}
                  onClick={() => !isPast && setSelectedDate(d)}
                  className={`text-sm py-2 cursor-pointer transition-colors relative flex items-center justify-center ${isPast ? "text-white/15 cursor-not-allowed" : isSelected ? "text-white font-bold" : isToday ? "text-[var(--color-primary-container)] font-semibold" : "text-white hover:text-cyan-400"}`}
                >
                  {isSelected && <div className="absolute w-10 h-10 bg-[var(--color-primary-container)] rounded-xl shadow-[0_0_20px_rgba(0,163,173,0.6)] z-0"></div>}
                  <span className="relative z-10">{d.getDate()}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Times */}
      <section className="space-y-6">
        <div>
          <h3 className="font-headline font-semibold text-xs text-white/40 mb-3 uppercase tracking-wider">Turno Matutino (Antes de las 12 PM)</h3>
          <div className="grid grid-cols-3 gap-3">
            {!selectedDate ? <p className="text-white/30 text-xs col-span-3">Selecciona un día primero</p> : validMorningTimes.length === 0 ? <p className="text-white/30 text-xs col-span-3">Sin horarios en este turno</p> : validMorningTimes.map((time) => {
              const isPast = isTimePast(time);
              const isBooked = bookedTimes.includes(time);
              const isDisabled = isPast || isBooked;
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => setSelectedTime(time)}
                  className={`py-3 flex flex-col items-center justify-center gap-1 rounded-xl text-sm transition-all active:scale-95 ${
                    isDisabled
                      ? "opacity-40 cursor-not-allowed bg-red-900/10 border border-red-500/10 text-red-400"
                      : isSelected
                        ? "font-bold bg-[var(--color-primary-container)]/20 border border-[var(--color-primary-container)] text-[var(--color-primary-container)] shadow-[0_0_20px_rgba(0,163,173,0.6)]"
                        : "bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[inset_1px_1px_0_rgba(255,255,255,0.1)] font-medium text-white hover:bg-white/10"
                  }`}
                >
                  <span className={isBooked ? "line-through" : ""}>{time}</span>
                  {isBooked && <span className="text-[9px] uppercase tracking-wider font-bold">Ocupado</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="font-headline font-semibold text-xs text-white/40 mb-3 uppercase tracking-wider">Turno Vespertino (Después de las 12 PM)</h3>
          <div className="grid grid-cols-3 gap-3">
            {!selectedDate ? <p className="text-white/30 text-xs col-span-3">Selecciona un día primero</p> : validAfternoonTimes.length === 0 ? <p className="text-white/30 text-xs col-span-3">Sin horarios en este turno</p> : validAfternoonTimes.map((time) => {
              const isPast = isTimePast(time);
              const isBooked = bookedTimes.includes(time);
              const isDisabled = isPast || isBooked;
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => setSelectedTime(time)}
                  className={`py-3 flex flex-col items-center justify-center gap-1 rounded-xl text-sm transition-all active:scale-95 ${
                    isDisabled
                      ? "opacity-40 cursor-not-allowed bg-red-900/10 border border-red-500/10 text-red-400"
                      : isSelected
                        ? "font-bold bg-[var(--color-primary-container)]/20 border border-[var(--color-primary-container)] text-[var(--color-primary-container)] shadow-[0_0_20px_rgba(0,163,173,0.6)]"
                        : "bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[inset_1px_1px_0_rgba(255,255,255,0.1)] font-medium text-white hover:bg-white/10"
                  }`}
                >
                  <span className={isBooked ? "line-through" : ""}>{time}</span>
                  {isBooked && <span className="text-[9px] uppercase tracking-wider font-bold">Ocupado</span>}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="pt-4">
        <Link
          href="/dashboard/secretaria/agendar/confirmacion"
          className={`w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-container)] py-5 rounded-full font-headline font-extrabold text-lg text-white shadow-[0_10px_20px_-5px_rgba(0,163,173,0.4)] active:scale-[0.98] transition-all flex items-center justify-center ${!canContinue ? "opacity-40 pointer-events-none" : ""}`}
        >
          Confirmar y Agendar
          <span className="material-symbols-outlined ml-2">check_circle</span>
        </Link>
      </div>
    </main>
  );
}
