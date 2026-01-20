'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { LogIn, Mail, Lock, Chrome } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <div className="space-y-6 animate-fade-in">
      <form onSubmit={handleLogin} className="space-y-4">
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
          <LogIn className="w-4 h-4" />
          {loading ? 'Processing...' : 'Sign In'}
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
