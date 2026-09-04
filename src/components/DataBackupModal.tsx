import React, { useRef, useState } from 'react';
import { BankAccount, FixedObligation, Transaction, UserProfile } from '../types';
import {
  Download,
  Upload,
  RotateCcw,
  X,
  Check,
  User,
  ShieldAlert,
  Cloud,
} from 'lucide-react';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  accounts: BankAccount[];
  fixedObligations: FixedObligation[];
  transactions: Transaction[];
  onUpdateUser: (newUser: UserProfile) => void;
  onRestoreData: (data: {
    user: UserProfile;
    accounts: BankAccount[];
    fixedObligations: FixedObligation[];
    transactions: Transaction[];
  }) => void;
  onResetToDefaults: () => void;
  onOpenFirebaseModal?: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  user,
  accounts,
  fixedObligations,
  transactions,
  onUpdateUser,
  onRestoreData,
  onResetToDefaults,
  onOpenFirebaseModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [isSavedUser, setIsSavedUser] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    const backupData = {
      user,
      accounts,
      fixedObligations,
      transactions,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Pathum_Money_System_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.accounts && json.fixedObligations && json.transactions) {
          onRestoreData({
            user: json.user || user,
            accounts: json.accounts,
            fixedObligations: json.fixedObligations,
            transactions: json.transactions,
          });
          onClose();
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name: name.trim() || user.name,
      role: role.trim() || user.role,
    });
    setIsSavedUser(true);
    setTimeout(() => setIsSavedUser(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">System Settings & Data Backup</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* User Profile */}
          <form onSubmit={handleSaveProfile} className="space-y-3 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Profile Details
              </span>
              {isSavedUser && <span className="text-xs text-emerald-600 font-bold">Saved!</span>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Update Profile
              </button>
            </div>
          </form>

          {/* Backup and Restore */}
          <div className="space-y-3 pb-4 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Data Backup & Export
            </span>
            <p className="text-xs text-slate-500">
              Download your entire ledger, account balances, and obligations as a JSON file or restore from a previous backup.
            </p>

            <div className="flex flex-wrap gap-2.5">
              <button
                id="btn-export-backup"
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Data (JSON)</span>
              </button>

              <button
                id="btn-import-backup"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Restore from File</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>

          {/* Firebase Cloud Database */}
          {onOpenFirebaseModal && (
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <Cloud className="w-4 h-4 text-emerald-700" />
                  <span>Firebase Cloud Database Sync</span>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenFirebaseModal();
                  }}
                  className="px-2.5 py-1 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-2xs transition-colors"
                >
                  Manage Sync
                </button>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Connect your account to synchronize finances automatically between your mobile phone and computer.
              </p>
            </div>
          )}

          {/* Reset to Default */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>Reset to Pathum's Starting Configuration</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Resets balances to: Sampath Bank (Rs. 38,900), Dialog Finance (Rs. 14,000), Cash (Rs. 2,500),
              and configures Fixed Expenses to Bike Rental (25,000), Seat (5,000), and Mobile Rental (7,900).
            </p>
            <button
              id="btn-reset-defaults"
              onClick={() => {
                if (window.confirm('Reset all balances and obligations to Pathum Sathintha initial specifications?')) {
                  onResetToDefaults();
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Starting State</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
