"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ShieldCheck,
  ArrowRight,
  FileText,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { createBrowserClient } from "@/lib/database/client";
import { useAppSelector } from "@/lib/store/hooks";
import { FinancialCard } from "@/components/FinancialCard";
import { calculateTax } from "@/lib/tax/calculator";

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    taxLiability: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);

  const supabase = createBrowserClient();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      fetchDashboardData(user.id);
    }
  }, [user]);

  const fetchDashboardData = async (userId: string) => {
    try {
      const { data: txData, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("transaction_date", { ascending: false });

      if (error) {
        console.error("Error fetching transactions:", error);
        return;
      }

      if (txData) {
        setTransactions(txData);
        calculateMetrics(txData);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const calculateMetrics = async (txs: any[]) => {
    let income = 0;
    let expense = 0;
    let balance = 0;

    txs.forEach((tx) => {
      const amount = Number(tx.amount);
      if (tx.type === "credit") {
        income += amount;
        balance += amount;
      } else {
        expense += amount;
        balance -= amount;
      }
    });

    const taxResult = await calculateTax(income);

    setMetrics({
      totalBalance: balance,
      monthlyIncome: income,
      monthlyExpense: expense,
      taxLiability: taxResult.estimatedTax,
    });

    const dummyChart = [
      { name: "Jan", income: income * 0.2, expense: expense * 0.2 },
      { name: "Feb", income: income * 0.3, expense: expense * 0.3 },
      { name: "Mar", income: income * 0.5, expense: expense * 0.5 },
    ];
    setChartData(
      dummyChart.length > 0 && income > 0
        ? dummyChart
        : [{ name: "No Data", income: 0, expense: 0 }],
    );
  };

  if (!isMounted || isLoading) return null;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center">
          <h1 className="text-3xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Authentication Required
          </h1>
          <p className="text-base mb-8" style={{ color: 'var(--color-text-secondary)' }}>
            Please sign in to view your financial dashboard
          </p>
          <a
            href="/auth"
            className="btn-primary inline-block"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-12 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-text-primary uppercase">
            Financial <span className="text-primary italic">Status</span>
          </h1>
          <p className="text-sm mt-1 text-text-secondary font-medium">
            Real-time intelligence and fiscal health overview
          </p>
        </div>
        <Link
          href="/upload"
          className="btn-primary inline-flex items-center gap-2 w-fit px-8 py-4 text-xs tracking-[0.2em] uppercase font-black"
        >
          <FileText size={18} />
          <span>Upload Statement</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinancialCard
          title="Total Balance"
          value={`₦${metrics.totalBalance.toLocaleString()}`}
          icon={Wallet}
          className="border-border/50"
        />

        <FinancialCard
          title="Total Income"
          value={`₦${metrics.monthlyIncome.toLocaleString()}`}
          icon={TrendingUp}
          trend={{ value: "12%", isPositive: true }}
          className="border-border/50"
        />

        <FinancialCard
          title="Total Expenses"
          value={`₦${metrics.monthlyExpense.toLocaleString()}`}
          icon={TrendingDown}
          trend={{ value: "5%", isPositive: false }}
          className="border-border/50"
        />

        <FinancialCard
          title="Est. Tax Liability"
          value={`₦${metrics.taxLiability.toLocaleString()}`}
          icon={ShieldCheck}
          subValue="VAT & Income Tax estimation"
          className="bg-primary/5 border-primary/20"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-lg">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black uppercase tracking-widest text-text-primary">Cash Flow Intelligence</h3>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-error" />
                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Expense</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-error)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-error)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                  opacity={0.3}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontWeight: 700 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontWeight: 700 }}
                  tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1 }}
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    boxShadow: "var(--shadow-lg)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="var(--color-primary)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="var(--color-error)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-lg">
          <h3 className="text-lg font-black uppercase tracking-widest text-text-primary mb-8">
            Operational
          </h3>
          <div className="space-y-4">
            <Link
              href="/upload"
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary-medium/20 hover:bg-primary/5 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-text-secondary group-hover:text-text-primary transition-colors">Import Statements</span>
              </div>
              <ArrowRight size={16} className="text-text-muted group-hover:text-primary transition-all group-hover:translate-x-1" />
            </Link>
            <Link
              href="/analysis"
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary-medium/20 hover:bg-primary/5 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-text-secondary group-hover:text-text-primary transition-colors">Deep Analysis</span>
              </div>
              <ArrowRight size={16} className="text-text-muted group-hover:text-primary transition-all group-hover:translate-x-1" />
            </Link>
            <Link
              href="/todos"
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary-medium/20 hover:bg-primary/5 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-text-secondary group-hover:text-text-primary transition-colors">Compliance Goals</span>
              </div>
              <ArrowRight size={16} className="text-text-muted group-hover:text-primary transition-all group-hover:translate-x-1" />
            </Link>
          </div>
          
          <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/10">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Pro Tip</p>
            <p className="text-xs text-text-secondary leading-relaxed font-medium">
              Upload multiple monthly statements to generate accurate year-over-year tax predictions.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card-lg">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-black uppercase tracking-widest text-text-primary">
            Intelligence Stream
          </h3>
          <Link
            href="/analysis"
            className="text-xs font-black uppercase tracking-widest flex items-center gap-2 group text-primary"
          >
            <span>FULL ARCHIVE</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Period</th>
                  <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Origin</th>
                  <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Protocol</th>
                  <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {transactions.slice(0, 5).map((tx) => (
                  <tr key={tx.id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-4 text-xs font-bold text-text-secondary">
                      {new Date(tx.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-xs font-black text-text-primary uppercase tracking-tight">{tx.description}</td>
                    <td className="py-4">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-secondary-medium text-text-muted group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                        {tx.category_name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="py-4 text-right text-xs font-black tracking-tight" style={{ color: tx.type === 'credit' ? 'var(--color-success)' : 'var(--color-text-primary)' }}>
                      {tx.type === 'credit' ? '+' : '-'}₦{Number(tx.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-secondary-medium/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border">
              <FileText className="w-8 h-8 text-text-muted" />
            </div>
            <p className="text-sm font-bold text-text-secondary mb-6">No operational data detected in the vault.</p>
            <Link href="/upload" className="btn-primary px-8 py-3 text-xs tracking-widest">
              INITIALIZE IMPORT
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

