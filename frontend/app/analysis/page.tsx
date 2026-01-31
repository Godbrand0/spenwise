"use client";

import React, { useEffect, useState, use } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  ArrowLeft,
  Download,
  Share2,
  Printer,
  FileText,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { FinancialCard } from "@/components/FinancialCard";
import { TransactionTable } from "@/components/TransactionTable";
import { createBrowserClient } from "@/lib/database/client";
import { useAppSelector } from "@/lib/store/hooks";

const COLORS = [
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#F43F5E",
  "#F59E0B",
  "#10B981",
  "#06B6D4",
];

export default function FinancialAnalysisPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [statements, setStatements] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<string>("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  const supabase = createBrowserClient();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      fetchAnalysisData(user.id);
    }
  }, [user]);

  const fetchAnalysisData = async (userId: string) => {
    try {
      // Fetch all statements
      const { data: statementsData, error: statementsError } = await supabase
        .from("statements")
        .select("*")
        .eq("user_id", userId)
        .order("statement_period_start", { ascending: false });

      if (statementsError) {
        console.error("Error fetching statements:", statementsError);
      } else {
        setStatements(statementsData || []);
      }

      // Fetch all transactions for this user
      const { data: transactionsData, error: transactionsError } =
        await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", userId)
          .order("transaction_date", { ascending: false });

      if (transactionsError) {
        console.error("Error fetching transactions:", transactionsError);
        return;
      }

      if (transactionsData) {
        setAllTransactions(transactionsData);

        // Generate monthly data for charts
        const monthlyMap = new Map();
        transactionsData.forEach((transaction) => {
          const date = new Date(transaction.transaction_date);
          const monthKey = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
          });

          if (!monthlyMap.has(monthKey)) {
            monthlyMap.set(monthKey, {
              month: monthKey,
              income: 0,
              expenses: 0,
              savings: 0,
            });
          }

          const monthData = monthlyMap.get(monthKey);
          if (transaction.type === "credit" || transaction.is_income) {
            monthData.income += transaction.amount;
          } else {
            monthData.expenses += transaction.amount;
          }
          monthData.savings = monthData.income - monthData.expenses;
        });

        const monthlyArray = Array.from(monthlyMap.values()).sort(
          (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime(),
        );
        setMonthlyData(monthlyArray);

        // Generate AI insights and suggestions
        if (transactionsData.length > 0) {
          await generateAIInsights(transactionsData);
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate AI insights and suggestions
  const generateAIInsights = async (transactionsData: any[]) => {
    try {
      // Prepare transaction summary for AI analysis
      const transactionSummary = transactionsData.map((t) => ({
        description: t.description,
        amount: t.amount,
        category: t.category_name,
        type: t.type,
        date: t.transaction_date,
      }));

      // Call AI for insights
      const insightsPrompt = `
        Analyze these transactions across all statements and provide:
        1. A comprehensive summary of overall spending patterns and financial health (3-4 sentences)
        2. 4-5 specific cost-cutting suggestions that can be turned into actionable financial goals
        3. Identify trends in income and expenses over time
        
        Transactions: ${JSON.stringify(transactionSummary.slice(0, 50), null, 2)}
      `;

      const response = await fetch("/api/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: insightsPrompt,
          type: "analysis",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiInsights(data.insights || "");
        setAiSuggestions(data.suggestions || []);
      } else {
        // Fallback insights if AI fails
        setAiInsights(
          "Based on your transaction history, you have a mix of essential and discretionary spending. Consider reviewing your largest expense categories for potential savings opportunities.",
        );
        setAiSuggestions([
          "Review subscription services and cancel unused ones",
          "Set a monthly budget for dining out and entertainment",
          "Look for opportunities to reduce utility costs",
          "Consider automating savings transfers",
        ]);
      }
    } catch (error) {
      console.error("Error generating AI insights:", error);
      // Fallback insights if AI fails
      setAiInsights(
        "Based on your transaction history, you have a mix of essential and discretionary spending. Consider reviewing your largest expense categories for potential savings opportunities.",
      );
      setAiSuggestions([
        "Review subscription services and cancel unused ones",
        "Set a monthly budget for dining out and entertainment",
        "Look for opportunities to reduce utility costs",
        "Consider automating savings transfers",
      ]);
    }
  };

  if (!isMounted) return null;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070a]">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            Authentication Required
          </h1>
          <p className="text-lg text-slate-400 mb-8">
            You must be logged in to view financial analysis.
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070a]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
            Generating Financial Analysis...
          </p>
        </div>
      </div>
    );
  }

  // Calculate category data from all transactions
  const categoryData = allTransactions.reduce((acc: any[], transaction) => {
    const categoryName = transaction.category_name || "Uncategorized";
    const existingCategory = acc.find((cat) => cat.name === categoryName);

    if (existingCategory) {
      existingCategory.value += Math.abs(transaction.amount);
    } else {
      acc.push({
        name: categoryName,
        value: Math.abs(transaction.amount),
      });
    }

    return acc;
  }, []);

  // Calculate totals
  const totalInflow = allTransactions
    .filter((t) => t.type === "credit" || t.is_income)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflow = allTransactions
    .filter((t) => t.type === "debit" || !t.is_income)
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalInflow - totalOutflow;

  // Calculate month-over-month changes
  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];

  const inflowChange =
    previousMonth && previousMonth.income > 0
      ? (
          ((currentMonth.income - previousMonth.income) /
            previousMonth.income) *
          100
        ).toFixed(1)
      : "0";
  const outflowChange =
    previousMonth && previousMonth.expenses > 0
      ? (
          ((currentMonth.expenses - previousMonth.expenses) /
            previousMonth.expenses) *
          100
        ).toFixed(1)
      : "0";
  const savingsChange =
    previousMonth && previousMonth.savings > 0
      ? (
          ((currentMonth.savings - previousMonth.savings) /
            previousMonth.savings) *
          100
        ).toFixed(1)
      : "0";

  if (statements.length === 0) {
    return (
      <div className="p-8 space-y-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Financial Analysis
            </h1>
            <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">
              Comprehensive overview of your financial health
            </p>
          </div>
        </div>

        <div className="glass p-12 rounded-3xl border border-white/5 text-center">
          <FileText className="h-16 w-16 text-slate-500 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-white mb-4">
            No Statements Found
          </h3>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            You haven't uploaded any bank statements yet. Upload your first
            statement to get started with AI-powered financial analysis.
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all"
          >
            <FileText size={16} />
            <span>Upload Statement</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Navigation & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Financial Analysis
            </h1>
            <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">
              Comprehensive overview of your financial health
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/statements"
            className="text-sm text-blue-400 hover:text-blue-300 font-medium"
          >
            View All Statements →
          </Link>
          <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white">
            <Share2 size={18} />
          </button>
          <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white">
            <Printer size={18} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all">
            <Download size={16} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinancialCard
          title="Total Outflow"
          value={`₦${totalOutflow.toLocaleString()}.00`}
          icon={TrendingDown}
          trend={{
            value: `${outflowChange}%`,
            isPositive: parseFloat(outflowChange) < 0,
          }}
        />
        <FinancialCard
          title="Total Inflow"
          value={`₦${totalInflow.toLocaleString()}.00`}
          icon={TrendingUp}
          trend={{
            value: `${inflowChange}%`,
            isPositive: parseFloat(inflowChange) > 0,
          }}
        />
        <FinancialCard
          title="Net Savings"
          value={`₦${netSavings.toLocaleString()}.00`}
          icon={Target}
          trend={{
            value: `${savingsChange}%`,
            isPositive: parseFloat(savingsChange) > 0,
          }}
        />
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-8 rounded-3xl border border-white/5">
          <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
            <div className="w-1 h-4 bg-blue-500 rounded-full" />
            Spending Distribution
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                  itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            {categoryData.slice(0, 6).map((item, index) => (
              <div
                key={item.name}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {item.name}
                  </span>
                  <span className="text-sm font-bold text-white">
                    ₦{item.value.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-8 rounded-3xl border border-white/5">
          <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
            <div className="w-1 h-4 bg-indigo-500 rounded-full" />
            Monthly Trend
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#ffffff05"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stackId="2"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Target className="text-blue-500 w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  AI Analysis
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {aiInsights || "Analyzing your spending patterns..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="glass p-8 rounded-3xl border border-white/5">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <div className="w-1 h-4 bg-green-500 rounded-full" />
            AI Cost-Cutting Suggestions
          </h3>
          <div className="space-y-4">
            {aiSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-2xl bg-green-500/5 border border-green-500/10"
              >
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Target className="text-green-500 w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {suggestion}
                  </p>
                  <button
                    className="mt-2 text-xs text-green-400 hover:text-green-300 font-medium"
                    onClick={() => {
                      // TODO: Create todo/goal from suggestion
                      console.log("Create todo from suggestion:", suggestion);
                    }}
                  >
                    Create Goal →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white tracking-tight">
            Recent Transactions
          </h3>
          <Link
            href="/transactions"
            className="text-sm text-blue-400 hover:text-blue-300 font-medium"
          >
            View All →
          </Link>
        </div>
        <TransactionTable
          transactions={allTransactions.slice(0, 10).map((t) => ({
            id: t.id,
            date: t.transaction_date,
            description: t.description,
            amount: t.amount,
            type: t.type,
            category: t.category_name,
          }))}
        />
      </div>
    </div>
  );
}
