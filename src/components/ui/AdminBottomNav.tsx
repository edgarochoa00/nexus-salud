"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Inicio", href: "/dashboard/admin", icon: "dashboard" },
    { name: "Doctores", href: "/dashboard/admin/doctores", icon: "medical_services" },
    { name: "Asistentes", href: "/dashboard/admin/asistentes", icon: "support_agent" },
    { name: "Acerca de", href: "/dashboard/admin/acerca", icon: "info" },
  ];

  return (
    <nav className="safe-bottom-nav fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-cyan-950/60 backdrop-blur-2xl text-cyan-400 z-50 rounded-t-[2rem] border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center transition-all duration-150 active:scale-90 px-5 py-2 ${
              isActive
                ? "bg-cyan-500/20 text-cyan-300 rounded-2xl"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider mt-1">
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
