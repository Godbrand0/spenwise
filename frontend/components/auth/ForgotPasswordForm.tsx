'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { KeyRound, Mail, ArrowLeft } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center space-y-4 animate-fade-in">
        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 mx-auto mb-4">
          <Mail className="text-blue-500 w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Reset Link Sent</h3>
        <p className="text-slate-400 text-xs leading-relaxed">
          A password reset link has been sent to <span className="text-white font-medium">{email}</span>. 
          Please check your inbox.
        </p>
        <button
          onClick={onBack}
          className="text-blue-500 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2 w-full mt-6"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <form onSubmit={handleReset} className="space-y-4">
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
          <KeyRound className="w-4 h-4" />
          {loading ? 'Processing...' : 'Request Reset'}
        </button>
      </form>

      <button
        onClick={onBack}
        className="text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2 w-full"
      >
        <ArrowLeft className="w-3 h-3" />
        Back to Login
      </button>
    </div>
  );
};
