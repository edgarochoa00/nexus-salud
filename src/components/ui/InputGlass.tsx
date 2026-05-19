import React from "react";

interface InputGlassProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
  label?: string;
}

export function InputGlass({ icon, label, id, className = "", ...props }: InputGlassProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-white/80 text-xs font-bold uppercase tracking-widest ml-1 font-label">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-[var(--color-primary)] transition-colors">
            {icon}
          </span>
        )}
        <input 
          id={id}
          className={`input-glass w-full py-4 ${icon ? 'pl-12' : 'px-4'} pr-4 rounded-xl text-white placeholder:text-white/30 font-medium ${className}`} 
          {...props}
        />
      </div>
    </div>
  );
}
