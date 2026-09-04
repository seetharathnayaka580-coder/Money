import React from 'react';
import { Transaction, FixedObligation, BankAccount } from '../types';
import { formatLKR, calculatePayCycles } from '../utils/formatters';
import { CATEGORY_DETAILS } from '../data/initialData';
import { CategoryIcon } from './CategoryIcon';
import { TrendingUp, TrendingDown, PieChart, ShieldCheck, DollarSign } from 'lucide-react';

interface SpendingAnalyticsProps {
  transactions: Transaction[];
  fixedObligations: FixedObligation[];
  accounts: BankAccount[];
}

export const SpendingAnalytics: React.FC<SpendingAnalyticsProps> = ({
  transactions,
  fixedObligations,
  accounts,
}) => {
  const payCycles = calculatePayCycles();

  // Current month transactions (excluding internal transfers)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthTx = transactions.filter((tx) => {
    const d = new Date(tx.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && tx.type !== 'transfer';
  });

  const totalIncome = monthTx
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = monthTx
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalFixedNeeded = fixedObligations.reduce((sum, o) => sum + o.amount, 0);
  const totalFixedPaid = fixedObligations.filter((o) => o.isPaid).reduce((sum, o) => sum + o.amount, 0);

  // Group variable expenses by category
  const categoryTotals: Record<string, number> = {};
  monthTx
    .filter((tx) => tx.type === 'expense')
    .forEach((tx) => {
      const cat = tx.category || 'other_bills';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + tx.amount;
    });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  // Liquid cash available (excluding Dialog Finance which is reserved savings)
  const liquidOperational = accounts
    .filter((a) => a.id !== 'dialog_finance')
    .reduce((sum, a) => sum + a.balance, 0);

  // Days until next pay event
  const daysUntilNextMoney = payCycles.daysUntilBasic > 0 ? payCycles.daysUntilBasic : payCycles.daysUntilOT > 0 ? payCycles.daysUntilOT : 1;
  const safeDailySpend = Math.max(0, Math.floor(liquidOperational / Math.max(1, daysUntilNextMoney)));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PieChart className="w-4 h-4 text-slate-600" />
            <span>Monthly Cashflow & Spend Analytics</span>
          </h3>
          <p className="text-xs text-slate-500">
            Current month breakdown of income, fixed obligations, and everyday farm expenditures
          </p>
        </div>

        {/* Daily Safe-to-Spend meter */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 flex items-center gap-3">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Safe Daily Spend
            </div>
            <div className="text-sm font-extrabold text-slate-900 font-mono">
              {formatLKR(safeDailySpend)}
              <span className="text-[11px] font-normal text-slate-500">/day</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 border-l border-slate-200 pl-3">
            until next pay ({daysUntilNextMoney}d)
          </div>
        </div>
      </div>

      {/* Top 3 Stat Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
        <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Total Inflows (Salary+OT)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-extrabold text-slate-900 mt-1 font-mono">
            {formatLKR(totalIncome)}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Recorded this month into accounts</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Total Spent This Month</span>
            <TrendingDown className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-lg font-extrabold text-slate-900 mt-1 font-mono">
            {formatLKR(totalExpense)}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Fixed bills + daily & hospital</p>
        </div>

        <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-800">Net Month Balance</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <div
            className={`text-lg font-extrabold mt-1 font-mono ${
              totalIncome - totalExpense >= 0 ? 'text-emerald-700' : 'text-amber-700'
            }`}
          >
            {formatLKR(totalIncome - totalExpense)}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Inflow surplus after recorded expenses</p>
        </div>
      </div>

      {/* Category Breakdown Bars */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
          Spending Breakdown by Category
        </h4>

        {sortedCategories.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No expenses recorded for this month yet. Use the Quick Expense buttons above to track daily spending.
          </div>
        ) : (
          <div className="space-y-2.5">
            {sortedCategories.map(([cat, amt]) => {
              const info = CATEGORY_DETAILS[cat] || { label: cat };
              const percent = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <CategoryIcon category={cat} className="w-3.5 h-3.5 text-slate-500" />
                      <span>{info.label}</span>
                    </span>
                    <span className="font-mono text-slate-800 font-semibold">
                      {formatLKR(amt)}{' '}
                      <span className="text-slate-400 font-normal text-[11px]">({percent}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-800 rounded-full"
                      style={{ width: `${Math.max(3, percent)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
