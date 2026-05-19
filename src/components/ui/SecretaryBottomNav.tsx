"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SecretaryBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Inicio",
      href: "/dashboard/secretaria",
      icon: "home",
    },
    {
      name: "Agendar",
      href: "/dashboard/secretaria/agendar",
      icon: "calendar_add_on",
    },
    {
      name: "Citas",
      href: "/dashboard/secretaria/citas",
      icon: "event_note",
    },
  ];

  return (
    <nav className="safe-bottom-nav fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-cyan-950/60 backdrop-blur-2xl border-t border-white/15 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] rounded-t-[2rem]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center transition-all ${
              isActive
                ? "bg-cyan-500/20 text-cyan-300 rounded-2xl px-4 py-1.5 ring-1 ring-cyan-400/30"
                : "text-white/50 px-4 py-1.5 hover:text-cyan-200 active:scale-90"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className="font-inter text-[10px] font-semibold tracking-wide uppercase mt-1">
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
