"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  AlertCircle,
  Calendar,
  DollarSign,
  ArrowRight,
  Lock,
  FileText,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { FinancialCard } from "@/components/FinancialCard";
import { createBrowserClient } from "@/lib/database/client";

export default function TaxPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const supabase = createBrowserClient();

  useEffect(() => {
    setIsMounted(true);
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setTimeout(() => setLoading(false), 800);
    };
    getUser();
  }, []);

  if (!isMounted) return null;
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-success/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-success/20">
            <Lock className="text-success w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-text-primary mb-4 tracking-tight">
            Secure Vault
          </h1>
          <p className="text-lg text-text-secondary mb-10 leading-relaxed font-medium">
            Access secure tax estimation and automated compliance tracking.
          </p>
          <Link
            href="/auth"
            className="btn-primary w-full py-4 text-center text-sm tracking-[0.2em]"
          >
            AUTHENTICATE ACCESS
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 animate-fade-in">
        <div className="text-center space-y-8">
          <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin mx-auto shadow-2xl shadow-primary/20" />
          <p className="text-text-muted font-black text-xs uppercase tracking-[0.4em] animate-pulse">
            Accessing Secure Tax Vault...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-success/10 rounded-2xl flex items-center justify-center border border-success/20 shadow-lg shadow-success/10">
            <ShieldCheck className="text-success w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">
              Tax Center
            </h1>
            <p className="text-text-secondary text-sm">
              Automated compliance and estimation intelligence
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="badge badge-success px-4 py-2 border border-success/20">
            <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse mr-2" />
            <span>Fully Compliant</span>
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
        <div className="lg:col-span-2 space-y-8">
          <div className="card-lg bg-surface relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Lock size={120} />
            </div>

            <h3 className="text-xl font-bold text-text-primary mb-8 flex items-center gap-3">
              <Clock className="text-primary" size={24} />
              Upcoming Obligations
            </h3>

            <div className="space-y-4">
              {[
                {
                  title: "Annual Income Tax (PAYE)",
                  period: "Jan - Dec 2026",
                  amount: "₦430,000.00",
                  status: "Pending",
                  due: "Jan 31, 2027",
                },
                {
                  title: "Value Added Tax (VAT)",
                  period: "Q2 2026",
                  amount: "₦12,500.00",
                  status: "Pending",
                  due: "Jul 21, 2026",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between p-6 rounded-2xl bg-secondary-medium/50 border border-border hover:border-primary/30 transition-all group/item"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-lighter flex items-center justify-center border border-primary/20">
                      <FileText className="text-primary w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-text-primary group-hover/item:text-primary transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-0.5">
                        {item.period}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="text-right">
                      <p className="text-lg font-bold text-text-primary">
                        {item.amount}
                      </p>
                      <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">
                        Due {item.due}
                      </p>
                    </div>
                    <button className="p-3 rounded-xl bg-primary/10 text-primary opacity-0 group-hover/item:opacity-100 transition-all hover:bg-primary hover:text-white">
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-lg bg-surface">
            <h3 className="text-xl font-bold text-text-primary mb-8 flex items-center gap-3">
              <CheckCircle2 className="text-success" size={24} />
              Payment History
            </h3>
            <div className="space-y-4">
              {[
                {
                  title: "Annual Income Tax",
                  period: "2025",
                  amount: "₦352,000.00",
                  date: "Jan 25, 2026",
                },
                {
                  title: "VAT Settlement",
                  period: "Q1 2026",
                  amount: "₦8,400.00",
                  date: "Apr 15, 2026",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between p-5 rounded-2xl bg-success/5 border border-success/10 hover:border-success/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                      <CheckCircle2 className="text-success w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-tighter">
                        Settled • {item.period}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-success">
                      {item.amount}
                    </p>
                    <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">
                      Confirmed {item.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card bg-primary-lighter border border-primary/10 relative overflow-hidden group">
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary/5 rounded-full transition-transform group-hover:scale-150" />
            <h4 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-3">
              <AlertCircle className="text-primary" size={18} />
              Tax Optimization
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed mb-6">
              Based on your transaction history, you may be eligible for
              additional consolidated relief allowances and VAT exemptions.
            </p>
            <button className="w-full btn-primary text-xs uppercase tracking-widest py-3">
              Recalculate Savings
            </button>
          </div>

          <div className="card bg-surface border-border/50">
            <h4 className="text-sm font-bold text-text-primary mb-6">
              Compliance Checklist
            </h4>
            <div className="space-y-5">
              {[
                { label: "TIN Verification", status: true },
                { label: "Income Classification", status: true },
                { label: "Deduction Validation", status: false },
                { label: "Filing Readiness", status: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-xs text-text-secondary font-medium">{item.label}</span>
                  {item.status ? (
                    <CheckCircle2 size={16} className="text-success shadow-sm" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-border" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-warning/10 bg-warning/5">
            <p className="text-[10px] text-warning font-bold leading-relaxed italic text-center uppercase tracking-tighter">
              Disclaimer: Estimates are for informational purposes only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
