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
  icons: {

  },
};

import { DashboardLayout } from "@/components/DashboardLayout";
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
          {user ? (
            <DashboardLayout user={user}>
              {children}
            </DashboardLayout>
          ) : (
            <div className="min-h-screen bg-background">
              {children}
            </div>
          )}
        </StoreProvider>
      </body>
    </html>
  );
}
