import React from 'react';
import { UserProfile } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import {
  Wallet,
  Plus,
  ArrowRightLeft,
  RotateCcw,
  Sparkles,
  Cloud,
} from 'lucide-react';
import { calculatePayCycles } from '../utils/formatters';

interface HeaderProps {
  user: UserProfile;
  totalLiquidNetWorth: number;
  currentUser?: FirebaseUser | null;
  syncStatus?: 'connecting' | 'synced' | 'offline' | 'error';
  onOpenIncomeModal: (type?: 'basic_salary' | 'ot_amount' | 'other_income') => void;
  onOpenExpenseModal: () => void;
  onOpenTransferModal: () => void;
  onOpenBackupModal: () => void;
  onOpenFirebaseModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  totalLiquidNetWorth,
  currentUser,
  syncStatus = 'synced',
  onOpenIncomeModal,
  onOpenExpenseModal,
  onOpenTransferModal,
  onOpenBackupModal,
  onOpenFirebaseModal,
}) => {
  const payCycles = calculatePayCycles();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* User Profile & Badge */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              PS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {user.name}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>{payCycles.currentDateStr}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="text-slate-600 font-medium">Sri Lanka (LKR)</span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center flex-wrap gap-2">
            {onOpenFirebaseModal && (
              <button
                id="btn-cloud-sync"
                onClick={onOpenFirebaseModal}
                className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors border ${
                  syncStatus === 'synced'
                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                    : syncStatus === 'connecting'
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
                title="Firebase Cloud Database & Multi-Device Sync"
              >
                <Cloud
                  className={`w-3.5 h-3.5 ${
                    syncStatus === 'connecting'
                      ? 'animate-pulse text-amber-600'
                      : syncStatus === 'synced'
                      ? 'text-emerald-600'
                      : 'text-slate-500'
                  }`}
                />
                <span className="hidden sm:inline">
                  {syncStatus === 'synced'
                    ? 'Firebase Synced'
                    : syncStatus === 'connecting'
                    ? 'Syncing...'
                    : 'Cloud Sync'}
                </span>
              </button>
            )}

            <button
              id="btn-log-salary-ot"
              onClick={() => onOpenIncomeModal('basic_salary')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-xs"
              title="Manually log Salary or OT to Sampath Bank"
            >
              <Plus className="w-4 h-4" />
              <span>Add Salary / OT</span>
            </button>

            <button
              id="btn-log-other-income"
              onClick={() => onOpenIncomeModal('other_income')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-sm font-semibold transition-colors"
              title="Manually log other farm produce or bonus income"
            >
              <Plus className="w-4 h-4 text-emerald-700" />
              <span>Other Income</span>
            </button>

            <button
              id="btn-add-expense"
              onClick={onOpenExpenseModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>

            <button
              id="btn-transfer"
              onClick={onOpenTransferModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
              title="Transfer funds between accounts"
            >
              <ArrowRightLeft className="w-4 h-4 text-slate-500" />
              <span>Transfer</span>
            </button>

            <button
              id="btn-backup-settings"
              onClick={onOpenBackupModal}
              className="inline-flex items-center p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="Backup, Export, or Reset Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
