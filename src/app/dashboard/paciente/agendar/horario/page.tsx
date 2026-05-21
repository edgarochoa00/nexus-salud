"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { obtenerCitaEnProceso, guardarCitaEnProceso } from "@/utils/citaStore";

export default function HorarioSelection() {
  // Use today as the start date
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Build calendar for the current month view
  const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const adjustedFirstDay = (firstDay + 6) % 7; // Make Monday=0

  const calendarDays: Array<{ date: Date | null }> = [];
  for (let i = 0; i < adjustedFirstDay; i++) calendarDays.push({ date: null });
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({ date: new Date(currentYear, currentMonth, d) });
  }

  const morningTimes = ["08:00", "09:00", "09:30", "10:00", "11:00", "11:30"];
  const afternoonTimes = ["14:00", "15:00", "15:30", "16:00", "17:00", "18:00"];

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

  const handleDaySelect = (date: Date) => {
    if (date < today && date.toDateString() !== today.toDateString()) return;
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  // Save to store on change
  useEffect(() => {
    if (selectedDate && selectedTime) {
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const dd = String(selectedDate.getDate()).padStart(2, "0");
      guardarCitaEnProceso({
        fecha: `${yyyy}-${mm}-${dd}`,
        hora: selectedTime,
      });
    }
  }, [selectedDate, selectedTime]);

  const cita = obtenerCitaEnProceso();

  const canContinue = !!selectedDate && !!selectedTime;

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
          <div className="mt-1 flex items-center text-[var(--color-primary-container)] font-bold text-sm">
            <span>${cita.precio ?? 0}.00</span>
            <span className="text-xs font-normal text-white/40 ml-1">/ consulta</span>
          </div>
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
              <button type="button" onClick={goPrevMonth} className="material-symbols-outlined text-white/30 hover:text-cyan-400 cursor-pointer transition-colors">
                chevron_left
              </button>
              <button type="button" onClick={goNextMonth} className="material-symbols-outlined text-white/30 hover:text-cyan-400 cursor-pointer transition-colors">
                chevron_right
              </button>
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
              const isSelected = selectedDate?.toDateString() === d.toDateString();
              const isToday = d.toDateString() === today.toDateString();

              return (
                <div
                  key={i}
                  onClick={() => !isPast && handleDaySelect(d)}
                  className={`text-sm py-2 cursor-pointer transition-colors relative flex items-center justify-center ${
                    isPast
                      ? "text-white/15 cursor-not-allowed"
                      : isSelected
                        ? "text-white font-bold"
                        : isToday
                          ? "text-[var(--color-primary-container)] font-semibold"
                          : "text-white hover:text-cyan-400"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute w-10 h-10 bg-[var(--color-primary-container)] rounded-xl shadow-[0_0_20px_rgba(0,163,173,0.6)] z-0"></div>
                  )}
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
          <h3 className="font-headline font-semibold text-xs text-white/40 mb-3 uppercase tracking-wider">Mañana</h3>
          <div className="grid grid-cols-3 gap-3">
            {morningTimes.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleTimeSelect(time)}
                  className={`py-3 rounded-xl text-sm transition-all active:scale-95 ${
                    isSelected
                      ? "font-bold bg-[var(--color-primary-container)]/20 border border-[var(--color-primary-container)] text-[var(--color-primary-container)] shadow-[0_0_20px_rgba(0,163,173,0.6)]"
                      : "bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[inset_1px_1px_0_rgba(255,255,255,0.1)] font-medium text-white hover:bg-white/10"
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <h3 className="font-headline font-semibold text-xs text-white/40 mb-3 uppercase tracking-wider">Tarde</h3>
          <div className="grid grid-cols-3 gap-3">
            {afternoonTimes.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleTimeSelect(time)}
                  className={`py-3 rounded-xl text-sm transition-all active:scale-95 ${
                    isSelected
                      ? "font-bold bg-[var(--color-primary-container)]/20 border border-[var(--color-primary-container)] text-[var(--color-primary-container)] shadow-[0_0_20px_rgba(0,163,173,0.6)]"
                      : "bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[inset_1px_1px_0_rgba(255,255,255,0.1)] font-medium text-white hover:bg-white/10"
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="pt-4">
        <Link
          href="/dashboard/paciente/agendar/confirmacion"
          className={`w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-container)] py-5 rounded-full font-headline font-extrabold text-lg text-white shadow-[0_10px_20px_-5px_rgba(0,163,173,0.4)] active:scale-[0.98] transition-all flex items-center justify-center ${
            !canContinue ? "opacity-40 pointer-events-none" : ""
          }`}
        >
          Confirmar Horario
          <span className="material-symbols-outlined ml-2">check_circle</span>
        </Link>
      </div>
    </main>
  );
}
