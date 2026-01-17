'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatNaira } from '../../../lib/tax/calculator';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category?: string;
  is_income: boolean;
}

interface CategoryData {
  category: string;
  amount: number;
  count: number;
  [key: string]: string | number | undefined;
}

interface TrendData {
  month: string;
  amount: number;
  category: string;
  [key: string]: string | number | undefined;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export default function AnalysisPage({ params }: { params: { statementId: string } }) {
  const [data, setData] = useState<{
    transactions: Transaction[];
    categoryData: CategoryData[];
    totalSpending: number;
    totalIncome: number;
    topCategory: string;
    savingsPotential: number;
  } | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Mock data for now - in real app, fetch from API
    const mockTransactions: Transaction[] = [
      { id: '1', date: '2026-01-15', description: 'Shoprite Shopping', amount: 25000, type: 'debit', category: 'Groceries', is_income: false },
      { id: '2', date: '2026-01-16', description: 'Uber Ride', amount: 3500, type: 'debit', category: 'Transport', is_income: false },
      { id: '3', date: '2026-01-17', description: 'KFC Dinner', amount: 8500, type: 'debit', category: 'Dining', is_income: false },
      { id: '4', date: '2026-01-18', description: 'Salary Payment', amount: 500000, type: 'credit', category: 'Salary', is_income: true },
      { id: '5', date: '2026-01-19', description: 'Netflix Subscription', amount: 2900, type: 'debit', category: 'Entertainment', is_income: false },
      { id: '6', date: '2026-01-20', description: 'Electricity Bill', amount: 15000, type: 'debit', category: 'Utilities', is_income: false },
      { id: '7', date: '2026-01-21', description: 'Freelance Payment', amount: 75000, type: 'credit', category: 'Freelance Income', is_income: true },
      { id: '8', date: '2026-01-22', description: 'Spar Groceries', amount: 18000, type: 'debit', category: 'Groceries', is_income: false },
    ];
    
    // Process data
    const expenses = mockTransactions.filter(t => t.type === 'debit');
    const income = mockTransactions.filter(t => t.type === 'credit');
    
    // Group by category
    const categoryMap = new Map<string, { amount: number; count: number }>();
    expenses.forEach(t => {
      const cat = t.category || 'Uncategorized';
      const current = categoryMap.get(cat) || { amount: 0, count: 0 };
      categoryMap.set(cat, {
        amount: current.amount + t.amount,
        count: current.count + 1
      });
    });
    
    const categoryData = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count
    })).sort((a, b) => b.amount - a.amount);
    
    const totalSpending = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const savingsPotential = totalIncome - totalSpending;
    
    // Mock trend data
    const mockTrends: TrendData[] = [
      { month: 'Oct 2025', amount: 45000, category: 'Groceries' },
      { month: 'Nov 2025', amount: 52000, category: 'Groceries' },
      { month: 'Dec 2025', amount: 48000, category: 'Groceries' },
      { month: 'Jan 2026', amount: 43000, category: 'Groceries' },
    ];
    
    setTimeout(() => {
      setData({
        transactions: mockTransactions,
        categoryData,
        totalSpending,
        totalIncome,
        topCategory: categoryData[0]?.category || 'None',
        savingsPotential
      });
      setTrends(mockTrends);
      setLoading(false);
    }, 1000);
  }, [params.statementId]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your transactions...</p>
        </div>
      </div>
    );
  }
  
  if (!data) return <div>Error loading data</div>;
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Spending Overview
          </h1>
          <p className="text-gray-600">
            Detailed analysis of your financial transactions and spending patterns
          </p>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            title="Total Spending" 
            value={formatNaira(data.totalSpending)} 
            icon={<TrendingUp className="h-6 w-6" />}
            trend="down"
            trendValue="12%"
          />
          <Card 
            title="Total Income" 
            value={formatNaira(data.totalIncome)} 
            icon={<DollarSign className="h-6 w-6" />}
            trend="up"
            trendValue="8%"
          />
          <Card 
            title="Savings Potential" 
            value={formatNaira(data.savingsPotential)} 
            icon={<Target className="h-6 w-6" />}
            trend="up"
            trendValue="15%"
          />
          <Card 
            title="Top Category" 
            value={data.topCategory} 
            icon={<ArrowUpRight className="h-6 w-6" />}
            trend="neutral"
          />
        </div>
        
        {/* Historical Trends */}
        {trends.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">Spending Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatNaira(Number(value))} />
                <Bar dataKey="amount" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {/* Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Category Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.categoryData}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(props: any) => {
                    const { category, percent } = props.payload || {};
                    return `${category} ${((percent || 0) * 100).toFixed(0)}%`;
                  }}
                >
                  {data.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatNaira(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Category Details</h2>
            <div className="space-y-3">
              {data.categoryData.map((cat, index) => (
                <CategoryRow key={cat.category} data={cat} color={COLORS[index % COLORS.length]} />
              ))}
            </div>
          </div>
        </div>
        
        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.transactions.slice(0, 10).map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {transaction.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.type === 'credit' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}{formatNaira(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => {
              // In real app, navigate to insights page
              console.log('View AI insights');
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            View AI Insights
          </button>
          <button
            onClick={() => {
              // In real app, navigate to todos page
              console.log('Set financial goals');
            }}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-200 transition-colors"
          >
            Set Financial Goals
          </button>
          <button
            onClick={() => {
              // In real app, navigate to tax page
              console.log('View tax estimates');
            }}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-200 transition-colors"
          >
            View Tax Estimates
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  trend: 'up' | 'down' | 'neutral';
  trendValue?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-3 bg-blue-100 rounded-lg">
          {icon}
        </div>
      </div>
      {trend !== 'neutral' && trendValue && (
        <div className="mt-4 flex items-center text-sm">
          {trend === 'up' ? (
            <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
            {trendValue} from last month
          </span>
        </div>
      )}
    </div>
  );
}

function CategoryRow({ data, color }: { data: CategoryData; color: string }) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
      <div className="flex items-center">
        <div 
          className="w-4 h-4 rounded-full mr-3" 
          style={{ backgroundColor: color }}
        />
        <span className="font-medium text-gray-900">{data.category}</span>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900">{formatNaira(data.amount)}</p>
        <p className="text-xs text-gray-500">{data.count} transactions</p>
      </div>
    </div>
  );
}