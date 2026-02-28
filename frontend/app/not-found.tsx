'use client';

import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    // Add a subtle animation on mount
    const timer = setTimeout(() => {
      document.body.classList.add('animate-fade-in');
    }, 100);
    
    return () => {
      clearTimeout(timer);
      document.body.classList.remove('animate-fade-in');
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] -right-[10%] w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full" />
      </div>
      
      <div className="relative z-10 text-center  space-y-8">
        {/* 404 Icon */}
        <div className="relative">
          <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto border border-primary/20 mb-6">
            <span className="text-5xl font-black text-primary">404</span>
          </div>
          
        </div>
        
        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-black text-white uppercase tracking-wider">
            Page Not Found
          </h1>
          <p className="text-base text-text-secondary leading-relaxed">
            The page you're looking for seems to have vanished into the digital void. 
            It might have been moved, deleted, or never existed in the first place.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 btn-primary px-8 py-3 text-xs tracking-[0.2em] uppercase font-black"
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <Link
            href="/statements"
            className="inline-flex items-center justify-center gap-2 btn-secondary px-8 py-3 text-xs tracking-[0.2em] uppercase font-black"
          >
            <Search className="w-4 h-4" />
            Browse Statements
          </Link>
        </div>
        
        {/* Helpful Links */}
        <div className="pt-6 border-t border-border/50">
          <p className="text-xs text-text-muted mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/analysis" className="text-xs text-primary hover:text-primary-light transition-colors">
              Financial Analysis
            </Link>
            <span className="text-xs text-text-muted">•</span>
            <Link href="/tax" className="text-xs text-primary hover:text-primary-light transition-colors">
              Tax Calculator
            </Link>
            <span className="text-xs text-text-muted">•</span>
            <Link href="/todos" className="text-xs text-primary hover:text-primary-light transition-colors">
              Financial Tasks
            </Link>
            <span className="text-xs text-text-muted">•</span>
            <Link href="/settings" className="text-xs text-primary hover:text-primary-light transition-colors">
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}