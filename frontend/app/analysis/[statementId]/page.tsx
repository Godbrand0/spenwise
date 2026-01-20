'use client';

import React, { useEffect, useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  ArrowLeft,
  Download,
  Share2,
  Printer
} from 'lucide-react';
import Link from 'next/link';
import { FinancialCard } from '@/components/FinancialCard';
import { TransactionTable } from '@/components/TransactionTable';

const COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F59E0B', '#10B981', '#06B6D4'];

export default function AnalysisPage({ params }: { params: { statementId: string } }) {
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (!isMounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070a]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">Generating Report...</p>
        </div>
      </div>
    );
  }

  const mockTransactions = [
    { id: '1', date: '2026-01-15', description: 'Shoprite Shopping', amount: 25000, type: 'debit' as const, category: 'Groceries' },
    { id: '2', date: '2026-01-16', description: 'Uber Ride', amount: 3500, type: 'debit' as const, category: 'Transport' },
    { id: '3', date: '2026-01-17', description: 'KFC Dinner', amount: 8500, type: 'debit' as const, category: 'Dining' },
    { id: '4', date: '2026-01-18', description: 'Salary Payment', amount: 500000, type: 'credit' as const, category: 'Salary' },
    { id: '5', date: '2026-01-19', description: 'Netflix Subscription', amount: 2900, type: 'debit' as const, category: 'Entertainment' },
  ];

  const categoryData = [
    { name: 'Groceries', value: 45000 },
    { name: 'Transport', value: 12000 },
    { name: 'Dining', value: 28000 },
    { name: 'Utilities', value: 35000 },
    { name: 'Rent', value: 150000 },
  ];

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Navigation & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Statement Analysis</h1>
            <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">ID: {params.statementId.slice(0, 8)}... • GTBank Statement • May 2026</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white">
            <Share2 size={18} />
          </button>
          <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white">
            <Printer size={18} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all">
            <Download size={16} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinancialCard 
          title="Total Outflow" 
          value="₦270,400.00" 
          icon={TrendingDown}
          trend={{ value: '14%', isPositive: false }}
        />
        <FinancialCard 
          title="Total Inflow" 
          value="₦500,000.00" 
          icon={TrendingUp}
          trend={{ value: '5%', isPositive: true }}
        />
        <FinancialCard 
          title="Net Savings" 
          value="₦229,600.00" 
          icon={Target}
          trend={{ value: '45.9%', isPositive: true }}
        />
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-8 rounded-3xl border border-white/5">
          <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
            <div className="w-1 h-4 bg-blue-500 rounded-full" />
            Spending Distribution
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.05)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.name}</span>
                  <span className="text-sm font-bold text-white">₦{item.value.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-8 rounded-3xl border border-white/5">
          <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
            <div className="w-1 h-4 bg-indigo-500 rounded-full" />
            Daily Transaction Volume
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Target className="text-blue-500 w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">AI Insight</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your housing expenses account for 55% of your total outflow. Consider optimizing your utility usage to increase your net savings potential by 5.2%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Log */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white tracking-tight">Extracted Transactions</h3>
        <TransactionTable transactions={mockTransactions} />
      </div>
    </div>
  );
}