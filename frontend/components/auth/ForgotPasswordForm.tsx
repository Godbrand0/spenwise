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
      <div className="text-center space-y-4">
        <div className="text-[#00ff00] text-sm uppercase font-bold">Reset Link Sent</div>
        <p className="text-gray-400 text-xs uppercase tracking-widest leading-relaxed">
          A password reset link has been sent to <span className="text-white">{email}</span>. 
          Please check your uplink.
        </p>
        <button
          onClick={onBack}
          className="text-[#00ff00] text-xs uppercase hover:underline flex items-center justify-center gap-2 w-full mt-4"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleReset} className="space-y-4">
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
          <KeyRound className="w-4 h-4" />
          {loading ? 'Processing...' : 'Request Reset'}
        </button>
      </form>

      <button
        onClick={onBack}
        className="text-gray-500 text-xs uppercase hover:text-white transition-colors flex items-center justify-center gap-2 w-full"
      >
        <ArrowLeft className="w-3 h-3" />
        Back to Login
      </button>
    </div>
  );
};
