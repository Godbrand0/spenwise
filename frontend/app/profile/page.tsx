"use client";

import React, { useEffect, useState } from "react";
import {
  UserCircle,
  Mail,
  Calendar,
  FileText,
  TrendingUp,
  TrendingDown,
  Wallet,
  ShieldCheck,
  Edit2,
  Check,
  X,
  Lock,
} from "lucide-react";
import { createBrowserClient } from "@/lib/database/client";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalStatements: 0,
    totalTransactions: 0,
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    latestTax: null as any,
  });
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);

  const supabase = createBrowserClient();

  useEffect(() => {
    setIsMounted(true);
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUser(user);

      const [profileRes, statementsRes, transactionsRes, taxRes] =
        await Promise.all([
          supabase.from("users").select("*").eq("id", user.id).single(),
          supabase
            .from("statements")
            .select("id")
            .eq("user_id", user.id),
          supabase
            .from("transactions")
            .select("amount, type")
            .eq("user_id", user.id),
          supabase
            .from("tax_calculations")
            .select("tax_year, estimated_tax, tax_status, effective_rate")
            .eq("user_id", user.id)
            .order("tax_year", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

      if (profileRes.data) setProfile(profileRes.data);

      let income = 0;
      let expenses = 0;
      const txs = transactionsRes.data || [];
      txs.forEach((tx: any) => {
        const amt = Number(tx.amount);
        if (tx.type === "credit") income += amt;
        else expenses += amt;
      });

      setStats({
        totalStatements: statementsRes.data?.length || 0,
        totalTransactions: txs.length,
        totalIncome: income,
        totalExpenses: expenses,
        netBalance: income - expenses,
        latestTax: taxRes.data || null,
      });

      setLoading(false);
    };
    init();
  }, []);

  const handleSaveName = async () => {
    if (!user || !nameInput.trim()) return;
    setSavingName(true);
    await supabase
      .from("users")
      .update({ full_name: nameInput.trim(), updated_at: new Date().toISOString() })
      .eq("id", user.id);
    setProfile((prev: any) => ({ ...prev, full_name: nameInput.trim() }));
    setEditingName(false);
    setSavingName(false);
  };

  const getInitials = () => {
    const name = profile?.full_name || user?.user_metadata?.full_name;
    if (name) {
      return name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  const getDisplayName = () =>
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  const getAuthProvider = () => {
    const provider = user?.app_metadata?.provider;
    if (provider === "google") return "Google";
    return "Email";
  };

  if (!isMounted) return null;

  if (!user && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/20">
            <Lock className="text-primary w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-text-primary mb-4 tracking-tight">
            Profile
          </h1>
          <p className="text-lg text-text-secondary mb-10 leading-relaxed font-medium">
            Sign in to view your profile.
          </p>
          <a href="/auth" className="btn-primary w-full py-4 text-center text-sm tracking-[0.2em]">
            SIGN IN
          </a>
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
            Loading Profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight text-text-primary uppercase">
          My <span className="text-primary italic">Profile</span>
        </h1>
        <p className="text-sm mt-1 text-text-secondary font-medium">
          Account information and financial overview
        </p>
      </div>

      {/* Identity Card */}
      <div className="card-lg flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Avatar */}
        <div className="relative shrink-0">
          {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
            <img
              src={profile?.avatar_url || user?.user_metadata?.avatar_url}
              alt="Avatar"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-primary/30"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
              <span className="text-2xl font-black text-primary">{getInitials()}</span>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-background" />
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3 w-full">
          {/* Name row */}
          <div className="flex items-center gap-3">
            {editingName ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") setEditingName(false);
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-secondary-medium/50 border border-primary text-text-primary text-lg font-black focus:outline-none"
                />
                <button
                  onClick={handleSaveName}
                  disabled={savingName}
                  className="p-1.5 rounded-lg bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-all"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  className="p-1.5 rounded-lg bg-secondary-medium/50 border border-border text-text-muted hover:text-error transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black text-text-primary">{getDisplayName()}</h2>
                <button
                  onClick={() => {
                    setNameInput(getDisplayName());
                    setEditingName(true);
                  }}
                  className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-text-muted" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-text-muted" />
              <span>
                Member since{" "}
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                  : new Date(user?.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
              {getAuthProvider()} Auth
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Financial Stats */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-4">
          Financial Overview
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 space-y-2">
            <div className="flex items-center gap-2 text-text-muted">
              <FileText className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Statements</span>
            </div>
            <p className="text-2xl font-black text-text-primary">{stats.totalStatements}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">Uploaded</p>
          </div>

          <div className="card p-5 space-y-2">
            <div className="flex items-center gap-2 text-text-muted">
              <Wallet className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Transactions</span>
            </div>
            <p className="text-2xl font-black text-text-primary">{stats.totalTransactions.toLocaleString()}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">Recorded</p>
          </div>

          <div className="card p-5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-500">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Income</span>
            </div>
            <p className="text-2xl font-black text-emerald-500">
              ₦{stats.totalIncome.toLocaleString()}
            </p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">All time</p>
          </div>

          <div className="card p-5 space-y-2">
            <div className="flex items-center gap-2 text-error">
              <TrendingDown className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Expenses</span>
            </div>
            <p className="text-2xl font-black text-error">
              ₦{stats.totalExpenses.toLocaleString()}
            </p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">All time</p>
          </div>
        </div>
      </div>

      {/* Net Balance + Tax */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Net Balance</p>
            <p className={`text-2xl font-black ${stats.netBalance >= 0 ? "text-emerald-500" : "text-error"}`}>
              {stats.netBalance < 0 ? "-" : ""}₦{Math.abs(stats.netBalance).toLocaleString()}
            </p>
            <p className="text-[10px] text-text-muted mt-1">Income minus expenses</p>
          </div>
        </div>

        <div className="card-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">
              {stats.latestTax ? `Tax ${stats.latestTax.tax_year}` : "Tax Estimate"}
            </p>
            {stats.latestTax ? (
              <>
                <p className="text-2xl font-black text-text-primary">
                  ₦{Number(stats.latestTax.estimated_tax).toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${
                    stats.latestTax.tax_status === "paid"
                      ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/10"
                      : stats.latestTax.tax_status === "filed"
                      ? "text-blue-500 border-blue-500/20 bg-blue-500/10"
                      : "text-yellow-500 border-yellow-500/20 bg-yellow-500/10"
                  }`}>
                    {stats.latestTax.tax_status}
                  </span>
                  <span className="text-[10px] text-text-muted">{stats.latestTax.effective_rate}% effective rate</span>
                </div>
              </>
            ) : (
              <p className="text-sm font-bold text-text-secondary">No tax data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
