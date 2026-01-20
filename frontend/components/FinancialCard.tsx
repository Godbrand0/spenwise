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
    <div className={`glass p-6 rounded-2xl relative overflow-hidden group hover:bg-white/[0.08] transition-all duration-300 ${className}`}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon size={80} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Icon className="text-blue-500 w-5 h-5" />
          </div>
          <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</span>
        </div>
        
        <div className="flex flex-col">
          <h3 className="text-3xl font-bold text-white tracking-tight mb-1">{value}</h3>
          {subValue && <p className="text-xs text-slate-500 font-mono">{subValue}</p>}
        </div>
        
        {trend && (
          <div className="mt-4 flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              trend.isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
            }`}>
              {trend.isPositive ? '+' : ''}{trend.value}
            </span>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">vs last period</span>
          </div>
        )}
      </div>
      
      {/* HUD corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-500/30 rounded-tl-lg" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-500/30 rounded-br-lg" />
    </div>
  );
};
