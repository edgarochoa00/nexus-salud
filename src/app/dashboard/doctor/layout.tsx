"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DoctorBottomNav } from "@/components/ui/DoctorBottomNav";
import { createClient } from "@/utils/supabase/client";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideHeader = pathname === "/dashboard/doctor/consultas" || pathname.includes("/expedientes/");
  
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
        .eq("doctor_id", user.id)
        .eq("leida", false)
        .order("fecha", { ascending: false })
        .limit(10);
      setNotificaciones(data || []);
    };
    fetchNotifs();
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
      className="min-h-screen relative overflow-x-hidden font-body text-white"
      style={{
        background: "radial-gradient(circle at top left, #021526 0%, #032d3d 100%)",
      }}
    >
      {/* Top Navigation Bar */}
      {!hideHeader && (
        <header className="safe-header fixed top-0 w-full z-50 bg-[#021526]/80 backdrop-blur-xl border-b border-white/10 shadow-lg px-6 flex justify-between items-center h-20">
          <div className="flex items-center">
            <span className="text-white font-headline font-bold text-lg tracking-tight italic">
              NexusSalud Doctor
            </span>
          </div>
          <div className="flex gap-4 relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)} 
              type="button" 
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#00a3ad] hover:bg-white/10 transition-all active:scale-95 duration-200 relative"
            >
              <span className="material-symbols-outlined">notifications</span>
              {notificaciones.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_5px_rgba(239,68,68,0.8)]"></span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute top-12 right-0 w-80 bg-[#021526]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold text-sm tracking-widest uppercase">Notificaciones</h3>
                  {notificaciones.length > 0 && (
                    <button onClick={marcarLeidas} className="text-xs text-[#00a3ad] hover:text-[#00a3ad]/80">
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
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#00a3ad] rounded-l-xl"></div>
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
      <DoctorBottomNav />
    </div>
  );
}
