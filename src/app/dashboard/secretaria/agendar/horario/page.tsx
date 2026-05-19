"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function HorarioSelection() {
  const [selectedDay, setSelectedDay] = useState(12);
  const [selectedTime, setSelectedTime] = useState("09:30 AM");
  const [monthOffset, setMonthOffset] = useState(0);

  const days = [
    { date: 26, currentMonth: false }, { date: 27, currentMonth: false }, { date: 28, currentMonth: false }, { date: 29, currentMonth: false }, { date: 30, currentMonth: false },
    { date: 1, currentMonth: true }, { date: 2, currentMonth: true }, { date: 3, currentMonth: true }, { date: 4, currentMonth: true }, { date: 5, currentMonth: true },
    { date: 6, currentMonth: true }, { date: 7, currentMonth: true }, { date: 8, currentMonth: true }, { date: 9, currentMonth: true }, { date: 10, currentMonth: true },
    { date: 11, currentMonth: true }, { date: 12, currentMonth: true }, { date: 13, currentMonth: true }, { date: 14, currentMonth: true }, { date: 15, currentMonth: true },
    { date: 16, currentMonth: true }
  ];

  const morningTimes = ["08:00 AM", "09:30 AM", "11:00 AM"];
  const afternoonTimes = ["02:00 PM", "03:30 PM", "05:00 PM"];

  return (
    <main className="relative z-10 px-6 pt-safe-24 pb-32 space-y-6 max-w-lg mx-auto w-full">
      {/* Top Navigation Bar overrides - Title only since layout handles actual header */}
      <div className="mb-2">
        <h1 className="font-headline font-bold text-2xl tracking-tight text-white">Agendar Cita</h1>
      </div>

      {/* Tarjeta de Resumen */}
      <section className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[inset_1px_1px_0_rgba(255,255,255,0.1)] rounded-[1.5rem] p-4 flex items-center space-x-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary-container)]/40 to-[var(--color-primary-container)]/10 border border-white/10 flex items-center justify-center text-[var(--color-primary-container)]">
          <span className="material-symbols-outlined text-3xl">medical_services</span>
        </div>
        <div className="flex-1">
          <h3 className="font-headline font-bold text-white text-base">Dra. Elena Gomez</h3>
          <p className="text-white/50 text-xs">Cardióloga • Sucursal Sur</p>
          <div className="mt-1 flex items-center text-[var(--color-primary-container)] font-bold text-sm">
            <span>$650.00</span>
            <span className="text-xs font-normal text-white/40 ml-1">/ consulta</span>
          </div>
        </div>
      </section>

      {/* Calendario Glassmorphism */}
      <section className="space-y-4">
        <h2 className="font-headline font-semibold text-lg flex items-center text-white">
          <span className="material-symbols-outlined mr-2 text-[var(--color-primary-container)]">calendar_today</span>
          Seleccionar Fecha
        </h2>
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[inset_1px_1px_0_rgba(255,255,255,0.1)] rounded-3xl p-6">
          <div className="flex justify-between items-center mb-6">
            <span className="font-headline font-bold text-white">Octubre 2024 {monthOffset !== 0 ? `(${monthOffset > 0 ? `+${monthOffset}` : monthOffset})` : ""}</span>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setMonthOffset((prev) => prev - 1)}
                className="material-symbols-outlined text-white/30 hover:text-cyan-400 cursor-pointer transition-colors"
              >
                chevron_left
              </button>
              <button
                type="button"
                onClick={() => setMonthOffset((prev) => prev + 1)}
                className="material-symbols-outlined text-white/30 hover:text-cyan-400 cursor-pointer transition-colors"
              >
                chevron_right
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-y-4 text-center">
            {/* Days of Week */}
            {["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map((day) => (
              <div key={day} className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{day}</div>
            ))}
            
            {/* Calendar Grid */}
            {days.map((dayObj, i) => {
              const isSelected = selectedDay === dayObj.date && dayObj.currentMonth;
              return (
                <div 
                  key={i} 
                  onClick={() => dayObj.currentMonth && setSelectedDay(dayObj.date)}
                  className={`text-sm py-2 cursor-pointer transition-colors ${
                    !dayObj.currentMonth 
                      ? "text-white/20" 
                      : isSelected 
                        ? "text-white font-bold relative flex items-center justify-center" 
                        : "text-white hover:text-cyan-400"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute w-10 h-10 bg-[var(--color-primary-container)] rounded-xl shadow-[0_0_20px_rgba(0,163,173,0.6)] z-0"></div>
                  )}
                  <span className="relative z-10">{dayObj.date}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Selector de Horarios */}
      <section className="space-y-6">
        <div>
          <h3 className="font-headline font-semibold text-xs text-white/40 mb-3 uppercase tracking-wider">Mañana</h3>
          <div className="grid grid-cols-3 gap-3">
            {morningTimes.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <button 
                  key={time}
                  onClick={() => setSelectedTime(time)}
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
                  onClick={() => setSelectedTime(time)}
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

      {/* Botón de Acción */}
      <div className="pt-4">
        <Link href="/dashboard/secretaria/agendar/confirmacion" className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-container)] py-5 rounded-full font-headline font-extrabold text-lg text-white shadow-[0_10px_20px_-5px_rgba(0,163,173,0.4)] active:scale-[0.98] transition-all flex items-center justify-center">
          Confirmar y Agendar
          <span className="material-symbols-outlined ml-2">check_circle</span>
        </Link>
      </div>
    </main>
  );
}
