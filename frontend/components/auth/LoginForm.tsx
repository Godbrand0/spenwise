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
      window.location.href = '/upload';
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
    <div className="space-y-6">
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs uppercase text-gray-400 mb-1 ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00ff00]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 pl-10 text-sm focus:border-[#00ff00] outline-none transition-colors"
              placeholder="user@spenwise.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase text-gray-400 mb-1 ml-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00ff00]" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 pl-10 text-sm focus:border-[#00ff00] outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-xs uppercase text-center border border-red-500/30 bg-red-500/10 p-2 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#00ff00] text-black font-bold py-2 rounded uppercase text-sm flex items-center justify-center gap-2 hover:bg-[#00cc00] transition-colors disabled:opacity-50"
        >
          <LogIn className="w-4 h-4" />
          {loading ? 'Processing...' : 'Initialize Session'}
        </button>
      </form>

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-[#333]"></div>
        <span className="flex-shrink mx-4 text-xs text-gray-500 uppercase">OR</span>
        <div className="flex-grow border-t border-[#333]"></div>
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full bg-white text-black font-bold py-2 rounded uppercase text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
      >
        <Chrome className="w-4 h-4" />
        Continue with Google
      </button>
    </div>
  );
};
