import React from "react";
import { DoctorBottomNav } from "@/components/ui/DoctorBottomNav";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen relative overflow-x-hidden font-body text-white"
      style={{
        background: "radial-gradient(circle at top left, #021526 0%, #032d3d 100%)",
      }}
    >
      {children}
      <DoctorBottomNav />
    </div>
  );
}
