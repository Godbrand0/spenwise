import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpendWise AI - Intelligent Financial Management",
  description: "Automatically extract transactions from bank statements, get AI-powered insights, and estimate tax obligations for Nigerian users.",
};

import { Sidebar } from "@/components/Sidebar";
import { createServerClient } from "@/lib/database/client";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#05070a] text-slate-200`}
      >
        <div className="flex min-h-screen">
          {user && <Sidebar />}
          <main className={`flex-1 ${user ? 'ml-64' : ''} min-h-screen relative`}>
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
              <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
              <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full" />
            </div>
            
            <div className="relative z-10">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
