import React, { useState } from 'react';
import { Transaction, BankAccount, AccountId } from '../types';
import { formatLKR } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { Search, Filter, Trash2, ArrowDownRight, ArrowUpRight, ArrowRightLeft } from 'lucide-react';
import { CATEGORY_DETAILS } from '../data/initialData';

interface TransactionListProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  onDeleteTransaction: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  accounts,
  onDeleteTransaction,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income' | 'transfer'>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');

  const getAccountName = (id: AccountId) => {
    return accounts.find((a) => a.id === id)?.name || id;
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.title.toLowerCase().includes(search.toLowerCase()) ||
      (tx.note && tx.note.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesAccount =
      accountFilter === 'all' ||
      tx.accountId === accountFilter ||
      (tx.toAccountId && tx.toAccountId === accountFilter);

    return matchesSearch && matchesType && matchesAccount;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Transaction Ledger & History
          </h3>
          <p className="text-xs text-slate-500">
            Recorded salaries, OT payments, fixed obligations, transfers, and daily expenses
          </p>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing {filteredTransactions.length} of {transactions.length} entries
        </div>
      </div>

      {/* Filters Bar */}
      <div className="py-3 flex flex-col sm:flex-row items-center gap-2.5">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
          {(['all', 'expense', 'income', 'transfer'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                typeFilter === t
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Account Filter */}
        <div className="w-full sm:w-auto ml-auto">
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="w-full sm:w-auto px-2.5 py-1 text-xs border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-medium"
          >
            <option value="all">All Accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="divide-y divide-slate-100">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No transactions found matching the selected filter or query.
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isIncome = tx.type === 'income';
            const isTransfer = tx.type === 'transfer';

            return (
              <div
                key={tx.id}
                id={`tx-item-${tx.id}`}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                      isIncome
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isTransfer
                        ? 'bg-slate-100 text-slate-700 border-slate-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    <CategoryIcon category={tx.category || tx.type} className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{tx.title}</span>
                      {tx.isFixed && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-sm">
                          Fixed
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{tx.date}</span>
                      <span>•</span>
                      <span className="font-medium text-slate-600">
                        {isTransfer && tx.toAccountId ? (
                          <>
                            {getAccountName(tx.accountId)} → {getAccountName(tx.toAccountId)}
                          </>
                        ) : (
                          getAccountName(tx.accountId)
                        )}
                      </span>
                      {tx.note && (
                        <>
                          <span>•</span>
                          <span className="italic text-slate-400 truncate max-w-[200px]">
                            {tx.note}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div
                      className={`text-sm font-extrabold font-mono flex items-center justify-end gap-0.5 ${
                        isIncome
                          ? 'text-emerald-700'
                          : isTransfer
                          ? 'text-slate-800'
                          : 'text-slate-900'
                      }`}
                    >
                      {isIncome ? '+' : isTransfer ? '' : '-'}
                      {formatLKR(tx.amount)}
                    </div>
                    <span className="text-[10px] text-slate-400 capitalize">{tx.type}</span>
                  </div>

                  <button
                    id={`btn-delete-tx-${tx.id}`}
                    onClick={() => onDeleteTransaction(tx.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete transaction and restore balance"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
