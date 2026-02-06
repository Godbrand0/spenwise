'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { User, LogOut, Menu, X, Bell, LayoutDashboard, FileText, BarChart2, Upload, Receipt, Settings, Target } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const navLinks = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Statements', href: '/statements', icon: FileText },
    { name: 'Analysis', href: '/analysis', icon: BarChart2 },
    { name: 'Import', href: '/upload', icon: Upload },
    { name: 'Tax', href: '/tax', icon: Receipt },
    { name: 'Goals', href: '/todos', icon: Target },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-background/95 backdrop-blur-xl border-b border-border py-3 shadow-2xl shadow-primary/10' 
        : 'bg-background/80 backdrop-blur-md border-b border-border/30 py-4 shadow-lg shadow-black/20'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
              <span className="text-white font-black text-xl italic leading-none">S</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-text-primary hidden sm:block">
              SPEN<span className="text-primary italic">WISE</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center text-slate-100 backdrop-blur-sm border border-border/50 rounded-2xl px-2 py-1.5">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                    active
                      ? 'bg-white text-white shadow-lg shadow-primary/20'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  <link.icon className={`w-3.5 h-3.5 ${active ? 'text-secondary' : 'text-slate-100'}`} />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <button className="hidden sm:flex text-text-muted hover:text-primary transition-colors p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-secondary-medium/50 relative group">
                  <Bell className="w-5 h-5 transition-transform group-hover:rotate-12" />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse"></span>
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 pl-1 pr-3 py-1 bg-secondary-medium/50 border border-border rounded-2xl hover:border-primary/50 transition-all group"
                  >
                    <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-tighter leading-none mb-0.5">Operative</p>
                      <p className="text-xs font-bold text-text-primary truncate max-w-[100px] leading-none">
                        {user.email?.split('@')[0]}
                      </p>
                    </div>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-surface border border-border rounded-2xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="px-4 py-3 border-b border-border mb-2">
                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Authorized Access</p>
                        <p className="text-sm font-bold text-text-primary truncate">{user.email}</p>
                      </div>
                      <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-text-secondary hover:bg-primary/10 hover:text-primary transition-all">
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-error hover:bg-error/10 transition-all border-t border-border mt-2 pt-3"
                      >
                        <LogOut className="w-4 h-4" /> Terminate Session
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/auth?view=login"
                  className="text-xs font-black uppercase tracking-[0.2em] text-text-secondary hover:text-primary transition-all hidden sm:block"
                >
                  Login
                </Link>
                <Link
                  href="/auth?view=signup"
                  className="btn-primary px-6 py-2.5 text-xs tracking-widest"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 text-text-muted hover:text-primary bg-secondary-medium/50 border border-border rounded-xl transition-all"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[73px] bg-background/95 backdrop-blur-2xl z-40 p-6 animate-in slide-in-from-right-full duration-500">
          <div className="space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-4 px-6 py-5 rounded-2xl text-base font-black uppercase tracking-[0.2em] border-2 transition-all ${
                  isActive(link.href)
                    ? 'bg-primary/10 border-primary text-primary shadow-xl shadow-primary/10'
                    : 'bg-secondary-medium/50 border-transparent text-text-secondary'
                }`}
              >
                <link.icon className={`w-6 h-6 ${isActive(link.href) ? 'text-primary' : ''}`} />
                {link.name}
              </Link>
            ))}
          </div>
          
          {!user && (
            <div className="mt-10 pt-10 border-t border-border space-y-4">
              <Link
                href="/auth?view=login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center p-5 rounded-2xl border-2 border-border text-text-primary font-black uppercase tracking-[0.2em]"
              >
                Sign In
              </Link>
              <Link
                href="/auth?view=signup"
                onClick={() => setIsMenuOpen(false)}
                className="btn-primary w-full p-5 text-base tracking-[0.2em]"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
