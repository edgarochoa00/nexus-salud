"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Mock data updated to match the requested "Resumen de Consulta" design
const mockHistoryData = [
  {
    patientName: "Javier Pérez Gómez",
    patientInitials: "JP",
    patientId: "NS-2024-9982",
    age: "34 años",
    height: "1.78 m",
    reason: "Paciente refiere dolor abdominal agudo en el cuadrante inferior derecho, acompañado de náuseas leves y febrícula desde hace 12 horas.",
    diagnosis: "Apendicitis aguda en fase inicial. Se descarta cuadro viral por localización del dolor y signos de rebote positivos.",
    treatment: "Tomar Ciprofloxacino 500mg cada 12 horas por 7 días. Reposo absoluto y abundante hidratación. En caso de dolor persistente, tomar Paracetamol 1g cada 8 horas.",
  },
  {
    patientName: "María López García",
    patientInitials: "ML",
    patientId: "NS-2023-4412",
    age: "45 años",
    height: "1.65 m",
    reason: "Revisión de presión arterial de rutina. Paciente reporta mareos ocasionales por la mañana.",
    diagnosis: "Hipertensión arterial controlada. Episodios de hipotensión ortostática matutina.",
    treatment: "Ajustar dosis de Losartán a 50mg por la noche. Aumentar ingesta de líquidos al despertar. Monitoreo de presión por 14 días.",
  },
  {
    patientName: "Roberto Sánchez",
    patientInitials: "RS",
    patientId: "NS-2022-1093",
    age: "28 años",
    height: "1.82 m",
    reason: "Dolor articular en rodilla derecha tras actividad deportiva, sin inflamación evidente pero con limitación de movimiento.",
    diagnosis: "Esguince de ligamento colateral medial grado I. No hay signos de ruptura meniscal.",
    treatment: "Aplicar hielo local 20 min cada 4 horas. Uso de rodillera mecánica durante la deambulación. Ibuprofeno 400mg cada 8 horas por 5 días.",
  }
];

export default function ClientPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  const idNum = parseInt(params.id, 10);
  const data = mockHistoryData[idNum] || mockHistoryData[0];

  return (
    <main className="min-h-screen bg-[#041d24] relative pb-24 w-full flex flex-col font-body">
      {/* Header */}
      <header 
        className="w-full top-0 sticky z-50 flex justify-between items-center px-6 pb-4 bg-[#041d24]/90 backdrop-blur-xl border-b border-white/5"
        style={{ paddingTop: 'max(calc(env(safe-area-inset-top) + 1rem), 1.5rem)' }}
      >
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors text-[#00a3ad]">
          <span className="material-symbols-outlined font-bold">chevron_left</span>
        </button>
        <span className="text-lg font-bold text-white tracking-wide">Resumen de Consulta</span>
        <button
          type="button"
          onClick={() => window.alert("No hay notificaciones nuevas.")}
          className="p-2 rounded-full hover:bg-white/10 transition-colors text-[#00a3ad] relative"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#00a3ad] rounded-full border border-[#041d24]"></span>
        </button>
      </header>

      <div className="px-5 mt-6 space-y-6 max-w-lg mx-auto w-full">
        
        {/* Profile Card */}
        <div className="bg-[#0b2b31] border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
          <div className="w-24 h-24 rounded-full bg-[#00a3ad] flex items-center justify-center text-white text-3xl font-extrabold mb-5 shadow-[0_0_20px_rgba(0,163,173,0.4)] z-10">
            {data.patientInitials}
          </div>
          <h2 className="text-white text-2xl font-bold font-headline z-10 text-center">{data.patientName}</h2>
          <div className="flex items-center gap-2 mt-2 text-[#00a3ad] z-10">
            <span className="material-symbols-outlined text-sm">badge</span>
            <span className="text-xs font-semibold uppercase tracking-widest">ID: {data.patientId}</span>
          </div>
          {/* Subtle gradient background effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#00a3ad]/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* Vital Stats Card */}
        <div className="bg-[#0b2b31] border border-white/5 rounded-3xl p-6 shadow-lg">
          <div className="flex justify-between items-center pb-4 border-b border-white/5">
            <span className="text-[#00a3ad]/60 text-xs font-bold uppercase tracking-widest">Edad</span>
            <span className="text-white font-bold text-base">{data.age}</span>
          </div>
          <div className="flex justify-between items-center pt-4">
            <span className="text-[#00a3ad]/60 text-xs font-bold uppercase tracking-widest">Estatura</span>
            <span className="text-white font-bold text-base">{data.height}</span>
          </div>
        </div>

        {/* Evaluación Médica Section */}
        <div className="pt-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#00a3ad] rounded-full"></div>
            <h3 className="text-white font-bold text-lg">Evaluación Médica</h3>
          </div>

          <div className="bg-[#0b2b31] border-l-2 border-l-[#00a3ad]/50 border-y border-r border-white/5 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-3 text-[#00a3ad]">
              <span className="material-symbols-outlined text-lg">stethoscope</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Motivo de consulta</span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              {data.reason}
            </p>
          </div>

          <div className="bg-[#0b2b31] border-l-2 border-l-[#00a3ad] border-y border-r border-white/5 rounded-3xl p-6 shadow-lg relative overflow-hidden">
            {/* Subtle left glow */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-[#00a3ad]/10 blur-xl pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3 text-[#00a3ad]">
                <span className="material-symbols-outlined text-lg">fact_check</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Diagnóstico Final</span>
              </div>
              <p className="text-white font-medium text-sm leading-relaxed">
                {data.diagnosis}
              </p>
            </div>
          </div>
        </div>

        {/* Tratamiento y Receta Section */}
        <div className="pt-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#00a3ad] rounded-full"></div>
            <h3 className="text-white font-bold text-lg">Tratamiento y Receta</h3>
          </div>

          <div className="bg-[#0b2b31] border-l-2 border-l-[#00a3ad] border-y border-r border-white/5 rounded-3xl p-6 shadow-lg relative overflow-hidden">
             {/* Subtle left glow */}
             <div className="absolute left-0 top-0 bottom-0 w-8 bg-[#00a3ad]/10 blur-xl pointer-events-none"></div>
             <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3 text-[#00a3ad]">
                <span className="material-symbols-outlined text-lg">description</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Instrucciones de Tratamiento</span>
              </div>
              <p className="text-white/90 text-sm leading-relaxed">
                {data.treatment}
              </p>
            </div>
          </div>
        </div>
      </div>
      
    </main>
  );
}
