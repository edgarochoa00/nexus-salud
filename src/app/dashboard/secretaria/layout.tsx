import React from "react";
import { SecretaryBottomNav } from "@/components/ui/SecretaryBottomNav";

export default function SecretariaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div 
      className="min-h-screen relative overflow-x-hidden font-body text-white"
      style={{
        background: "linear-gradient(135deg, #02161b 0%, #004d55 50%, #006970 100%)",
        backgroundAttachment: "fixed"
      }}
    >
      {/* Background styling applied above */}
      {children}
      
      {/* Persisting Bottom Navigation specific to Secretary */}
      <SecretaryBottomNav />
    </div>
  );
}
