"use client";

import React, { useEffect, useState } from "react";
import {
  Settings,
  User,
  Bell,
  ShieldCheck,
  Trash2,
  Lock,
  Mail,
  Save,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { createBrowserClient } from "@/lib/database/client";

type Section = "account" | "notifications" | "tax" | "danger";

const SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "account", label: "Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "tax", label: "Tax Preferences", icon: ShieldCheck },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle },
];

const DEFAULT_PREFS = {
  emailTaxReminders: true,
  emailGoalReminders: true,
  emailWeeklySummary: false,
  defaultTaxPeriod: "annual",
  defaultTaxYear: new Date().getFullYear(),
  dateFormat: "DD/MM/YYYY",
};

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("account");

  // Account
  const [fullName, setFullName] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountMsg, setAccountMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Preferences (localStorage)
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsMsg, setPrefsMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Danger zone
  const [confirmDelete, setConfirmDelete] = useState("");

  const supabase = createBrowserClient();

  useEffect(() => {
    setIsMounted(true);
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUser(user);

      const { data: profileData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || user.user_metadata?.full_name || "");
      }

      // Load saved prefs from localStorage
      try {
        const saved = localStorage.getItem(`spenwise_prefs_${user.id}`);
        if (saved) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(saved) });
      } catch { /* ignore */ }

      setLoading(false);
    };
    init();
  }, []);

  const saveAccount = async () => {
    if (!user) return;
    setSavingAccount(true);
    setAccountMsg(null);
    const { error } = await supabase
      .from("users")
      .update({ full_name: fullName.trim(), updated_at: new Date().toISOString() })
      .eq("id", user.id);
    setSavingAccount(false);
    if (error) {
      setAccountMsg({ type: "error", text: "Failed to save. Please try again." });
    } else {
      setProfile((p: any) => ({ ...p, full_name: fullName.trim() }));
      setAccountMsg({ type: "success", text: "Account updated successfully." });
    }
    setTimeout(() => setAccountMsg(null), 3000);
  };

  const savePrefs = () => {
    if (!user) return;
    setSavingPrefs(true);
    try {
      localStorage.setItem(`spenwise_prefs_${user.id}`, JSON.stringify(prefs));
      setPrefsMsg({ type: "success", text: "Preferences saved." });
    } catch {
      setPrefsMsg({ type: "error", text: "Failed to save preferences." });
    }
    setSavingPrefs(false);
    setTimeout(() => setPrefsMsg(null), 3000);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleDeleteAccount = async () => {
    if (confirmDelete !== user?.email) return;
    // Sign out — actual deletion requires a server-side action with service role
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  const isGoogleUser = user?.app_metadata?.provider === "google";

  if (!isMounted) return null;

  if (!user && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/20">
            <Lock className="text-primary w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-text-primary mb-4 tracking-tight">Settings</h1>
          <p className="text-lg text-text-secondary mb-10 leading-relaxed font-medium">
            Sign in to manage your settings.
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
          <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-text-muted font-black text-xs uppercase tracking-[0.4em] animate-pulse">
            Loading Settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight text-text-primary uppercase">
          <span className="text-primary italic">Settings</span>
        </h1>
        <p className="text-sm mt-1 text-text-secondary font-medium">
          Manage your account and preferences
        </p>
      </div>

      <div className="flex flex-col md:flex-row  gap-6">
        {/* Sidebar nav */}
        <aside className="w-full md:w-52 shrink-0">
          <nav className="space-y-1">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeSection === id
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                } ${id === "danger" ? "mt-4 !text-error hover:!bg-error/10" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  {label}
                </div>
                <ChevronRight className="w-3 h-3 opacity-50" />
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 space-y-6">

          {/* ── Account ── */}
          {activeSection === "account" && (
            <div className="card-lg space-y-6">
              <h2 className="text-lg font-black uppercase tracking-widest text-text-primary">
                Account Settings
              </h2>

              {/* Display Name */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-text-muted">
                  Display Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl bg-secondary-medium/50 border border-border focus:border-primary focus:outline-none text-text-primary transition-colors"
                />
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-text-muted">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="email"
                    value={user?.email || ""}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary-medium/20 border border-border text-text-muted cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-text-muted">
                  {isGoogleUser
                    ? "Email is managed by Google and cannot be changed here."
                    : "Contact support to change your email address."}
                </p>
              </div>

              {/* Auth provider */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary-medium/30 border border-border">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  {isGoogleUser ? (
                    <span className="text-xs font-black text-primary">G</span>
                  ) : (
                    <Mail className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-black text-text-primary">
                    {isGoogleUser ? "Google Account" : "Email & Password"}
                  </p>
                  <p className="text-[10px] text-text-muted">
                    {isGoogleUser
                      ? "Authenticated via Google OAuth"
                      : "Authenticated with email and password"}
                  </p>
                </div>
              </div>

              {accountMsg && (
                <p className={`text-xs font-bold px-3 py-2 rounded-lg border ${
                  accountMsg.type === "success"
                    ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                    : "text-error bg-error/10 border-error/20"
                }`}>
                  {accountMsg.text}
                </p>
              )}

              <button
                onClick={saveAccount}
                disabled={savingAccount}
                className="btn-primary flex items-center gap-2 px-6 py-3 text-xs tracking-widest"
              >
                <Save className="w-4 h-4" />
                {savingAccount ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}

          {/* ── Notifications ── */}
          {activeSection === "notifications" && (
            <div className="card-lg space-y-6">
              <h2 className="text-lg font-black uppercase tracking-widest text-text-primary">
                Notification Preferences
              </h2>

              <div className="space-y-4">
                {[
                  {
                    key: "emailTaxReminders" as const,
                    label: "Tax Deadline Reminders",
                    desc: "Get emailed before your tax filing due date",
                  },
                  {
                    key: "emailGoalReminders" as const,
                    label: "Goal Due Date Reminders",
                    desc: "Get notified when a financial goal deadline is approaching",
                  },
                  {
                    key: "emailWeeklySummary" as const,
                    label: "Weekly Financial Summary",
                    desc: "Receive a weekly overview of your income and expenses",
                  },
                ].map(({ key, label, desc }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary-medium/20 hover:border-border/80 transition-all"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-text-primary">{label}</p>
                      <p className="text-[11px] text-text-muted">{desc}</p>
                    </div>
                    <button
                      onClick={() => setPrefs((p) => ({ ...p, [key]: !p[key] }))}
                      className={`relative w-11 h-6 rounded-full border transition-all duration-200 shrink-0 ${
                        prefs[key]
                          ? "bg-primary border-primary"
                          : "bg-secondary-medium border-border"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${
                          prefs[key] ? "left-5" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              {prefsMsg && (
                <p className={`text-xs font-bold px-3 py-2 rounded-lg border ${
                  prefsMsg.type === "success"
                    ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                    : "text-error bg-error/10 border-error/20"
                }`}>
                  {prefsMsg.text}
                </p>
              )}

              <button
                onClick={savePrefs}
                disabled={savingPrefs}
                className="btn-primary flex items-center gap-2 px-6 py-3 text-xs tracking-widest"
              >
                <Save className="w-4 h-4" />
                {savingPrefs ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          )}

          {/* ── Tax Preferences ── */}
          {activeSection === "tax" && (
            <div className="card-lg space-y-6">
              <h2 className="text-lg font-black uppercase tracking-widest text-text-primary">
                Tax Preferences
              </h2>
              <p className="text-xs text-text-muted">
                These preferences set defaults when calculating and viewing your tax estimates.
              </p>

              <div className="space-y-4">
                {/* Default Tax Period */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-text-muted">
                    Default Tax Period
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["annual", "quarterly", "monthly"].map((period) => (
                      <button
                        key={period}
                        onClick={() => setPrefs((p) => ({ ...p, defaultTaxPeriod: period }))}
                        className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                          prefs.defaultTaxPeriod === period
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-secondary-medium/20 border-border text-text-muted hover:border-border/80"
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Default Tax Year */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-text-muted">
                    Default Tax Year
                  </label>
                  <select
                    value={prefs.defaultTaxYear}
                    onChange={(e) => setPrefs((p) => ({ ...p, defaultTaxYear: Number(e.target.value) }))}
                    className="w-full px-4 py-3 rounded-xl bg-secondary-medium/50 border border-border focus:border-primary focus:outline-none text-text-primary transition-colors"
                  >
                    {[2024, 2025, 2026].map((yr) => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>

                {/* Date Format */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-text-muted">
                    Date Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["DD/MM/YYYY", "MM/DD/YYYY"].map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setPrefs((p) => ({ ...p, dateFormat: fmt }))}
                        className={`py-3 rounded-xl text-xs font-black tracking-widest border transition-all ${
                          prefs.dateFormat === fmt
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-secondary-medium/20 border-border text-text-muted hover:border-border/80"
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">
                  Nigerian Tax System
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Spenwise uses the Nigerian PITA tax brackets with a ₦800,000
                  exemption threshold and a maximum 25% effective rate.
                </p>
              </div>

              {prefsMsg && (
                <p className={`text-xs font-bold px-3 py-2 rounded-lg border ${
                  prefsMsg.type === "success"
                    ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                    : "text-error bg-error/10 border-error/20"
                }`}>
                  {prefsMsg.text}
                </p>
              )}

              <button
                onClick={savePrefs}
                disabled={savingPrefs}
                className="btn-primary flex items-center gap-2 px-6 py-3 text-xs tracking-widest"
              >
                <Save className="w-4 h-4" />
                {savingPrefs ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          )}

          {/* ── Danger Zone ── */}
          {activeSection === "danger" && (
            <div className="space-y-4">
              {/* Sign out all */}
              <div className="card-lg border-border space-y-4">
                <h2 className="text-lg font-black uppercase tracking-widest text-text-primary">
                  Session
                </h2>
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary-medium/20 border border-border">
                  <div>
                    <p className="text-sm font-bold text-text-primary">Sign Out</p>
                    <p className="text-[11px] text-text-muted">End your current session</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 rounded-xl bg-secondary-medium border border-border text-sm font-bold text-text-secondary hover:text-error hover:border-error/30 hover:bg-error/10 transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              </div>

              {/* Delete account */}
              <div className="card-lg border-error/20 bg-error/5 space-y-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-error" />
                  <h2 className="text-lg font-black uppercase tracking-widest text-error">
                    Danger Zone
                  </h2>
                </div>

                <div className="p-4 rounded-xl bg-error/5 border border-error/10 space-y-4">
                  <div>
                    <p className="text-sm font-bold text-text-primary">Delete Account</p>
                    <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                      Permanently deletes your account, all statements, transactions,
                      tax records, and goals. This action cannot be undone.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                      Type your email to confirm: <span className="text-error">{user?.email}</span>
                    </label>
                    <input
                      type="email"
                      value={confirmDelete}
                      onChange={(e) => setConfirmDelete(e.target.value)}
                      placeholder={user?.email}
                      className="w-full px-4 py-3 rounded-xl bg-secondary-medium/50 border border-error/30 focus:border-error focus:outline-none text-text-primary transition-colors"
                    />
                  </div>

                  <button
                    onClick={handleDeleteAccount}
                    disabled={confirmDelete !== user?.email}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-error border border-error/30 bg-error/10 hover:bg-error/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete My Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
