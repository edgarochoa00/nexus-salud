"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PatientBottomNav } from "@/components/ui/PatientBottomNav";

export default function PacienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideHeader = pathname.includes('/expediente/') && pathname !== '/dashboard/paciente/expediente';

  return (
    <div 
      className="min-h-screen w-full relative overflow-x-hidden"
      style={{
        background: `radial-gradient(circle at 0% 0%, #001b3c 0%, transparent 50%),
                     radial-gradient(circle at 100% 100%, #004f54 0%, transparent 50%),
                     linear-gradient(135deg, #001b3c 0%, #161d1e 100%)`
      }}
    >
      {/* Top Navigation Bar */}
      {!hideHeader && (
        <header className="safe-header fixed top-0 w-full z-50 bg-white/10 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_0_rgba(0,163,173,0.06)] px-6 flex justify-between items-center h-20">
          <div className="flex items-center">
            <div className="flex flex-col">
              <span className="text-white font-headline font-bold text-lg tracking-tight italic">
                NexusSalud
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => window.alert('No hay notificaciones nuevas.')} type="button" className="w-10 h-10 rounded-full flex items-center justify-center text-teal-400 hover:bg-white/20 transition-all active:scale-95 duration-200">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>
      )}

      {children}

      <PatientBottomNav />
    </div>
  );
}
