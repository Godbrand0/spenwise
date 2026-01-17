'use client';

import React, { useState } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

type AuthView = 'login' | 'signup' | 'forgot-password';

export default function AuthPage() {
  const [view, setView] = useState<AuthView>('login');

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
                New Operative?{' '}
                <button
                  onClick={() => setView('signup')}
                  className="text-[#00ff00] hover:underline"
                >
                  Register Here
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
                Already Registered?{' '}
                <button
                  onClick={() => setView('login')}
                  className="text-[#00ff00] hover:underline"
                >
                  Initialize Session
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
        return 'Mission Control Login';
      case 'signup':
        return 'Operative Registration';
      case 'forgot-password':
        return 'Access Recovery';
    }
  };

  const getSubtitle = () => {
    switch (view) {
      case 'login':
        return 'Secure Uplink Established';
      case 'signup':
        return 'Join the Spenwise Network';
      case 'forgot-password':
        return 'Emergency Protocol Initiated';
    }
  };

  return (
    <AuthLayout title={getTitle()} subtitle={getSubtitle()}>
      {renderView()}
    </AuthLayout>
  );
}
