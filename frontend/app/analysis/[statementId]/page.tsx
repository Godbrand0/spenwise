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
} from "lucide-react";
import Link from "next/link";
import { FinancialCard } from "@/components/FinancialCard";
import { TransactionTable } from "@/components/TransactionTable";
import { createBrowserClient } from "@/lib/database/client";

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

export default function AnalysisPage({
  params,
}: {
  params: Promise<{ statementId: string }>;
}) {
  const { statementId } = use(params);
  console.log("Analysis page loaded with statementId:", statementId);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [statementData, setStatementData] = useState<any>(null);
  const [previousTransactions, setPreviousTransactions] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<string>("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const supabase = createBrowserClient();

  // Generate AI insights and suggestions - moved before useEffect to fix hoisting issue
  const generateAIInsights = async (transactionsData: any[]) => {
    setAiLoading(true);
    try {
      // Call the statement analysis API to generate and store analysis
      const response = await fetch(`/api/statements/${statementId}/analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAiInsights(data.insights || "");
        setAiSuggestions(data.suggestions || []);
      } else {
        console.error("AI API returned error status:", response.status);
      }
    } catch (error) {
      console.error("Error generating AI insights:", error);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user && statementId) {
        // Fetch statement data
        const { data: statement, error: statementError } = await supabase
          .from("statements")
          .select("*, ai_insights, ai_suggestions, analysis_generated_at")
          .eq("id", statementId)
          .eq("user_id", user.id)
          .single();

        if (statementError) {
          console.error("Error fetching statement:", statementError);
        } else {
          setStatementData(statement);
          
          // Set AI insights from stored data
          if (statement.ai_insights) {
            setAiInsights(statement.ai_insights);
            setAiSuggestions(statement.ai_suggestions || []);
          }
        }

        // Fetch transactions for this statement
        const { data: transactionsData, error: transactionsError } =
          await supabase
            .from("transactions")
            .select("*")
            .eq("statement_id", statementId)
            .eq("user_id", user.id)
            .order("transaction_date", { ascending: false });

        if (transactionsError) {
          console.error("Error fetching transactions:", transactionsError);
        } else {
          setTransactions(transactionsData || []);

          // Fetch previous month transactions for comparison
          if (statement?.statement_period_start) {
            const statementDate = new Date(statement.statement_period_start);
            const previousMonth = new Date(
              statementDate.getFullYear(),
              statementDate.getMonth() - 1,
              1,
            );
            const nextMonth = new Date(
              statementDate.getFullYear(),
              statementDate.getMonth() + 1,
              0,
            );

            const { data: prevTransactions } = await supabase
              .from("transactions")
              .select("*")
              .eq("user_id", user.id)
              .gte(
                "transaction_date",
                previousMonth.toISOString().split("T")[0],
              )
              .lt("transaction_date", nextMonth.toISOString().split("T")[0])
              .neq("statement_id", statementId)
              .order("transaction_date", { ascending: false });

            setPreviousTransactions(prevTransactions || []);
          }

          // Set loading to false first to show the page
          setLoading(false);

          // If no analysis exists, generate it asynchronously
          if (!statement?.ai_insights && transactionsData && transactionsData.length > 0) {
            generateAIInsights(transactionsData);
          }
        }
      }
    };
    fetchData();
  }, [statementId, supabase]); // Added supabase to dependencies

  if (!isMounted) return null;

  console.log("Analysis page - user check, user:", user);
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070a]">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            Authentication Required
          </h1>
          <p className="text-lg text-slate-400 mb-8">
            You must be logged in to view statement analysis.
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


  console.log("Analysis page - loading check, loading:", loading);
  if (loading) {
    console.log("Analysis page - rendering page");
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

  // Calculate category data from real transactions
  const categoryData = transactions.reduce((acc: any[], transaction) => {
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
  const totalInflow = transactions
    .filter((t) => t.type === "credit" || t.is_income)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflow = transactions
    .filter((t) => t.type === "debit" || !t.is_income)
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalInflow - totalOutflow;

  // Calculate previous month totals for comparison
  const prevTotalInflow = previousTransactions
    .filter((t) => t.type === "credit" || t.is_income)
    .reduce((sum, t) => sum + t.amount, 0);

  const prevTotalOutflow = previousTransactions
    .filter((t) => t.type === "debit" || !t.is_income)
    .reduce((sum, t) => sum + t.amount, 0);

  const prevNetSavings = prevTotalInflow - prevTotalOutflow;

  // Calculate percentage changes
  const inflowChange =
    prevTotalInflow > 0
      ? (((totalInflow - prevTotalInflow) / prevTotalInflow) * 100).toFixed(1)
      : "0";
  const outflowChange =
    prevTotalOutflow > 0
      ? (((totalOutflow - prevTotalOutflow) / prevTotalOutflow) * 100).toFixed(
          1,
        )
      : "0";
  const savingsChange =
    prevNetSavings > 0
      ? (((netSavings - prevNetSavings) / prevNetSavings) * 100).toFixed(1)
      : "0";

  // Prepare monthly data for charts
  const monthlyData = [
    { month: "Previous", income: prevTotalInflow, expenses: prevTotalOutflow },
    { month: "Current", income: totalInflow, expenses: totalOutflow },
  ];

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
              Statement Analysis
            </h1>
            <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">
              ID: {statementId.slice(0, 8)}... •{" "}
              {statementData?.bank_name || "Bank"} Statement •{" "}
              {new Date(
                statementData?.statement_date || Date.now(),
              ).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
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
          <div className="h-[350px] w-full min-h-[350px]">
            <ResponsiveContainer width="100%" height={350}>
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
            {categoryData.map((item, index) => (
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
            Monthly Comparison
          </h3>
          <div className="h-[350px] w-full min-h-[350px]">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={monthlyData}>
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
                <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Target className="text-blue-500 w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white mb-1">
                  AI Analysis
                </h4>
                {aiLoading ? (
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-700/50 rounded animate-pulse w-full" />
                    <div className="h-3 bg-slate-700/50 rounded animate-pulse w-5/6" />
                    <div className="h-3 bg-slate-700/50 rounded animate-pulse w-4/6" />
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 leading-relaxed">
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
        <div className="glass p-8 rounded-3xl border border-white/5">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <div className="w-1 h-4 bg-green-500 rounded-full" />
            AI Cost-Cutting Suggestions
          </h3>
          {aiLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-green-500/5 border border-green-500/10"
                >
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Target className="text-green-500 w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-700/50 rounded animate-pulse w-full" />
                    <div className="h-3 bg-slate-700/50 rounded animate-pulse w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
                      onClick={async () => {
                        try {
                          // Create todo from AI suggestion
                          const todoData = {
                            userId: user.id,
                            title: suggestion.length > 50 ? suggestion.substring(0, 47) + "..." : suggestion,
                            description: "AI-generated cost-cutting suggestion based on your spending analysis",
                            category: "savings" as const,
                            priority: "medium" as const,
                            targetAmount: null,
                            targetDate: null,
                            isRecurring: false,
                            recurringFrequency: null,
                            tags: ["AI-suggestion", "cost-cutting"],
                          };

                          const response = await fetch("/api/todos", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify(todoData),
                          });

                          if (response.ok) {
                            // Redirect to todos page to see the new goal
                            window.location.href = "/todos";
                          } else {
                            console.error("Failed to create todo from suggestion");
                          }
                        } catch (error) {
                          console.error("Error creating todo from suggestion:", error);
                        }
                      }}
                    >
                      Create Goal →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Transaction Log */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white tracking-tight">
          Extracted Transactions
        </h3>
        <TransactionTable
          transactions={transactions.map((t) => ({
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
