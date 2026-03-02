'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  X,
  LayoutDashboard, 
  UploadCloud, 
  PieChart, 
  Receipt, 
  Target, 
  Settings, 
  LogOut,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { navLinks } from '@/constants/navigation';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 w-80 bg-background border-r border-border z-[60] flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo & Close Button (Mobile) */}
        <div className="p-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-lg shadow-primary/20 bg-primary overflow-hidden">
              <img src="/logo.png" alt="Spenwise Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg tracking-tight leading-tight">Spenwise</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary">Personal Finance</span>
            </div>
          </Link>
          
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-text-muted hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onClose?.()}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative ${
                  isActive 
                    ? 'text-white bg-primary/10 border border-primary/20' 
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                )}
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-white'}`} />
                <span className="font-semibold text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* AI Assistant Card */}
        <div className="px-4 mb-6">
          <div className="rounded-2xl p-4 border border-border bg-secondary-medium/50 backdrop-blur-sm group cursor-pointer hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-inner bg-primary">
                AI
              </div>
              <div>
                <p className="text-xs font-bold text-white">AI Assistant</p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] text-emerald-500 font-medium">Online</p>
                </div>
              </div>
            </div>
            <p className="text-[11px] leading-relaxed text-text-secondary group-hover:text-text-primary transition-colors">
              Upload statements for instant financial insights and tax optimization.
            </p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 space-y-1 border-t border-border">
          <Link
            href="/settings"
            onClick={() => onClose?.()}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm text-text-secondary hover:text-white hover:bg-white/5"
          >
            <Settings className="w-5 h-5" />
            <span className="font-semibold">Settings</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm text-error/80 hover:text-error hover:bg-error/10"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
