import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FinancialCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export const FinancialCard: React.FC<FinancialCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  className = '',
}) => {
  return (
    <div className={`card relative overflow-hidden group hover:border-primary/50 transition-all duration-300 ${className}`}>
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
        <Icon size={100} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-lighter flex items-center justify-center border border-primary/20">
            <Icon className="text-primary w-5 h-5" />
          </div>
          <span className="text-text-muted text-xs font-bold uppercase tracking-widest">{title}</span>
        </div>
        
        <div className="flex flex-col">
          <h3 className="text-3xl font-bold text-text-primary tracking-tight mb-1">{value}</h3>
          {subValue && <p className="text-xs text-text-muted font-medium">{subValue}</p>}
        </div>
        
        {trend && (
          <div className="mt-4 flex items-center gap-2">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
              trend.isPositive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
            }`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Growth</span>
          </div>
        )}
      </div>
    </div>
  );
};
