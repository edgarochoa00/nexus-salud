import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div className={`glass-panel p-8 md:p-12 rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] ${className}`}>
      {children}
    </div>
  );
}
