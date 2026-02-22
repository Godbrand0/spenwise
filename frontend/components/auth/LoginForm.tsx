"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase";
import { LogIn, Mail, Lock, Chrome } from "lucide-react";
import { Input } from "@/components/ui/Input";

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      window.location.href = "/";
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full">
      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          label="Email Address"
          icon={<Mail className="w-4 h-4 text-primary" />}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          required
        />

        <Input
          label="Password"
          icon={<Lock className="w-4 h-4 text-primary" />}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        {error && (
          <div className="text-error text-[10px] font-bold uppercase tracking-wider text-center border border-error/20 bg-error/5 p-3 rounded-xl">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-4 uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          {loading ? "Processing..." : "Secure Entry"}
        </button>
      </form>

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-white/5"></div>
        <span className="flex-shrink mx-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">
          OR
        </span>
        <div className="flex-grow border-t border-white/5"></div>
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full bg-white text-secondary font-bold py-3 rounded-xl uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 transition-all shadow-lg shadow-white/5"
      >
        <Chrome className="w-4 h-4" />
        Authenticate with Google
      </button>
    </div>
  );
};
