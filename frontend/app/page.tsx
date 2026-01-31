"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ShieldCheck,
  ArrowUpRight,
  Plus,
  Filter,
} from "lucide-react";
import { FinancialCard } from "@/components/FinancialCard";
import { TransactionTable } from "@/components/TransactionTable";
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

  const calculateMetrics = (txs: any[]) => {
    let income = 0;
    let expense = 0;
    let balance = 0;

    // Simple calculation based on all time transactions for now
    // In production, this should be filtered by month/date range
    txs.forEach((tx) => {
      const amount = Number(tx.amount);
      if (tx.type === "credit") {
        income += amount;
        balance += amount;
      } else {
        expense += amount;
        balance -= amount; // Assuming logic: credit adds to balance, debit subtracts
      }
    });

    setMetrics({
      totalBalance: balance,
      monthlyIncome: income, // Simplified: using total as monthly for demo
      monthlyExpense: expense, // Simplified
      taxLiability: income * 0.1, // Dummy 10% tax
    });

    // Prepare chart data (group by month - simplified)
    // This is a placeholder logic for chart
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
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            Authentication Required
          </h1>
          <p className="text-lg text-slate-400 mb-8">
            You must be logged in to view your financial dashboard.
          </p>
          <a
            href="/auth"
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-slate-400 text-sm">
            Welcome back. Here's your real-time financial status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all">
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95">
            <Plus size={16} />
            <span>New Statement</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinancialCard
          title="Total Balance"
          value={`₦${metrics.totalBalance.toLocaleString()}`}
          subValue="Real-time based on transactions"
          icon={Wallet}
          trend={{ value: "0%", isPositive: true }}
        />
        <FinancialCard
          title="Total Income"
          value={`₦${metrics.monthlyIncome.toLocaleString()}`}
          subValue="All recorded credits"
          icon={TrendingUp}
          trend={{ value: "0%", isPositive: true }}
        />
        <FinancialCard
          title="Total Expenses"
          value={`₦${metrics.monthlyExpense.toLocaleString()}`}
          subValue="All recorded debits"
          icon={TrendingDown}
          trend={{ value: "0%", isPositive: false }}
        />
        <FinancialCard
          title="Est. Tax Liability"
          value={`₦${metrics.taxLiability.toLocaleString()}`}
          subValue="Estimated 10% flat"
          icon={ShieldCheck}
          className="border-blue-500/20"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-6 rounded-3xl border border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white">Cash Flow Analysis</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Income
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Expense
                </span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#ffffff05"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
                  tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                  itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl border border-white/5">
          <h3 className="text-lg font-bold text-white mb-6">
            Spending by Category
          </h3>
          <div className="space-y-6">
            {/* Placeholder for category breakdown */}
            <div className="text-center text-slate-500 py-10">
              No category data available yet
            </div>
          </div>
          <button className="w-full mt-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-widest transition-all">
            View Full Analysis
          </button>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white tracking-tight">
            Recent Activity
          </h3>
          <button className="text-blue-500 text-xs font-bold uppercase tracking-widest hover:text-blue-400 transition-colors flex items-center gap-1">
            <span>View All</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
        <TransactionTable
          transactions={transactions.map((t) => ({
            id: t.id,
            date: t.transaction_date,
            description: t.description,
            amount: Number(t.amount),
            type: t.type,
            category: t.category_name || "Uncategorized",
          }))}
        />
      </div>
    </div>
  );
}
