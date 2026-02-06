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
  BarChart2,
} from "lucide-react";
import Link from "next/link";
import { FinancialCard } from "@/components/FinancialCard";
import { TransactionTable } from "@/components/TransactionTable";
import { createBrowserClient } from "@/lib/database/client";
import { useAppSelector } from "@/lib/store/hooks";

const COLORS = [
  "#0D8282", // Primary
  "#238636", // Success
  "#DA3633", // Error
  "#D29922", // Warning
  "#161B22", // Secondary Medium
  "#3B82F6", // Blue
  "#6366F1", // Indigo
  "#8B5CF6", // Violet
];

export default function FinancialAnalysisPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
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

        // Fetch stored user analysis
        const { data: userAnalysis, error: analysisError } = await supabase
          .from("user_financial_analysis")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (!analysisError && userAnalysis) {
          // Use stored analysis
          setAiInsights(userAnalysis.ai_insights || "");
          setAiSuggestions(userAnalysis.ai_suggestions || []);
        }

        // Set loading to false first to show the page
        setLoading(false);

        // If no analysis exists or needs update, generate asynchronously
        if (!userAnalysis && transactionsData.length > 0) {
          generateAIInsights(userId);
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setLoading(false);
    }
  };

  // Generate AI insights and suggestions
  const generateAIInsights = async (userId: string) => {
    setAiLoading(true);
    try {
      // Call the user analysis API to generate and store comprehensive analysis
      const response = await fetch("/api/analysis/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAiInsights(data.insights || "");
        setAiSuggestions(data.suggestions || []);
      } else {
        console.error("AI API returned error status:", response.status);
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
        "Unable to generate AI insights at this time. Please try again later.",
      );
      setAiSuggestions([
        "Review subscription services and cancel unused ones",
        "Set a monthly budget for dining out and entertainment",
        "Look for opportunities to reduce utility costs",
        "Consider automating savings transfers",
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  if (!isMounted) return null;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/20">
            <BarChart2 className="text-primary w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-text-primary mb-4 tracking-tight">
            Restricted Access
          </h1>
          <p className="text-lg text-text-secondary mb-10 leading-relaxed font-medium">
            Unlock advanced financial intelligence and spending insights.
          </p>
          <Link
            href="/auth"
            className="btn-primary w-full py-4 text-center text-base tracking-[0.2em]"
          >
            SIGN IN TO ANALYZE
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 animate-fade-in">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin mx-auto shadow-2xl shadow-primary/20" />
          <p className="text-text-muted font-black text-xs uppercase tracking-[0.4em] animate-pulse">
            Executing Intelligence Protocols...
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
      <div className="py-8 space-y-8 animate-fade-in">
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
    <div className="py-8 space-y-10 animate-fade-in">
      {/* Navigation & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-3 bg-secondary-medium hover:bg-secondary-light rounded-xl transition-all border border-border group"
          >
            <ArrowLeft size={20} className="text-text-secondary group-hover:text-white" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">
              Financial Analysis
            </h1>
            <p className="text-text-secondary text-xs font-bold uppercase tracking-wider">
              AI-Powered insights and spending patterns
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/statements"
            className="text-sm font-bold text-primary hover:text-primary-light hidden md:block"
          >
            View All Statements →
          </Link>
          <div className="flex gap-2">
            <button className="p-2 bg-secondary-medium hover:bg-secondary-light rounded-xl transition-all text-text-secondary hover:text-white border border-border">
              <Share2 size={18} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all">
              <Download size={16} />
              <span>Export PDF</span>
            </button>
          </div>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-lg bg-surface relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <h3 className="text-xl font-bold text-text-primary mb-8 flex items-center gap-3 relative z-10">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            Spending Distribution
          </h3>
          <div className="h-[350px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="rgba(0,0,0,0.2)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    boxShadow: "var(--shadow-lg)",
                  }}
                  itemStyle={{ fontSize: "12px", fontWeight: "bold", color: "var(--color-text-primary)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
            {categoryData.slice(0, 6).map((item, index) => (
              <div
                key={item.name}
                className="flex items-center gap-3 p-4 rounded-2xl bg-secondary-medium/50 border border-border group/item hover:border-primary/30 transition-all"
              >
                <div
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                    {item.name}
                  </span>
                  <span className="text-sm font-bold text-text-primary group-hover/item:text-primary transition-colors">
                    ₦{item.value.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-lg bg-surface relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <h3 className="text-xl font-bold text-text-primary mb-8 flex items-center gap-3 relative z-10">
            <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
            Monthly Trend
          </h3>
          <div className="h-[350px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-text-secondary)", fontSize: 10, fontWeight: 700 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-text-secondary)", fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip
                  cursor={{ fill: "var(--color-primary-lighter)" }}
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
                  stackId="1"
                  stroke="var(--color-success)"
                  fill="var(--color-success)"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stackId="2"
                  stroke="var(--color-error)"
                  fill="var(--color-error)"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 p-5 rounded-2xl bg-primary-lighter border border-primary/10 relative z-10 group/ai cursor-help">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary rounded-xl shadow-lg shadow-primary/20">
                <Target className="text-white w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-text-primary mb-1">
                  AI Financial Intelligence
                </h4>
                {aiLoading ? (
                  <div className="space-y-2 mt-2">
                    <div className="h-3 bg-border rounded animate-pulse w-full" />
                    <div className="h-3 bg-border rounded animate-pulse w-5/6" />
                  </div>
                ) : (
                  <p className="text-xs text-text-secondary leading-relaxed group-hover/ai:text-text-primary transition-colors">
                    {aiInsights || "Analyzing your spending patterns..."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      {(aiLoading || aiSuggestions.length > 0) && (
        <div className="card-lg bg-surface relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <h3 className="text-xl font-bold text-text-primary mb-8 flex items-center gap-3 relative z-10">
            <div className="w-1.5 h-6 bg-success rounded-full" />
            AI Cost-Cutting Intelligence
          </h3>
          {aiLoading ? (
            <div className="space-y-4 relative z-10">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-secondary-medium/50 border border-border animate-pulse"
                >
                  <div className="p-3 bg-border rounded-xl w-10 h-10" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-border rounded w-full" />
                    <div className="h-4 bg-border rounded w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              {aiSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-secondary-medium/50 border border-border hover:border-success/30 transition-all group/suggestion"
                >
                  <div className="p-3 bg-success/10 rounded-xl group-hover/suggestion:bg-success/20 transition-colors">
                    <Target className="text-success w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text-secondary leading-relaxed group-hover/suggestion:text-text-primary transition-colors">
                      {suggestion}
                    </p>
                    <button
                      className="mt-3 text-xs font-bold text-success hover:text-success-light transition-colors flex items-center gap-1"
                      onClick={() => console.log("Create goal:", suggestion)}
                    >
                      <span>Create Saving Goal</span>
                      <TrendingUp size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent Transactions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-text-primary tracking-tight">
            Comprehensive Ledger
          </h3>
          <div className="flex items-center gap-4">
            <Link
              href="/statements"
              className="text-sm font-bold text-primary hover:text-primary-light"
            >
              Manage Statements →
            </Link>
          </div>
        </div>
        <div className="card overflow-hidden border-border bg-surface/50 backdrop-blur-sm">
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
    </div>
  );
}
