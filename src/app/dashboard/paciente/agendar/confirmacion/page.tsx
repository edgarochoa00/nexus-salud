"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { obtenerCitaEnProceso, limpiarCitaEnProceso } from "@/utils/citaStore";

export default function ConfirmacionPaciente() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cita, setCita] = useState<any>(null);

  const loadCita = useCallback(() => {
    const datos = obtenerCitaEnProceso();
    setCita(datos);
  }, []);

  useEffect(() => {
    loadCita();
  }, [loadCita]);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Sesión expirada. Por favor inicia sesión de nuevo.");
      setLoading(false);
      return;
    }

    const datos = obtenerCitaEnProceso();

    if (!datos.doctor_id) {
      setError("No se encontró el doctor seleccionado. Por favor reinicia el proceso.");
      setLoading(false);
      return;
    }

    if (!datos.fecha || !datos.hora) {
      setError("Por favor selecciona fecha y hora antes de confirmar.");
      setLoading(false);
      return;
    }

    // 1. Insert the cita
    const { data: citaData, error: insertError } = await supabase
      .from("citas")
      .insert({
        paciente_id: user.id,
        doctor_id: datos.doctor_id,
        fecha: datos.fecha,
        hora: datos.hora,
        estado: "confirmada",
        creada_por: user.id,
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505' || insertError.message.includes('unique constraint')) {
        setError("Lo sentimos, ese horario acaba de ser reservado por otro paciente. Por favor selecciona otro.");
      } else {
        setError("Error al guardar la cita: " + insertError.message);
      }
      setLoading(false);
      return;
    }

    // 2. Insert the payment record (50% anticipo)
    const precio = datos.precio ?? 0;
    const anticipo = parseFloat((precio / 2).toFixed(2));

    const { error: pagoError } = await supabase.from("pagos").insert({
      cita_id: citaData.id,
      monto_total: precio,
      anticipo: anticipo,
      metodo_pago: "tarjeta",
      estatus: anticipo > 0 ? "parcial" : "pendiente",
    });

    if (pagoError) {
      console.warn("Cita creada, pero hubo un problema registrando el pago:", pagoError.message);
    }

    limpiarCitaEnProceso();
    router.push("/dashboard/paciente/citas");
  };

  if (!cita) {
    return (
      <main className="relative z-10 pt-safe-24 pb-32 px-6 max-w-2xl mx-auto w-full flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin material-symbols-outlined text-[var(--color-primary-container)] text-5xl">progress_activity</div>
      </main>
    );
  }

  const precio50 = ((cita.precio ?? 0) / 2).toFixed(2);
  const fechaDisplay = cita.fecha
    ? new Date(cita.fecha + "T00:00:00").toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "long" })
    : "—";

  return (
    <main className="relative z-10 pt-safe-24 pb-32 px-6 max-w-2xl mx-auto space-y-8 w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-headline font-bold text-2xl tracking-tight text-white">Confirmar Pago</h1>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-teal-400 text-sm">lock</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400/60">Pago Seguro SSL</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-sm p-4 rounded-2xl">
          {error}
        </div>
      )}

      {/* Summary */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 col-span-1 md:col-span-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--color-primary)]/20 rounded-xl flex items-center justify-center border border-[var(--color-primary)]/30">
              <span className="material-symbols-outlined text-[var(--color-primary-fixed-dim)]" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Especialidad</p>
              <h3 className="text-lg font-headline font-bold text-white">{cita.especialidad ?? "—"}</h3>
            </div>
          </div>
          <div className="hidden md:block h-10 w-[1px] bg-white/10"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
              <span className="material-symbols-outlined text-teal-400">person</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Especialista</p>
              <h3 className="text-lg font-headline font-bold text-white">{cita.doctor_nombre ?? "—"}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 flex flex-col gap-2">
          <span className="material-symbols-outlined text-teal-400 text-3xl">location_on</span>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sucursal</p>
          <p className="font-headline font-bold text-white">{cita.sucursal ?? "—"}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 flex flex-col gap-2 border-l-4 border-l-[var(--color-primary-container)]/50">
          <span className="material-symbols-outlined text-teal-400 text-3xl">calendar_today</span>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Fecha y Hora</p>
          <p className="font-headline font-bold text-white">{fechaDisplay} • {cita.hora ?? "—"}</p>
        </div>
      </section>

      {/* Payment breakdown */}
      <section className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-8">
        <h2 className="font-headline font-bold text-xl text-white mb-6">Resumen del Pago</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-sm">Consulta de Especialidad</span>
            <span className="font-medium text-white">${cita.precio ?? 0}.00 MXN</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-sm">IVA (16%)</span>
            <span className="font-medium text-white">Incluido</span>
          </div>
          <div className="pt-4 border-t border-dashed border-white/10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-bold text-slate-400">Total del Servicio</span>
              <span className="text-lg font-extrabold text-white">${cita.precio ?? 0}.00 MXN</span>
            </div>
            <div className="bg-[var(--color-primary-container)]/10 rounded-2xl p-4 mt-4 flex items-center justify-between border border-[var(--color-primary-container)]/20">
              <div>
                <span className="text-[10px] font-bold uppercase text-teal-400 tracking-wider">Pago Obligatorio (50%)</span>
                <p className="text-2xl font-headline font-black text-white">${precio50} MXN</p>
              </div>
              <div className="w-10 h-10 bg-[var(--color-primary-container)] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,163,173,0.4)]">
                <span className="material-symbols-outlined text-white">receipt_long</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">info</span>
              El 50% restante se liquida directamente en sucursal el día de su cita.
            </p>
          </div>
        </div>
      </section>

      {/* Payment form */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-headline font-bold text-xl text-white">Método de Pago</h2>
          <div className="flex gap-2">
            <div className="w-10 h-6 bg-white/5 rounded border border-white/10 flex items-center justify-center">
              <span className="text-[10px] text-white/50">VISA</span>
            </div>
            <div className="w-10 h-6 bg-white/5 rounded border border-white/10 flex items-center justify-center">
              <span className="text-[10px] text-white/50">MC</span>
            </div>
          </div>
        </div>
        <form className="space-y-4" onSubmit={handleConfirm}>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Número de tarjeta</label>
            <div className="relative">
              <input className="w-full bg-white/5 border border-white/10 rounded-xl h-14 px-5 focus:ring-2 focus:ring-[var(--color-primary-container)] text-white placeholder:text-white/20 font-medium"
                placeholder="0000 0000 0000 0000" type="text" required maxLength={19} />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/20">credit_card</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nombre del titular</label>
            <input className="w-full bg-white/5 border border-white/10 rounded-xl h-14 px-5 focus:ring-2 focus:ring-[var(--color-primary-container)] text-white placeholder:text-white/20 font-medium"
              placeholder="Como aparece en la tarjeta" type="text" required maxLength={50} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Vencimiento</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-xl h-14 px-5 focus:ring-2 focus:ring-[var(--color-primary-container)] text-white placeholder:text-white/20 font-medium"
                placeholder="MM / AA" type="text" required maxLength={7} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">CVV</label>
              <div className="relative">
                <input className="w-full bg-white/5 border border-white/10 rounded-xl h-14 px-5 focus:ring-2 focus:ring-[var(--color-primary-container)] text-white placeholder:text-white/20 font-medium"
                  placeholder="123" type="password" required maxLength={4} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/20">lock</span>
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full h-16 mt-8 rounded-full bg-[var(--color-primary-container)] text-white font-headline font-bold text-lg shadow-[0_0_15px_rgba(0,163,173,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60">
            <span>{loading ? "Guardando cita..." : "Confirmar y Agendar"}</span>
            <span className="material-symbols-outlined">{loading ? "hourglass_empty" : "chevron_right"}</span>
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-500 px-6 uppercase tracking-wider">
          Al confirmar, autorizas el cargo de ${precio50} MXN a tu tarjeta. Tu información está protegida bajo estándares internacionales de seguridad.
        </p>
      </section>
    </main>
  );
}
