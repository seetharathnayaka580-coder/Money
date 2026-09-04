import React from 'react';
import { ExpenseCategory, AccountId } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { Zap } from 'lucide-react';

interface QuickExpenseButtonsProps {
  onQuickLog: (category: ExpenseCategory, defaultTitle: string) => void;
}

export const QuickExpenseButtons: React.FC<QuickExpenseButtonsProps> = ({ onQuickLog }) => {
  const quickItems: {
    category: ExpenseCategory;
    title: string;
    label: string;
    sublabel: string;
    color: string;
  }[] = [
    {
      category: 'bike_repair',
      title: 'Bike Repair / Petrol',
      label: 'Bike Repair / Fuel',
      sublabel: 'Service, oil, petrol',
      color: 'border-orange-200 bg-orange-50/50 hover:bg-orange-100/70 text-orange-900',
    },
    {
      category: 'internet_reload',
      title: 'Internet & Reload',
      label: 'Internet & Reloads',
      sublabel: 'Data card, phone reload',
      color: 'border-cyan-200 bg-cyan-50/50 hover:bg-cyan-100/70 text-cyan-900',
    },
    {
      category: 'daily_expenses',
      title: 'Daily Food & Living',
      label: 'Daily Meals & Living',
      sublabel: 'Farm lunch, tea, snacks',
      color: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-900',
    },
    {
      category: 'hospital',
      title: 'Hospital & Medical',
      label: 'Hospital & Medical',
      sublabel: 'Doctor, pharmacy, clinic',
      color: 'border-red-200 bg-red-50/50 hover:bg-red-100/70 text-red-900',
    },
    {
      category: 'liquor',
      title: 'Liquor & Relax',
      label: 'Liquor / Personal Bill',
      sublabel: 'Beverages & social',
      color: 'border-violet-200 bg-violet-50/50 hover:bg-violet-100/70 text-violet-900',
    },
    {
      category: 'other_bills',
      title: 'Swiss / Pewter / Other Bill',
      label: 'Other Bills / Misc',
      sublabel: 'Swiss, pewter, utility reload',
      color: 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-md bg-amber-100 text-amber-800">
            <Zap className="w-4 h-4" />
          </span>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Quick Expense Tap (Pathum's Categories)
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">1-click logging</span>
      </div>

      <p className="text-xs text-slate-500 mb-3.5">
        Frequently incurred farm & personal expenses. Click any category to instantly log a payment:
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {quickItems.map((item) => (
          <button
            key={item.category}
            id={`btn-quick-${item.category}`}
            onClick={() => onQuickLog(item.category, item.title)}
            className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${item.color} shadow-2xs hover:scale-[1.02] active:scale-[0.98]`}
          >
            <div className="p-1.5 rounded-lg bg-white/90 shadow-2xs mb-2">
              <CategoryIcon category={item.category} className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold leading-snug">{item.label}</span>
            <span className="text-[10px] opacity-75 mt-0.5">{item.sublabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
