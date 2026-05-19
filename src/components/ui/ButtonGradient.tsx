import React from "react";

interface ButtonGradientProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: string;
}

export function ButtonGradient({ children, icon, className = "", ...props }: ButtonGradientProps) {
  return (
    <button 
      className={`btn-gradient w-full py-4 rounded-full text-white font-bold text-sm tracking-[0.1em] transition-all active:scale-[0.98] flex items-center justify-center gap-2 group ${className}`}
      {...props}
    >
      {children}
      {icon && (
        <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
          {icon}
        </span>
      )}
    </button>
  );
}
