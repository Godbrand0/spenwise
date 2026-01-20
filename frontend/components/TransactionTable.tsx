import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Tag, Calendar } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category?: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  limit?: number;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, limit }) => {
  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  return (
    <div className="glass rounded-2xl overflow-hidden border border-white/5">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Date</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Description</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Category</th>
              <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {displayTransactions.map((t) => (
              <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span className="text-xs font-mono text-slate-400">{new Date(t.date).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      t.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {t.type === 'credit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{t.description}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3 h-3 text-blue-500/50" />
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-blue-500/5 text-blue-400 border border-blue-500/10">
                      {t.category || 'Uncategorized'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`text-sm font-bold font-mono ${
                    t.type === 'credit' ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {t.type === 'credit' ? '+' : '-'}{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(t.amount)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
