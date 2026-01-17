import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4 font-mono">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tighter text-[#00ff00] mb-2 uppercase">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-400 text-sm uppercase tracking-widest">
              {subtitle}
            </p>
          )}
        </div>
        
        <div className="bg-[#111] border border-[#333] p-8 rounded-lg shadow-2xl relative overflow-hidden">
          {/* Decorative elements for "Mission Control" feel */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#00ff00]"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00ff00]"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#00ff00]"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#00ff00]"></div>
          
          <div className="relative z-10">
            {children}
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-gray-600 uppercase tracking-widest">
          Spenwise Security Protocol v1.0.4
        </div>
      </div>
    </div>
  );
};
