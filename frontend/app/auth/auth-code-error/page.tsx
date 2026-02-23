'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6">
      <div className="text-center max-w-md space-y-6">
        <div className="w-16 h-16 bg-error/10 rounded-2xl flex items-center justify-center mx-auto border border-error/20">
          <AlertTriangle className="w-8 h-8 text-error" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">
            Authentication Failed
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            We were unable to complete the sign-in process. This can happen if
            the link expired or there was a configuration issue.
          </p>
        </div>
        <Link
          href="/auth"
          className="inline-block btn-primary px-8 py-3 text-xs tracking-[0.2em] uppercase"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}
