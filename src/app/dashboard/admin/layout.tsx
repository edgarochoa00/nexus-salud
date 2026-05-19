import React from "react";
import { AdminBottomNav } from "@/components/ui/AdminBottomNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen relative overflow-x-hidden font-body text-white"
      style={{ backgroundColor: "#002022" }}
    >
      {/* Gradient Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#006970]/20" style={{ filter: "blur(120px)" }}></div>
        <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#3a5f94]/10" style={{ filter: "blur(100px)" }}></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-[#00696b]/15" style={{ filter: "blur(80px)" }}></div>
      </div>
      {children}
      <AdminBottomNav />
    </div>
  );
}
