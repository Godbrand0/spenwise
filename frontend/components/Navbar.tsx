'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { User, LogOut, Menu, X, ChevronDown, Bell, Settings } from 'lucide-react';

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
      setScrolled(window.scrollY > 20);
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
    { name: 'Dashboard', href: '/' },
    { name: 'Upload', href: '/upload' },
    { name: 'Analysis', href: '/analysis' },
    { name: 'Tax Estimates', href: '/tax' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className={`text-2xl font-black tracking-tighter ${
                scrolled ? 'text-gray-900' : 'text-blue-900'
              }`}>
                SPEN<span className="text-blue-600">WISER</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium uppercase tracking-wider transition-colors ${
                  isActive(link.href)
                    ? 'text-blue-600'
                    : scrolled ? 'text-gray-600 hover:text-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center border border-blue-200">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-gray-50 mb-2">
                        <p className="text-xs text-gray-400 uppercase font-bold">Operative</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                      </div>
                      <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors mt-2 pt-2 border-t border-gray-50"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth?view=login"
                  className="text-sm font-bold uppercase text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth?view=signup"
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold uppercase tracking-wide hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-200 active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-2 animate-in slide-in-from-top-5">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg text-base font-medium ${
                isActive(link.href)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {!user && (
            <div className="pt-4 grid grid-cols-2 gap-3 border-t border-gray-50 mt-4">
              <Link
                href="/auth?view=login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center px-4 py-3 rounded-lg border border-gray-200 text-gray-700 font-bold uppercase text-sm"
              >
                Login
              </Link>
              <Link
                href="/auth?view=signup"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center px-4 py-3 rounded-lg bg-blue-600 text-white font-bold uppercase text-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
