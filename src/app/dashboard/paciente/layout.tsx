"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PatientBottomNav } from "@/components/ui/PatientBottomNav";
import { createClient } from "@/utils/supabase/client";

export default function PacienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideHeader = pathname.includes('/expediente/') && pathname !== '/dashboard/paciente/expediente';
  
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchNotifs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("notificaciones")
        .select("*")
        .eq("paciente_id", user.id)
        .eq("leida", false)
        .order("fecha", { ascending: false })
        .limit(10);
      setNotificaciones(data || []);
    };
    fetchNotifs();
    
    // Optional: set up realtime here if needed later
  }, [supabase]);

  const marcarLeidas = async () => {
    const ids = notificaciones.map((n: any) => n.id);
    if (ids.length === 0) return;
    await supabase.from("notificaciones").update({ leida: true }).in("id", ids);
    setNotificaciones([]);
    setShowNotifications(false);
  };

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
          <div className="flex gap-4 relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)} 
              type="button" 
              className="w-10 h-10 rounded-full flex items-center justify-center text-teal-400 hover:bg-white/20 transition-all active:scale-95 duration-200 relative"
            >
              <span className="material-symbols-outlined">notifications</span>
              {notificaciones.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_5px_rgba(239,68,68,0.8)]"></span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute top-12 right-0 w-80 bg-[#001b3c]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold text-sm tracking-widest uppercase">Notificaciones</h3>
                  {notificaciones.length > 0 && (
                    <button onClick={marcarLeidas} className="text-xs text-cyan-400 hover:text-cyan-300">
                      Marcar leídas
                    </button>
                  )}
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {notificaciones.length === 0 ? (
                    <p className="text-white/50 text-xs text-center py-4">No tienes notificaciones nuevas.</p>
                  ) : (
                    notificaciones.map(n => (
                      <div key={n.id} className="bg-white/5 rounded-xl p-3 border border-white/5 relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400 rounded-l-xl"></div>
                        <p className="text-xs text-white/80 ml-2">{n.mensaje}</p>
                        <span className="text-[10px] text-white/40 ml-2 mt-1 block">
                          {new Date(n.fecha).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>
      )}

      {children}

      <PatientBottomNav />
    </div>
  );
}
