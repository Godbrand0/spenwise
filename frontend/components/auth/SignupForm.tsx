'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { UserPlus, Mail, Lock, Chrome } from 'lucide-react';

export const SignupForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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
      setSuccess(true);
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

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="text-[#00ff00] text-sm uppercase font-bold">Registration Initiated</div>
        <p className="text-gray-400 text-xs uppercase tracking-widest leading-relaxed">
          Verification link sent to <span className="text-white">{email}</span>. 
          Please check your uplink to complete registration.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-[#00ff00] text-xs uppercase hover:underline"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSignup} className="space-y-4">
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
          <UserPlus className="w-4 h-4" />
          {loading ? 'Processing...' : 'Create Account'}
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
