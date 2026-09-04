import React, { useState, useEffect } from 'react';
import { AccountId, BankAccount } from '../types';
import { formatLKR } from '../utils/formatters';
import { ArrowRightLeft, X, Check, ArrowRight } from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: BankAccount[];
  initialFromAccount?: AccountId;
  onTransfer: (data: {
    fromAccountId: AccountId;
    toAccountId: AccountId;
    amount: number;
    date: string;
    note?: string;
  }) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  accounts,
  initialFromAccount = 'sampath',
  onTransfer,
}) => {
  const [fromAccountId, setFromAccountId] = useState<AccountId>(initialFromAccount);
  const [toAccountId, setToAccountId] = useState<AccountId>('cash');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFromAccountId(initialFromAccount);
      // Auto pick a destination that isn't the from account
      const available = accounts.filter((a) => a.id !== initialFromAccount);
      if (available.length > 0) {
        setToAccountId(available[0].id);
      }
      setAmount('');
      setNote('');
    }
  }, [isOpen, initialFromAccount, accounts]);

  if (!isOpen) return null;

  const fromAccount = accounts.find((a) => a.id === fromAccountId);
  const toAccount = accounts.find((a) => a.id === toAccountId);
  const parsedAmount = parseFloat(amount) || 0;
  const isOverdraft = fromAccount && parsedAmount > fromAccount.balance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0 || fromAccountId === toAccountId) return;

    onTransfer({
      fromAccountId,
      toAccountId,
      amount: parsedAmount,
      date,
      note: note.trim() || undefined,
    });

    onClose();
  };

  const handleSwap = () => {
    const temp = fromAccountId;
    setFromAccountId(toAccountId);
    setToAccountId(temp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Transfer Funds</h3>
              <p className="text-xs text-slate-500">Move money between your accounts or cash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Transfer Source & Destination with Swap */}
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                From Account
              </label>
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value as AccountId)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id} disabled={acc.id === toAccountId}>
                    {acc.name} ({formatLKR(acc.balance)})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center -my-1 relative z-10">
              <button
                type="button"
                onClick={handleSwap}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-600 transition-transform active:rotate-180"
                title="Swap accounts"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                To Account
              </label>
              <select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value as AccountId)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id} disabled={acc.id === fromAccountId}>
                    {acc.name} ({formatLKR(acc.balance)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Amount to Transfer
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
                className="w-full pl-11 pr-4 py-2 text-base font-bold text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            {isOverdraft && (
              <p className="text-[11px] text-amber-700 mt-1">
                Note: Transfer exceeds available balance ({formatLKR(fromAccount?.balance || 0)}).
              </p>
            )}
          </div>

          {/* Date & Note */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Note (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. ATM withdrawal for farm cash or savings transfer"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Transfer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
