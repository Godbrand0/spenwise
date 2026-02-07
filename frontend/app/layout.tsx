import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/components/providers/StoreProvider";

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
import { Navbar } from "@/components/Navbar";
import { createServerClient } from "@/lib/database/server";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StoreProvider>
          <div className="min-h-screen bg-background flex flex-col">
            {user && <Navbar />}
            <main className={`flex-1 relative overflow-x-hidden ${user ? 'pt-24' : 'pt-0'} pb-12`}>
              {/* Background Glow - More subtle and professional */}
              <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[20%] -right-[10%] w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full" />
              </div>
              
              <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
                {children}
              </div>
            </main>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
