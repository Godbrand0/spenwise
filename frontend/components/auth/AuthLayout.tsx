import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] -right-[10%] w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-10 text-center space-y-2">
          <div className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-primary/20 mb-6">
            <span className="text-2xl font-black text-white italic">S</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-text-primary">
            {title}
          </h1>
          {subtitle && (
            <p className="text-text-secondary text-sm font-medium">
              {subtitle}
            </p>
          )}
        </div>
        
        <div className="card-lg bg-surface relative overflow-hidden shadow-2xl shadow-primary/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          
          <div className="relative z-10">
            {children}
          </div>
        </div>
        
        <div className="mt-10 text-center">
          <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.4em] opacity-40">
            Spenwise Financial Systems • Secure Terminal
          </p>
        </div>
      </div>
    </div>
  );
};
