'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const DashboardLayout = ({ children, user }: { children: React.ReactNode, user: any }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Sidebar - Desktop and Mobile Drawer */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar onMenuToggle={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 relative overflow-y-auto pt-24 pb-12">
          {/* Background Glow */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-[20%] -right-[10%] w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full" />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
