import React, { useState, useEffect } from 'react';
import { ExpenseCategory, AccountId, BankAccount } from '../types';
import { formatLKR } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { X, Check, AlertTriangle } from 'lucide-react';
import { CATEGORY_DETAILS } from '../data/initialData';

interface QuickExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: BankAccount[];
  initialCategory?: ExpenseCategory;
  initialTitle?: string;
  onAddExpense: (expense: {
    amount: number;
    category: ExpenseCategory;
    title: string;
    accountId: AccountId;
    date: string;
    note?: string;
  }) => void;
}

export const QuickExpenseModal: React.FC<QuickExpenseModalProps> = ({
  isOpen,
  onClose,
  accounts,
  initialCategory = 'daily_expenses',
  initialTitle = '',
  onAddExpense,
}) => {
  const [category, setCategory] = useState<ExpenseCategory>(initialCategory);
  const [title, setTitle] = useState(initialTitle || 'Daily Food & Living');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState<AccountId>('cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCategory(initialCategory);
      setTitle(initialTitle || CATEGORY_DETAILS[initialCategory]?.label || 'Expense');
      setAmount('');
      // Default daily and reloads to cash, larger things to Sampath Bank
      if (initialCategory === 'daily_expenses' || initialCategory === 'liquor' || initialCategory === 'internet_reload') {
        setAccountId('cash');
      } else {
        setAccountId('sampath');
      }
    }
  }, [isOpen, initialCategory, initialTitle]);

  if (!isOpen) return null;

  const currentAccount = accounts.find((a) => a.id === accountId);
  const currentBalance = currentAccount?.balance || 0;
  const parsedAmount = parseFloat(amount) || 0;
  const isInsufficient = parsedAmount > currentBalance;

  const quickAmounts = [500, 1000, 1500, 2000, 5000, 10000];

  const handleCategorySelect = (cat: ExpenseCategory) => {
    setCategory(cat);
    setTitle(CATEGORY_DETAILS[cat]?.label || 'Expense');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) return;

    onAddExpense({
      amount: parsedAmount,
      category,
      title: title.trim() || CATEGORY_DETAILS[category]?.label || 'Expense',
      accountId,
      date,
      note: note.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 text-white">
              <CategoryIcon category={category} className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add Expense</h3>
              <p className="text-xs text-slate-500">Record a payment from your accounts or cash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Category Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Expense Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  'daily_expenses',
                  'bike_repair',
                  'internet_reload',
                  'hospital',
                  'liquor',
                  'other_bills',
                  'bike_rental',
                  'seat',
                  'mobile_rental',
                ] as ExpenseCategory[]
              ).map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all text-xs font-semibold ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <CategoryIcon category={cat} className="w-3.5 h-3.5" />
                    <span className="truncate">{CATEGORY_DETAILS[cat]?.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Input & Quick Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Amount (LKR)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                Rs.
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="1"
                placeholder="Enter amount"
                className="w-full pl-11 pr-4 py-2.5 text-base font-extrabold text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-hidden font-mono"
              />
            </div>

            {/* Quick Amount Pills */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(q.toString())}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors font-mono"
                >
                  +{formatLKR(q)}
                </button>
              ))}
            </div>
          </div>

          {/* Paid From Account */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Paid From Account
              </label>
              <span className="text-xs text-slate-500">
                Available: <strong className="text-slate-900 font-mono">{formatLKR(currentBalance)}</strong>
              </span>
            </div>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value as AccountId)}
              className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl bg-white font-medium text-slate-900 focus:ring-2 focus:ring-slate-900"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} — {formatLKR(acc.balance)}
                </option>
              ))}
            </select>

            {isInsufficient && (
              <div className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Notice: Account balance ({formatLKR(currentBalance)}) is lower than this expense. Account will go into negative or need a transfer.
                </span>
              </div>
            )}
          </div>

          {/* Title and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Description / Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Petrol, Clinic, Reload"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Note (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Farm bike maintenance or family hospital visit"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
