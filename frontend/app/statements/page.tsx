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
    <div className="py-8 space-y-8 animate-fade-in">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="p-3 bg-secondary-medium hover:bg-secondary-light rounded-xl transition-all border border-border group"
        >
          <ArrowLeft size={20} className="text-text-secondary group-hover:text-white" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            Bank Statements
          </h1>
          <p className="text-text-secondary text-xs font-bold uppercase tracking-wider">
            View and analyze your financial history
          </p>
        </div>
      </div>

      {statements.length === 0 ? (
        <div className="card-lg p-16 text-center border-dashed border-2 border-border/50">
          <div className="w-20 h-20 bg-primary-lighter rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-4">
            No Statements Found
          </h3>
          <p className="text-text-secondary mb-8 max-w-md mx-auto leading-relaxed">
            Upload your monthly bank statements to unlock AI-powered insights, spending patterns, and automated tax estimations.
          </p>
          <Link
            href="/upload"
            className="btn-primary"
          >
            <FileText size={18} className="mr-2" />
            <span>Upload Your First Statement</span>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statements.map((statement) => (
              <div
                key={statement.id}
                className="card group hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-primary-lighter rounded-xl">
                    <FileText className="text-primary w-6 h-6" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase">
                      ID: {statement.id.slice(0, 8)}
                    </span>
                    {statement.ai_insights ? (
                      <span className="badge badge-success">
                        Analysis Ready
                      </span>
                    ) : (
                      <span className="badge badge-neutral animate-pulse">
                        Processing...
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">
                  {statement.bank_name || "Bank"} Statement
                </h3>

                <div className="space-y-3 text-sm text-text-secondary mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary-medium flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="font-medium">
                      {new Date(
                        statement.statement_period_start ||
                          statement.created_at,
                      ).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary-medium flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{statement.transaction_count || 0} transactions</span>
                  </div>
                </div>

                <Link
                  href={`/analysis/${statement.id}`}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  <span>View Full Analysis</span>
                </Link>
              </div>
            ))}
          </div>

          {/* Upload CTA */}
          <div className="card-lg bg-primary-lighter/30 border-primary/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  Need More Analysis?
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Keep your dashboard up to date by uploading your latest statements. 
                  Spenwise automatically categorizes your spending and updates your tax estimations.
                </p>
              </div>
              <Link
                href="/upload"
                className="btn-primary whitespace-nowrap"
              >
                <FileText size={18} className="mr-2" />
                <span>Upload New Statement</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
