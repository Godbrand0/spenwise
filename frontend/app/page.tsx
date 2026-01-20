'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ShieldCheck, 
  ArrowUpRight, 
  Plus,
  Filter,
  Download
} from 'lucide-react';
import { FinancialCard } from '@/components/FinancialCard';
import { TransactionTable } from '@/components/TransactionTable';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const mockChartData = [
  { name: 'Jan', income: 450000, expense: 320000 },
  { name: 'Feb', income: 520000, expense: 380000 },
  { name: 'Mar', income: 480000, expense: 410000 },
  { name: 'Apr', income: 610000, expense: 390000 },
  { name: 'May', income: 550000, expense: 420000 },
  { name: 'Jun', income: 670000, expense: 450000 },
];

const mockTransactions = [
  { id: '1', date: '2026-01-15', description: 'Shoprite Shopping', amount: 25000, type: 'debit' as const, category: 'Groceries' },
  { id: '2', date: '2026-01-16', description: 'Uber Ride', amount: 3500, type: 'debit' as const, category: 'Transport' },
  { id: '3', date: '2026-01-17', description: 'KFC Dinner', amount: 8500, type: 'debit' as const, category: 'Dining' },
  { id: '4', date: '2026-01-18', description: 'Salary Payment', amount: 500000, type: 'credit' as const, category: 'Salary' },
  { id: '5', date: '2026-01-19', description: 'Netflix Subscription', amount: 2900, type: 'debit' as const, category: 'Entertainment' },
];

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Financial Dashboard</h1>
          <p className="text-slate-400 text-sm">Welcome back. Here's your real-time financial status.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all">
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95">
            <Plus size={16} />
            <span>New Statement</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinancialCard 
          title="Total Balance" 
          value="₦1,240,500.00" 
          subValue="Across 3 connected accounts"
          icon={Wallet}
          trend={{ value: '12.5%', isPositive: true }}
        />
        <FinancialCard 
          title="Monthly Income" 
          value="₦670,000.00" 
          subValue="Projected for June 2026"
          icon={TrendingUp}
          trend={{ value: '8.2%', isPositive: true }}
        />
        <FinancialCard 
          title="Monthly Expenses" 
          value="₦450,000.00" 
          subValue="42% of total income"
          icon={TrendingDown}
          trend={{ value: '3.1%', isPositive: false }}
        />
        <FinancialCard 
          title="Tax Liability" 
          value="₦85,400.00" 
          subValue="Estimated for Q2 2026"
          icon={ShieldCheck}
          className="border-blue-500/20"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-6 rounded-3xl border border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white">Cash Flow Analysis</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expense</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                  tickFormatter={(value) => `₦${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl border border-white/5">
          <h3 className="text-lg font-bold text-white mb-6">Spending by Category</h3>
          <div className="space-y-6">
            {[
              { label: 'Groceries', value: 45, color: 'bg-blue-500' },
              { label: 'Transport', value: 25, color: 'bg-indigo-500' },
              { label: 'Entertainment', value: 15, color: 'bg-violet-500' },
              { label: 'Utilities', value: 10, color: 'bg-slate-500' },
              { label: 'Others', value: 5, color: 'bg-slate-700' },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>{item.label}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-1000`} 
                    style={{ width: `${item.value}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-widest transition-all">
            View Full Analysis
          </button>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white tracking-tight">Recent Activity</h3>
          <button className="text-blue-500 text-xs font-bold uppercase tracking-widest hover:text-blue-400 transition-colors flex items-center gap-1">
            <span>View All</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
        <TransactionTable transactions={mockTransactions} />
      </div>
    </div>
  );
}
