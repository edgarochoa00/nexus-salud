"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function DoctorBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Inicio", href: "/dashboard/doctor", icon: "home" },
    { name: "Consultas", href: "/dashboard/doctor/consultas", icon: "medical_services" },
    { name: "Expedientes", href: "/dashboard/doctor/expedientes", icon: "folder_shared" },
    { name: "Agenda", href: "/dashboard/doctor/agenda", icon: "calendar_month" },
    { name: "Pagos", href: "/dashboard/doctor/pagos", icon: "payments" },
  ];

  return (
    <nav className="safe-bottom-nav fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-black/40 backdrop-blur-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.4)] rounded-t-[2.5rem] border-t border-white/10">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center transition-all duration-300 ${
              isActive
                ? "bg-[#00a3ad] text-white rounded-2xl px-5 py-2 shadow-lg shadow-[#00a3ad]/30 scale-105"
                : "text-white/40 px-4 py-2 hover:text-[#00a3ad] active:scale-90"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className="text-[11px] font-semibold font-headline uppercase tracking-wider mt-1">
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
