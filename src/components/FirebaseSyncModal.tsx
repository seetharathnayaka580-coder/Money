import React, { useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  Cloud,
  CheckCircle2,
  RefreshCw,
  LogIn,
  LogOut,
  X,
  Database,
  ShieldCheck,
  AlertCircle,
  Smartphone,
} from 'lucide-react';
import { signInWithGoogle, logOutFromFirebase, firebaseConfig } from '../lib/firebase';
import { BankAccount, FixedObligation, Transaction, UserProfile } from '../types';

interface FirebaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  syncStatus: 'connecting' | 'synced' | 'offline' | 'error';
  lastSyncedAt: Date | null;
  user: UserProfile;
  accounts: BankAccount[];
  fixedObligations: FixedObligation[];
  transactions: Transaction[];
  onForceSyncToCloud: () => Promise<void>;
  onForceReloadFromCloud: () => Promise<void>;
}

export const FirebaseSyncModal: React.FC<FirebaseSyncModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  syncStatus,
  lastSyncedAt,
  user,
  accounts,
  fixedObligations,
  transactions,
  onForceSyncToCloud,
  onForceReloadFromCloud,
}) => {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsActionLoading(true);
    setStatusMessage(null);
    try {
      await signInWithGoogle();
      setStatusMessage('Successfully signed in with Google! Cloud sync updated.');
    } catch (err: unknown) {
      console.error(err);
      setStatusMessage('Google Sign-In was cancelled or failed.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsActionLoading(true);
    setStatusMessage(null);
    try {
      await logOutFromFirebase();
      setStatusMessage('Signed out. Continuing in offline/guest mode.');
    } catch (err: unknown) {
      console.error(err);
      setStatusMessage('Sign out error.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleManualSync = async () => {
    setIsActionLoading(true);
    setStatusMessage(null);
    try {
      await onForceSyncToCloud();
      setStatusMessage('All current accounts, bills, and transactions synced to Firestore!');
    } catch (err: unknown) {
      console.error(err);
      setStatusMessage('Sync failed. Please verify your connection.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const isGoogleUser = currentUser && !currentUser.isAnonymous;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-900 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Firebase Cloud Database</h3>
              <p className="text-xs text-slate-300">Live multi-device data synchronization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Status Message */}
          {statusMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Cloud Connection Badge */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-3 h-3 rounded-full ${
                  syncStatus === 'synced'
                    ? 'bg-emerald-500 animate-pulse'
                    : syncStatus === 'connecting'
                    ? 'bg-amber-400 animate-bounce'
                    : 'bg-slate-400'
                }`}
              />
              <div>
                <div className="font-bold text-slate-900 capitalize">
                  {syncStatus === 'synced'
                    ? 'Connected & Real-Time Synced'
                    : syncStatus === 'connecting'
                    ? 'Connecting to Firestore...'
                    : 'Offline Mode'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {lastSyncedAt
                    ? `Last updated: ${lastSyncedAt.toLocaleTimeString()}`
                    : 'Ready to synchronize'}
                </div>
              </div>
            </div>

            <button
              onClick={handleManualSync}
              disabled={isActionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-semibold shadow-2xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isActionLoading ? 'animate-spin' : ''}`} />
              <span>Sync Now</span>
            </button>
          </div>

          {/* Account Authentication Section */}
          <div className="p-4 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Firebase Authentication
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                {isGoogleUser ? 'Google Account' : 'Anonymous / Guest'}
              </span>
            </div>

            {isGoogleUser ? (
              <div className="flex items-center justify-between gap-3 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                <div className="truncate">
                  <div className="font-bold text-slate-900 truncate">
                    {currentUser?.displayName || user.name}
                  </div>
                  <div className="text-[11px] text-slate-600 truncate">{currentUser?.email}</div>
                </div>
                <button
                  onClick={handleSignOut}
                  disabled={isActionLoading}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-md font-medium shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div>
                <p className="text-slate-600 text-[11px] mb-2.5 leading-relaxed">
                  You are currently using an anonymous session. Sign in with your Google account to keep your finances permanently synced across your phone, tablet, and PC.
                </p>
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isActionLoading}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold rounded-lg shadow-2xs transition-colors"
                >
                  <LogIn className="w-4 h-4 text-emerald-700" />
                  <span>Sign in with Google to Sync Across Devices</span>
                </button>
              </div>
            )}
          </div>

          {/* Cloud Database Summary */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              <Database className="w-3.5 h-3.5 text-slate-600" />
              <span>Cloud Firestore Collections</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-xs font-mono font-extrabold text-slate-900">
                  {accounts.length}
                </div>
                <div className="text-[10px] text-slate-500">Bank Accounts</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-xs font-mono font-extrabold text-slate-900">
                  {fixedObligations.length}
                </div>
                <div className="text-[10px] text-slate-500">Fixed Bills</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-xs font-mono font-extrabold text-slate-900">
                  {transactions.length}
                </div>
                <div className="text-[10px] text-slate-500">Transactions</div>
              </div>
            </div>
          </div>

          {/* Security & Config Details */}
          <div className="p-3 bg-slate-100/70 rounded-xl text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Firebase Security Rules Active</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Project: <span className="font-mono">{firebaseConfig.projectId}</span>
            </p>
            <p className="text-[10px] text-slate-500">
              Database: <span className="font-mono">{firebaseConfig.firestoreDatabaseId}</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
