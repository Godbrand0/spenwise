"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import {
  UserPlus,
  Mail,
  Lock,
  Chrome,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/Input";

export const SignupForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"signup" | "verify">("signup");
  const [resendTimer, setResendTimer] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("Attempting signup with email:", email);
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          firstName: firstName || email.split("@")[0],
        }),
      });

      const data = await response.json();

      if (data.success || response.ok) {
        console.log("Signup successful, switching to verify view");
        setView("verify");
        setResendTimer(60); // 60 second cooldown
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (err) {
      console.error("Network error during signup:", err);
      setError("An unexpected error occurred. Please try again.");
    }

    setLoading(false);
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          firstName: firstName || email.split("@")[0],
        }),
      });

      const data = await response.json();

      if (data.success || response.ok) {
        setResendTimer(60);
        console.log("OTP Resent successfully");
      } else {
        setError(data.error || "Failed to resend code");
      }
    } catch (err) {
      setError("Failed to resend verification code.");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("Attempting OTP verification with:", {
        email,
        otp: otp ? "***" : null,
        hasPassword: !!password,
        firstName: firstName || email.split("@")[0],
      });

      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
          password,
          firstName: firstName || email.split("@")[0],
        }),
      });

      console.log("OTP verification response status:", response.status);
      const data = await response.json();
      console.log("OTP verification response data:", data);

      if (!response.ok) {
        console.error("OTP verification failed:", data.error);
        console.error("Error details:", data.details);
        setError(data.error || "Verification failed");
      } else {
        // Verification successful
        if (data.session) {
          // User is automatically signed in
          console.log("User signed in successfully");
          window.location.href = "/";
        } else if (data.requiresSignIn) {
          // Need to sign in manually
          const { error: signInError } = await supabase.auth.signInWithPassword(
            {
              email,
              password,
            },
          );

          if (signInError) {
            setError(
              "Verification successful but sign-in failed. Please try logging in manually.",
            );
            console.error("Sign-in error:", signInError);
          } else {
            // Successfully signed in, redirect to home
            window.location.href = "/";
          }
        } else {
          // Verification successful, redirect to sign in page
          window.location.href = "/auth";
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Verification error:", err);
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

  if (view === "verify") {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center border border-success/20 mx-auto mb-6 shadow-xl shadow-success/10">
            <ShieldCheck className="text-success w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-text-primary">
            Verify Your Identity
          </h3>
          <p className="text-text-secondary text-sm leading-relaxed">
            A 6-digit verification code has been dispatched to{" "}
            <span className="text-primary font-bold">{email}</span>.
          </p>
        </div>

        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 ml-1">
              Verification Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="w-full bg-secondary-medium/50 border border-border rounded-xl p-4 text-center text-3xl font-black tracking-[0.5em] text-text-primary focus:border-primary outline-none transition-all placeholder:text-text-muted/20"
              placeholder="000000"
              required
            />
          </div>

          {error && (
            <div className="text-rose-500 text-[10px] font-bold uppercase tracking-wider text-center border border-rose-500/20 bg-rose-500/5 p-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="btn-primary w-full py-4 uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2"
          >
            {loading ? "Verifying..." : "Confirm Protocol"}
          </button>
        </form>

        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleResendOtp}
            disabled={loading || resendTimer > 0}
            className="flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-widest hover:text-primary-light transition-colors disabled:text-text-muted"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            {resendTimer > 0
              ? `Resend Code in ${resendTimer}s`
              : "Resend Verification Code"}
          </button>

          <button
            onClick={() => setView("signup")}
            className="text-text-muted text-[10px] font-bold uppercase tracking-widest hover:text-text-primary transition-colors"
          >
            Change Email Identity
          </button>
        </div>
      </div>
    );
  }also

  return (
    <div className="space-y-6 animate-fade-in">
      <form onSubmit={handleSignup} className="space-y-4">
        <Input
          label="Email Address"
          icon={<Mail className="w-4 h-4" />}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          required
        />

        <Input
          label="First Name (Optional)"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="John"
        />

        <Input
          label="Password"
          icon={<Lock className="w-4 h-4" />}
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
          <UserPlus className="w-4 h-4" />
          {loading ? "Processing..." : "Create Account"}
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
