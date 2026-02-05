"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, FileText, TrendingUp, Calendar, Eye } from "lucide-react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/database/client";
import { useAppSelector } from "@/lib/store/hooks";

export default function StatementsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [statements, setStatements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const supabase = createBrowserClient();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      fetchStatements(user.id);
    }
  }, [user]);

  const fetchStatements = async (userId: string) => {
    try {
      console.log("Fetching statements for user:", userId);
      
      // Fetch statements with AI insights
      const { data: statementsData, error } = await supabase
        .from("statements")
        .select("*, ai_insights")
        .eq("user_id", userId)
        .order("statement_period_start", { ascending: false });

      if (error) {
        console.error("Error fetching statements:", error);
        setLoading(false);
        return;
      }

      // Fetch transaction counts for each statement
      const statementsWithCounts = await Promise.all(
        (statementsData || []).map(async (statement) => {
          const { count } = await supabase
            .from("transactions")
            .select("*", { count: "exact", head: true })
            .eq("statement_id", statement.id);

          return {
            ...statement,
            transaction_count: count || 0,
          };
        })
      );

      console.log("Fetched statements with counts:", statementsWithCounts);
      setStatements(statementsWithCounts);
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
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
            You must be logged in to view your statements.
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
            Loading Statements...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Bank Statements
          </h1>
          <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">
            View and analyze your uploaded statements
          </p>
        </div>
      </div>

      {statements.length === 0 ? (
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
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statements.map((statement) => (
              <div
                key={statement.id}
                className="glass p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <FileText className="text-blue-500 w-5 h-5" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-slate-500 font-mono">
                      {statement.id.slice(0, 8)}...
                    </span>
                    {statement.ai_insights ? (
                      <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full font-medium">
                        Analysis Ready
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-slate-500/10 text-slate-400 rounded-full font-medium">
                        Processing...
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">
                  {statement.bank_name || "Bank"} Statement
                </h3>

                <div className="space-y-2 text-sm text-slate-400 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(
                        statement.statement_period_start ||
                          statement.created_at,
                      ).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>{statement.transaction_count || 0} transactions</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/analysis/${statement.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all"
                  >
                    <Eye size={14} />
                    <span>Analyze</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Upload CTA */}
          <div className="glass p-6 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Need More Analysis?
                </h3>
                <p className="text-sm text-slate-400">
                  Upload additional statements to track your financial progress
                  over time
                </p>
              </div>
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all"
              >
                <FileText size={16} />
                <span>Upload New</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
