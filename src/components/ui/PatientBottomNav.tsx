"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PatientBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Inicio", path: "/dashboard/paciente", icon: "home" },
    { name: "Citas", path: "/dashboard/paciente/citas", icon: "calendar_today" },
    { name: "Expediente", path: "/dashboard/paciente/expediente", icon: "folder_shared" },
    { name: "Perfil", path: "/dashboard/paciente/perfil", icon: "person" },
  ];

  return (
    <nav className="safe-bottom-nav fixed bottom-0 w-full rounded-t-[2.5rem] z-50 bg-white/5 backdrop-blur-2xl border-t border-white/10 shadow-[0_-8px_32px_0_rgba(0,0,0,0.2)]">
      <div className="flex justify-around items-center w-full px-4 pb-8 pt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== "/dashboard/paciente" && pathname.startsWith(item.path));
          
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex flex-col items-center justify-center px-4 py-2 transition-colors ${
                isActive 
                  ? "text-teal-400 bg-teal-900/30 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" 
                  : "text-slate-400 hover:text-teal-400"
              }`}
            >
              <span 
                className="material-symbols-outlined text-2xl mb-1" 
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="font-inter text-[10px] font-semibold tracking-wide uppercase">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
