'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  ArrowRight,
  Lock,
  FileText,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { FinancialCard } from '@/components/FinancialCard';

export default function TaxPage() {
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (!isMounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070a]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 font-mono text-xs uppercase tracking-[0.3em]">Accessing Tax Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="text-emerald-500 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Tax Center</h1>
            <p className="text-slate-400 text-sm">Compliance tracking & automated tax estimations.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Compliant</span>
          </div>
        </div>
      </div>

      {/* Tax Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinancialCard 
          title="Estimated Tax" 
          value="₦430,000.00" 
          subValue="Projected for 2026 Tax Year"
          icon={DollarSign}
        />
        <FinancialCard 
          title="Taxable Income" 
          value="₦4,000,000.00" 
          subValue="After all deductions & reliefs"
          icon={FileText}
        />
        <FinancialCard 
          title="Next Deadline" 
          value="Jan 31, 2027" 
          subValue="377 days remaining"
          icon={Calendar}
          className="border-amber-500/20"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-8 rounded-3xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Lock size={120} />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Clock className="text-blue-500" size={24} />
              Upcoming Obligations
            </h3>

            <div className="space-y-4">
              {[
                { title: 'Annual Income Tax (PAYE)', period: 'Jan - Dec 2026', amount: '₦430,000.00', status: 'Pending', due: 'Jan 31, 2027' },
                { title: 'Value Added Tax (VAT)', period: 'Q2 2026', amount: '₦12,500.00', status: 'Pending', due: 'Jul 21, 2026' },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                      <FileText className="text-blue-500 w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{item.period}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{item.amount}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Due {item.due}</p>
                    </div>
                    <button className="p-2 rounded-lg bg-blue-600/10 text-blue-500 opacity-0 group-hover:opacity-100 transition-all">
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/5">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <CheckCircle2 className="text-emerald-500" size={24} />
              Payment History
            </h3>
            <div className="space-y-4">
              {[
                { title: 'Annual Income Tax', period: '2025', amount: '₦352,000.00', date: 'Jan 25, 2026' },
                { title: 'VAT Settlement', period: 'Q1 2026', amount: '₦8,400.00', date: 'Apr 15, 2026' },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/[0.02] border border-emerald-500/5">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="text-emerald-500 w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">{item.period}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-500">{item.amount}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Paid {item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-blue-600/10 to-transparent">
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="text-blue-500" size={16} />
              Tax Optimization
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Based on your transaction history, you may be eligible for additional consolidated relief allowances.
            </p>
            <button className="w-full py-3 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
              Recalculate Reliefs
            </button>
          </div>

          <div className="glass p-6 rounded-3xl border border-white/5">
            <h4 className="text-sm font-bold text-white mb-4">Compliance Checklist</h4>
            <div className="space-y-4">
              {[
                { label: 'TIN Verification', status: true },
                { label: 'Income Classification', status: true },
                { label: 'Deduction Validation', status: false },
                { label: 'Filing Readiness', status: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{item.label}</span>
                  {item.status ? (
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-amber-500/10 bg-amber-500/5">
            <p className="text-[10px] text-amber-500/80 leading-relaxed italic">
              Disclaimer: These estimates are for informational purposes. Consult a certified tax professional for official filings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
