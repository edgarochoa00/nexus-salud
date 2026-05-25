"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function DoctorPagos() {
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchPagos = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("citas")
      .select(`
        id, fecha, hora, estado,
        paciente:pacientes!paciente_id(usuarios(nombre, apellidos)),
        pagos(monto_total, anticipo, estatus, created_at),
        cancelaciones(motivo)
      `)
      .eq("doctor_id", user.id)
      .in("estado", ["completada", "cancelada"])
      .order("fecha", { ascending: false });

    if (!error && data) {
      const pagosList = data
        .filter(c => c.pagos && c.pagos.length > 0)
        .map(c => {
          const pago = c.pagos[0];
          const isCancelada = c.estado === "cancelada";
          const cancelacion = c.cancelaciones?.[0];
          const tardia = cancelacion?.motivo?.includes("<24h");
          
          let montoRetenido = 0;
          let etiqueta = "";
          
          if (c.estado === "completada") {
            montoRetenido = pago.monto_total || pago.anticipo || 0;
            etiqueta = "Consulta Completada";
          } else if (isCancelada && tardia) {
            // El doctor solo retiene el anticipo, si pagaron el total se devuelve la diferencia
            montoRetenido = pago.anticipo || 0;
            etiqueta = "Cancelación Tardía (Retenido)";
          } else if (isCancelada && !tardia) {
            montoRetenido = 0;
            etiqueta = "Cancelación Anticipada (Reembolsado)";
          }

          return {
            id: c.id,
            fecha: c.fecha,
            hora: c.hora,
            paciente: (c.paciente as any)?.usuarios ? `${(c.paciente as any).usuarios.nombre} ${(c.paciente as any).usuarios.apellidos}` : "Paciente",
            monto: montoRetenido,
            etiqueta,
            estado: c.estado
          };
        });
        
      setPagos(pagosList);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPagos();
  }, [supabase]);

  const totalGenerado = pagos.reduce((acc, curr) => acc + curr.monto, 0);

  return (
    <>
      <header
        className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-6 pb-4 bg-[#021526]/80 backdrop-blur-xl border-b border-white/10 shadow-lg"
        style={{ paddingTop: "max(calc(env(safe-area-inset-top) + 1rem), 5rem)" }}
      >
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-[#00a3ad] font-headline">Mis Pagos</h1>
        </div>
        <button type="button" onClick={fetchPagos} className="text-[#00a3ad] p-2 rounded-full hover:bg-white/5 border border-white/5 active:scale-95 transition-all">
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </header>

      <main className="pb-32 px-6 max-w-4xl mx-auto" style={{ paddingTop: "calc(env(safe-area-inset-top) + 9rem)" }}>
        
        {/* Resumen Total */}
        <div className="bg-gradient-to-br from-[#00a3ad] to-emerald-600 rounded-[2rem] p-8 mb-8 shadow-[0_10px_40px_rgba(0,163,173,0.3)] text-white relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
          <p className="text-white/80 font-semibold tracking-widest uppercase text-xs mb-1">Ingresos Totales (Retenidos y Completados)</p>
          <h2 className="text-5xl font-extrabold font-headline">${totalGenerado.toFixed(2)} <span className="text-xl font-medium text-white/60">MXN</span></h2>
        </div>

        {/* Lista de Pagos */}
        <div className="space-y-4">
          <h3 className="font-headline font-bold text-xl mb-4">Historial de Transacciones</h3>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => <div key={n} className="h-24 bg-white/5 animate-pulse rounded-[1.5rem]" />)}
            </div>
          ) : pagos.length === 0 ? (
            <div className="text-center py-12 bg-white/5 border border-white/10 rounded-[1.5rem]">
              <span className="material-symbols-outlined text-4xl text-white/20">account_balance_wallet</span>
              <p className="text-white/40 text-sm mt-2">Aún no tienes pagos registrados.</p>
            </div>
          ) : (
            pagos.map((pago, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-[1.5rem] p-5 flex items-center justify-between hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                    pago.monto > 0 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-slate-500/10 border-slate-500/30 text-slate-400"
                  }`}>
                    <span className="material-symbols-outlined">
                      {pago.monto > 0 ? "attach_money" : "money_off"}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white font-headline text-lg">{pago.paciente}</h4>
                    <p className="text-xs text-white/50">{pago.fecha} a las {pago.hora?.slice(0,5)}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 inline-block ${
                      pago.estado === "completada" ? "text-cyan-400" : pago.monto > 0 ? "text-amber-400" : "text-slate-500"
                    }`}>
                      {pago.etiqueta}
                    </span>
                  </div>
                </div>
                <div className={`text-xl font-bold font-headline ${pago.monto > 0 ? "text-emerald-400" : "text-slate-500 line-through opacity-50"}`}>
                  ${pago.monto.toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
}
