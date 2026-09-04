import React, { useState } from 'react';
import { BankAccount, AccountId } from '../types';
import { formatLKR } from '../utils/formatters';
import {
  Landmark,
  CreditCard,
  PiggyBank,
  Wallet,
  ArrowRightLeft,
  Edit2,
  Check,
  X,
  Plus,
} from 'lucide-react';

interface AccountsGridProps {
  accounts: BankAccount[];
  onUpdateBalance: (accountId: AccountId, newBalance: number) => void;
  onInitiateTransfer: (fromAccountId: AccountId) => void;
  onOpenIncome?: () => void;
}

export const AccountsGrid: React.FC<AccountsGridProps> = ({
  accounts,
  onUpdateBalance,
  onInitiateTransfer,
  onOpenIncome,
}) => {
  const [editingId, setEditingId] = useState<AccountId | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const totalLiquidNetWorth = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  const startEdit = (account: BankAccount) => {
    setEditingId(account.id);
    setEditValue(account.balance.toString());
  };

  const saveEdit = (accountId: AccountId) => {
    const num = parseFloat(editValue);
    if (!isNaN(num) && num >= 0) {
      onUpdateBalance(accountId, num);
    }
    setEditingId(null);
  };

  const getAccountIcon = (type: BankAccount['type']) => {
    switch (type) {
      case 'salary':
      case 'main':
        return <Landmark className="w-5 h-5 text-emerald-600" />;
      case 'savings':
        return <PiggyBank className="w-5 h-5 text-purple-600" />;
      case 'cash':
        return <Wallet className="w-5 h-5 text-blue-600" />;
    }
  };

  const getAccountColorTheme = (type: BankAccount['type']) => {
    switch (type) {
      case 'salary':
      case 'main':
        return 'border-emerald-200 bg-linear-to-b from-emerald-50/40 to-white';
      case 'savings':
        return 'border-purple-200 bg-linear-to-b from-purple-50/40 to-white';
      case 'cash':
        return 'border-blue-200 bg-linear-to-b from-blue-50/40 to-white';
    }
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3.5">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Accounts & Liquid Assets</span>
            <span className="text-xs font-normal text-slate-500">
              (Total: <strong className="text-slate-900 font-semibold">{formatLKR(totalLiquidNetWorth)}</strong>)
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Real balances across your Sampath Bank, Dialog Finance savings, and Cash in Hand.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {accounts.map((account) => {
          const isEditing = editingId === account.id;

          return (
            <div
              key={account.id}
              id={`card-account-${account.id}`}
              className={`rounded-xl border p-4.5 transition-all shadow-xs flex flex-col justify-between ${getAccountColorTheme(
                account.type
              )}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-white border border-slate-200/60 shadow-xs">
                      {getAccountIcon(account.type)}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block truncate max-w-[140px]">
                        {account.name}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {account.bankName} {account.accountNumber ? `• ${account.accountNumber}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {account.id === 'sampath' && (
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded">
                        Salary & Main
                      </span>
                    )}
                    <button
                      id={`btn-edit-balance-${account.id}`}
                      onClick={() => (isEditing ? saveEdit(account.id) : startEdit(account))}
                      className="p-1.5 rounded-md hover:bg-slate-200/60 text-slate-500 hover:text-slate-700 transition-colors"
                      title={isEditing ? 'Save balance' : 'Edit balance'}
                    >
                      {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Edit2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Balance Display or Input */}
                <div className="mt-3.5">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-500 font-mono">Rs.</span>
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(account.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        autoFocus
                        className="w-full text-base font-bold text-slate-900 bg-white border border-slate-300 rounded-md px-2 py-1 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xl font-extrabold text-slate-900 tracking-tight font-mono">
                        {formatLKR(account.balance)}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {account.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  {account.type === 'salary' || account.id === 'sampath'
                    ? 'Salary & Inflow'
                    : account.type === 'savings'
                    ? 'Savings Reserve'
                    : 'Daily Cash'}
                </span>

                <div className="flex items-center gap-1.5">
                  {account.id === 'sampath' && onOpenIncome && (
                    <button
                      id="btn-add-income-sampath"
                      onClick={onOpenIncome}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200 shadow-2xs transition-colors"
                      title="Add manual Salary, OT, or Other Income to Sampath Bank"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Income</span>
                    </button>
                  )}

                  <button
                    id={`btn-transfer-from-${account.id}`}
                    onClick={() => onInitiateTransfer(account.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-white/80 hover:bg-white px-2 py-1 rounded-md border border-slate-200 shadow-2xs transition-colors"
                  >
                    <ArrowRightLeft className="w-3 h-3 text-slate-500" />
                    <span>Transfer</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
