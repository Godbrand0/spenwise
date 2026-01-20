'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  UploadCloud, 
  PieChart, 
  Receipt, 
  Target, 
  Settings, 
  LogOut,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { createClient } from '@/lib/supabase';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Upload', href: '/upload', icon: UploadCloud },
  { name: 'Analysis', href: '/analysis', icon: PieChart },
  { name: 'Tax Estimates', href: '/tax', icon: ShieldCheck },
  { name: 'Goals', href: '/todos', icon: Target },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0a0f1a] border-r border-white/5 flex flex-col z-50">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <span className="text-white font-black text-2xl">S</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold tracking-tight text-lg">SPENWISE</span>
            <span className="text-blue-500 text-[10px] font-black tracking-[0.2em] uppercase">Pro Edition</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-500' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : 'group-hover:text-white'}`} />
                <span className="font-medium text-sm">{item.name}</span>
              </div>
              {isActive && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-white/5 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold">
              AI
            </div>
            <span className="text-xs font-semibold text-white">AI Assistant</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Upload a statement to get real-time financial insights.
          </p>
        </div>

        <div className="space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all text-sm"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
