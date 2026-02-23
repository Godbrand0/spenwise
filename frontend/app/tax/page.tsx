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
import { TaxCalculation } from "@/lib/database/types";

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getPeriodLabel(calc: TaxCalculation): string {
  if (calc.tax_period === "annual") return `Jan – Dec ${calc.tax_year}`;
  if (calc.tax_period === "quarterly") {
    const q = Math.floor(new Date(calc.period_start).getMonth() / 3) + 1;
    return `Q${q} ${calc.tax_year}`;
  }
  return new Date(calc.period_start).toLocaleDateString("en-NG", {
    month: "short",
    year: "numeric",
  });
}

function getTaxTitle(calc: TaxCalculation): string {
  if (calc.tax_period === "annual") return "Annual Income Tax (PAYE)";
  if (calc.tax_period === "quarterly") return "Quarterly Tax";
  return "Monthly Tax";
}

const TAX_BADGE_LABELS: Record<TaxCalculation["tax_badge"], string> = {
  "tax-exempt": "Tax Exempt",
  "low-tax": "Low Tax",
  "standard-tax": "Standard Tax",
  "high-tax": "High Tax",
};

const TAX_BADGE_COLORS: Record<TaxCalculation["tax_badge"], string> = {
  "tax-exempt": "badge-success",
  "low-tax": "badge-success",
  "standard-tax": "badge-warning",
  "high-tax": "badge-error",
};

export default function TaxPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [taxCalculations, setTaxCalculations] = useState<TaxCalculation[]>([]);

  const supabase = createBrowserClient();

  useEffect(() => {
    setIsMounted(true);
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await fetchTaxData(user.id);
      }
      setTimeout(() => setLoading(false), 800);
    };
    getUser();
  }, []);

  const fetchTaxData = async (userId: string) => {
    try {
      const response = await fetch(`/api/tax/estimate?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setTaxCalculations(data || []);
      }
    } catch (error) {
      console.error("Error fetching tax data:", error);
    }
  };

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

  // Derived data from API
  const latestCalc = taxCalculations[0] ?? null;
  const pendingCalcs = taxCalculations.filter((c) => c.tax_status !== "paid");
  const paidCalcs = taxCalculations.filter((c) => c.tax_status === "paid");

  const nextDeadline = pendingCalcs
    .filter((c) => c.due_date)
    .sort(
      (a, b) =>
        new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime(),
    )[0];

  // Compliance checklist based on real data
  const complianceItems = [
    {
      label: "Tax Records Found",
      status: taxCalculations.length > 0,
    },
    {
      label: "Income Classification",
      status: latestCalc ? latestCalc.gross_income > 0 : false,
    },
    {
      label: "Deduction Validation",
      status: latestCalc
        ? latestCalc.consolidated_relief_allowance > 0
        : false,
    },
    {
      label: "Filing Readiness",
      status: taxCalculations.some(
        (c) => c.tax_status === "filed" || c.tax_status === "paid",
      ),
    },
  ];

  const badgeLabel = latestCalc
    ? TAX_BADGE_LABELS[latestCalc.tax_badge]
    : "No Data";
  const badgeClass = latestCalc
    ? TAX_BADGE_COLORS[latestCalc.tax_badge]
    : "badge-warning";

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
          <div
            className={`badge ${badgeClass} px-4 py-2 border border-success/20`}
          >
            <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse mr-2" />
            <span>{badgeLabel}</span>
          </div>
        </div>
      </div>

      {/* Tax Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinancialCard
          title="Estimated Tax"
          value={
            latestCalc
              ? `₦${latestCalc.estimated_tax.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : "—"
          }
          subValue={
            latestCalc ? `Projected for ${latestCalc.tax_year} Tax Year` : "No calculation yet"
          }
          icon={DollarSign}
        />
        <FinancialCard
          title="Taxable Income"
          value={
            latestCalc
              ? `₦${latestCalc.taxable_income.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : "—"
          }
          subValue={
            latestCalc
              ? "After all deductions & reliefs"
              : "No data available"
          }
          icon={FileText}
        />
        <FinancialCard
          title="Next Deadline"
          value={
            nextDeadline?.due_date ? formatDate(nextDeadline.due_date) : "—"
          }
          subValue={
            nextDeadline?.due_date
              ? `${daysUntil(nextDeadline.due_date)} days remaining`
              : "No upcoming deadline"
          }
          icon={Calendar}
          className="border-amber-500/20"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Obligations */}
          <div className="card-lg bg-surface relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Lock size={120} />
            </div>

            <h3 className="text-xl font-bold text-text-primary mb-8 flex items-center gap-3">
              <Clock className="text-primary" size={24} />
              Upcoming Obligations
            </h3>

            {pendingCalcs.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">
                No pending tax obligations.
              </p>
            ) : (
              <div className="space-y-4">
                {pendingCalcs.map((calc) => (
                  <div
                    key={calc.id}
                    className="flex items-center justify-between p-6 rounded-2xl bg-secondary-medium/50 border border-border hover:border-primary/30 transition-all group/item"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-lighter flex items-center justify-center border border-primary/20">
                        <FileText className="text-primary w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-text-primary group-hover/item:text-primary transition-colors">
                          {getTaxTitle(calc)}
                        </h4>
                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-0.5">
                          {getPeriodLabel(calc)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-10">
                      <div className="text-right">
                        <p className="text-lg font-bold text-text-primary">
                          ₦{calc.estimated_tax.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">
                          {calc.due_date ? `Due ${formatDate(calc.due_date)}` : calc.tax_status}
                        </p>
                      </div>
                      <Link
                        href="/tax/calculator"
                        className="p-3 rounded-xl bg-primary/10 text-primary opacity-0 group-hover/item:opacity-100 transition-all hover:bg-primary hover:text-white"
                      >
                        <ArrowRight size={20} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="card-lg bg-surface">
            <h3 className="text-xl font-bold text-text-primary mb-8 flex items-center gap-3">
              <CheckCircle2 className="text-success" size={24} />
              Payment History
            </h3>

            {paidCalcs.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">
                No payment history yet.
              </p>
            ) : (
              <div className="space-y-4">
                {paidCalcs.map((calc) => (
                  <div
                    key={calc.id}
                    className="flex items-center justify-between p-5 rounded-2xl bg-success/5 border border-success/10 hover:border-success/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                        <CheckCircle2 className="text-success w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text-primary">
                          {getTaxTitle(calc)}
                        </h4>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-tighter">
                          Settled • {getPeriodLabel(calc)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-success">
                        ₦{calc.amount_paid.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">
                        Confirmed {formatDate(calc.updated_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            <Link
              href="/tax/calculator"
              className="w-full btn-primary text-xs uppercase tracking-widest py-3 block text-center"
            >
              Recalculate Savings
            </Link>
          </div>

          <div className="card bg-surface border-border/50">
            <h4 className="text-sm font-bold text-text-primary mb-6">
              Compliance Checklist
            </h4>
            <div className="space-y-5">
              {complianceItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-xs text-text-secondary font-medium">
                    {item.label}
                  </span>
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
