"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ClientPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  return (
    <main className="pt-safe-24 pb-32 px-6 max-w-4xl mx-auto space-y-8 relative z-10 w-full">
      
      {/* Title & Back handled by Layout/Navigation usually, but adding a specific one here */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="material-symbols-outlined text-teal-500 hover:bg-white/5 transition-colors active:scale-95 duration-200 p-2 rounded-full flex items-center justify-center">
          arrow_back
        </button>
        <h1 className="font-headline font-bold text-lg tracking-tight text-white">
          Detalle de Cita
        </h1>
      </div>

      <section className="space-y-2">
        <h2 className="font-headline text-3xl font-extrabold text-white tracking-tight">Gestión de Cita</h2>
        <p className="text-white/70 text-sm">Revisa los detalles de tu consulta médica o solicita una cancelación.</p>
      </section>

      {/* Main Appointment Card (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Info Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Core Appointment Details */}
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] p-8 rounded-[2rem] relative overflow-hidden">
            <div className="flex flex-col gap-6 relative z-10">
              <div className="flex justify-between items-start">
                <div className="bg-[var(--color-primary-container)]/20 text-white px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase border border-white/10">
                  Próxima Cita
                </div>
                <div className="flex items-center gap-2 text-[var(--color-primary-container)]">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>pulse_alert</span>
                  <span className="text-xs font-bold uppercase tracking-tighter">Confirmada</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">Especialidad</p>
                  <h3 className="text-white font-headline text-3xl font-bold">Cardiología</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <div>
                      <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest">Doctor</p>
                      <p className="text-white font-semibold text-sm">Dr. Adrián Benítez</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                      <span className="material-symbols-outlined">location_on</span>
                    </div>
                    <div>
                      <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest">Sucursal</p>
                      <p className="text-white font-semibold text-sm">Clínica San Rafael</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status Card */}
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] p-6 rounded-[2rem] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--color-primary-container)] text-white flex items-center justify-center shadow-lg shadow-[var(--color-primary-container)]/20">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-tight">$600.00 MXN</p>
                <p className="text-white/60 text-xs">Depósito pagado (50%)</p>
              </div>
            </div>
            <div className="h-10 w-[1px] bg-white/10"></div>
            <div className="text-right">
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Saldo Pendiente</p>
              <p className="text-white/90 font-medium">$600.00</p>
            </div>
          </div>
        </div>

        {/* Right Date/Time Column */}
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] p-8 rounded-[2rem] flex flex-col items-center justify-center text-center h-full">
            <span className="material-symbols-outlined text-white/40 text-4xl mb-4">calendar_today</span>
            <p className="text-white font-headline text-2xl font-bold leading-tight">Jueves 19<br/>Octubre</p>
            <div className="mt-4 px-6 py-2 bg-[var(--color-primary-container)]/10 border border-[var(--color-primary-container)]/30 rounded-full text-[var(--color-primary-container)] font-bold text-lg shadow-[0_0_15px_rgba(0,163,173,0.4)]">
              10:00 AM
            </div>
          </div>
        </div>
      </div>

      {/* Policy Section */}
      <section className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] p-6 rounded-[2rem] border-l-4 border-l-[var(--color-primary-container)]/50">
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-[var(--color-primary-container)]">info</span>
          <div className="space-y-1">
            <h4 className="text-white font-bold text-sm">Política de Reembolso</h4>
            <p className="text-white/70 text-sm leading-relaxed">
              Importante: Las cancelaciones deben realizarse con al menos <span className="text-[var(--color-primary-container)] font-semibold underline decoration-[var(--color-primary-container)]/30 underline-offset-4">24 horas de antelación</span> para ser elegibles para el reembolso total del depósito.
            </p>
          </div>
        </div>
      </section>

      {/* Cancellation Actions */}
      <div className="flex flex-col items-center gap-6">
        <button 
          onClick={() => setShowCancelDialog(true)}
          className="w-full md:w-auto px-12 py-4 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/50 text-red-100 font-headline font-bold text-lg hover:bg-red-500/30 transition-all active:scale-95 shadow-xl shadow-red-900/20"
        >
          Cancelar Cita
        </button>
        <p className="text-white/40 text-xs italic">Al cancelar, recibirás una notificacion con el folio de cancelación.</p>
      </div>

      {/* Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowCancelDialog(false)}></div>
          <div className="bg-white/10 border border-white/20 backdrop-blur-3xl max-w-sm w-full p-8 rounded-[2.5rem] relative z-10 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-[#ba1a1a]/20 rounded-full flex items-center justify-center text-[#ba1a1a] mx-auto mb-2">
              <span className="material-symbols-outlined text-3xl">report</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-headline text-xl font-bold">¿Deseas cancelar esta cita?</h3>
              <p className="text-white/60 text-sm">Esta acción es irreversible y podría generar cargos según las políticas.</p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => router.push("/dashboard/paciente/citas")}
                className="w-full py-3 bg-[#ba1a1a] text-white rounded-full font-bold hover:opacity-90 transition-opacity"
              >
                Confirmar Cancelación
              </button>
              <button 
                onClick={() => setShowCancelDialog(false)}
                className="w-full py-3 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-colors"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
