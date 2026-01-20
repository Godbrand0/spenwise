'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { useSearchParams } from 'next/navigation';

type AuthView = 'login' | 'signup' | 'forgot-password';

function AuthContent() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<AuthView>('login');

  useEffect(() => {
    const viewParam = searchParams.get('view') as AuthView;
    if (viewParam && ['login', 'signup', 'forgot-password'].includes(viewParam)) {
      setView(viewParam);
    }
  }, [searchParams]);

  const renderView = () => {
    switch (view) {
      case 'login':
        return (
          <div className="space-y-6">
            <LoginForm />
            <div className="text-center space-y-2">
              <button
                onClick={() => setView('forgot-password')}
                className="text-xs text-gray-500 uppercase hover:text-[#00ff00] transition-colors"
              >
                Forgot Access Key?
              </button>
              <div className="text-xs text-gray-500 uppercase">
                New to Spenwise?{' '}
                <button
                  onClick={() => setView('signup')}
                  className="text-blue-500 hover:underline"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        );
      case 'signup':
        return (
          <div className="space-y-6">
            <SignupForm />
            <div className="text-center">
              <div className="text-xs text-gray-500 uppercase">
                Already have an account?{' '}
                <button
                  onClick={() => setView('login')}
                  className="text-blue-500 hover:underline"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        );
      case 'forgot-password':
        return <ForgotPasswordForm onBack={() => setView('login')} />;
    }
  };

  const getTitle = () => {
    switch (view) {
      case 'login':
        return 'Welcome Back';
      case 'signup':
        return 'Create Account';
      case 'forgot-password':
        return 'Reset Password';
    }
  };

  const getSubtitle = () => {
    switch (view) {
      case 'login':
        return 'Sign in to manage your finances';
      case 'signup':
        return 'Join Spenwise for intelligent financial management';
      case 'forgot-password':
        return 'We will send you a recovery link';
    }
  };

  return (
    <AuthLayout title={getTitle()} subtitle={getSubtitle()}>
      {renderView()}
    </AuthLayout>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
        <div className="text-blue-500 font-mono animate-pulse uppercase tracking-widest">
          Loading...
        </div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
