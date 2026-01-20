'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { UserPlus, Mail, Lock, Chrome, ShieldCheck } from 'lucide-react';

export const SignupForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'signup' | 'verify'>('signup');
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setView('verify');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup',
    });

    if (error) {
      setError(error.message);
    } else {
      window.location.href = '/';
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    }
  };

  if (view === 'verify') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 mx-auto mb-4">
            <ShieldCheck className="text-blue-500 w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Verify Your Email</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            We've sent a 6-digit code to <span className="text-white font-medium">{email}</span>.
            Enter it below to complete your registration.
          </p>
        </div>

        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Verification Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-4 text-center text-2xl font-bold tracking-[0.5em] text-white focus:border-blue-500 outline-none transition-all placeholder:text-white/5"
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
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setView('signup')}
            className="text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors"
          >
            Back to Signup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-3 pl-12 text-sm text-white focus:border-blue-500 outline-none transition-all"
              placeholder="name@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-3 pl-12 text-sm text-white focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {error && (
          <div className="text-rose-500 text-[10px] font-bold uppercase tracking-wider text-center border border-rose-500/20 bg-rose-500/5 p-3 rounded-xl">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:shadow-none"
        >
          <UserPlus className="w-4 h-4" />
          {loading ? 'Processing...' : 'Create Account'}
        </button>
      </form>

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-white/5"></div>
        <span className="flex-shrink mx-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">OR</span>
        <div className="flex-grow border-t border-white/5"></div>
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 transition-all shadow-lg shadow-white/5"
      >
        <Chrome className="w-4 h-4" />
        Continue with Google
      </button>
    </div>
  );
};
