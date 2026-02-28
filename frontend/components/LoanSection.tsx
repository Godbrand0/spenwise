import React from 'react';
import { Wallet, CheckCircle2, AlertCircle, Landmark } from 'lucide-react';

interface LenderStats {
  borrowed: number;
  repaid: number;
}

interface LoanSectionProps {
  totalBorrowed: number;
  totalRepaid: number;
  lenderBreakdown: Record<string, LenderStats>;
}

export const LoanSection: React.FC<LoanSectionProps> = ({
  totalBorrowed,
  totalRepaid,
  lenderBreakdown,
}) => {
  const netDebt = totalBorrowed - totalRepaid;
  const lenders = Object.entries(lenderBreakdown);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black uppercase tracking-tight text-text-primary flex items-center gap-3">
          <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
          Loan Portfolio
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Net Debt</span>
          <span className={`text-sm font-black ${netDebt > 0 ? 'text-error' : 'text-success'}`}>
            ₦{netDebt.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Loan Summary Card */}
        <div className="card-lg bg-surface relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <Landmark className="text-amber-500 w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-text-primary uppercase tracking-widest">Total Exposure</h4>
                <p className="text-xs text-text-muted font-medium">Aggregate borrowed vs repaid</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Total Borrowed</p>
                <p className="text-2xl font-black text-text-primary">₦{totalBorrowed.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Total Repaid</p>
                <p className="text-2xl font-black text-success">₦{totalRepaid.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-text-secondary uppercase">Repayment Progress</span>
                <span className="text-text-primary">{totalBorrowed > 0 ? Math.round((totalRepaid / totalBorrowed) * 100) : 100}%</span>
              </div>
              <div className="mt-2 h-2 w-full bg-secondary-medium rounded-full overflow-hidden">
                <div 
                  className="h-full bg-success transition-all duration-1000" 
                  style={{ width: `${totalBorrowed > 0 ? Math.min((totalRepaid / totalBorrowed) * 100, 100) : 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lender Breakdown */}
        <div className="card-lg bg-surface relative overflow-hidden">
          <h4 className="text-sm font-black text-text-primary uppercase tracking-widest mb-6 border-b border-border pb-4">
            Lenders Archive
          </h4>
          <div className="space-y-4 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
            {lenders.length > 0 ? (
              lenders.map(([lender, stats]) => (
                <div key={lender} className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary-medium/20 hover:border-primary/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${stats.borrowed > stats.repaid ? 'bg-error/10' : 'bg-success/10'}`}>
                      {stats.borrowed > stats.repaid ? (
                        <AlertCircle className="w-4 h-4 text-error" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-black text-text-primary uppercase tracking-tight">{lender}</span>
                      <div className="flex items-center gap-2 text-[10px] text-text-muted font-bold uppercase">
                        <span>B: ₦{stats.borrowed.toLocaleString()}</span>
                        <span>•</span>
                        <span>R: ₦{stats.repaid.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-black ${stats.borrowed > stats.repaid ? 'text-error' : 'text-success'}`}>
                      {stats.borrowed > stats.repaid 
                        ? `-₦${(stats.borrowed - stats.repaid).toLocaleString()}`
                        : 'Settled'
                      }
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 bg-secondary-medium/50 rounded-xl flex items-center justify-center mb-4 border border-border">
                  <Landmark className="w-6 h-6 text-text-muted" />
                </div>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">No loan data detected</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
