import React, { InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", containerClassName = "", label, icon, error, ...props }, ref) => {
    return (
      <div className={containerClassName}>
        {label && (
          <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 ml-1">
            {label}
          </label>
        )}
        <div
          className={`relative flex items-center w-full bg-secondary-medium/50 border px-8  rounded-xl transition-all focus-within:border-primary ${
            error ? "border-error/50" : "border-border"
          }`}
        >
          {icon && (
            <div className="absolute left-4 text-primary pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-transparent py-3 pr-3 text-sm !border-none !outline-none !ring-0 !shadow-none text-text-primary ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 ml-1 text-[10px] font-bold text-error uppercase tracking-wider">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
