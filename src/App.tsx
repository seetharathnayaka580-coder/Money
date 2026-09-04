/**
 * Money Management System
 * Tailored for Pathum Sathintha (Farm Supervisor)
 */

import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  BankAccount,
  FixedObligation,
  Transaction,
  AccountId,
  ExpenseCategory,
  IncomeCategory,
} from './types';
import {
  INITIAL_USER_PROFILE,
  INITIAL_ACCOUNTS,
  INITIAL_FIXED_OBLIGATIONS,
  INITIAL_TRANSACTIONS,
} from './data/initialData';
import { Header } from './components/Header';
import { PayCycleBanner } from './components/PayCycleBanner';
import { AccountsGrid } from './components/AccountsGrid';
import { FixedObligationsCard } from './components/FixedObligationsCard';
import { QuickExpenseButtons } from './components/QuickExpenseButtons';
import { SpendingAnalytics } from './components/SpendingAnalytics';
import { TransactionList } from './components/TransactionList';
import { SalaryLoggerModal } from './components/SalaryLoggerModal';
import { QuickExpenseModal } from './components/QuickExpenseModal';
import { TransferModal } from './components/TransferModal';
import { DataBackupModal } from './components/DataBackupModal';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  ensureAuthenticatedUser,
  subscribeToUserData,
  syncUserProfileToCloud,
  syncAccountToCloud,
  syncAllAccountsToCloud,
  syncObligationToCloud,
  syncAllObligationsToCloud,
  deleteObligationFromCloud,
  syncTransactionToCloud,
  deleteTransactionFromCloud,
  seedInitialDataIfEmpty,
} from './lib/firebase';
import { FirebaseSyncModal } from './components/FirebaseSyncModal';

const STORAGE_KEYS = {
  USER: 'ps_money_user_v1',
  ACCOUNTS: 'ps_money_accounts_v1',
  OBLIGATIONS: 'ps_money_obligations_v1',
  TRANSACTIONS: 'ps_money_tx_v1',
};

export default function App() {
  // Load state from localStorage or fall back to Pathum's exact starting numbers
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
    } catch {
      return INITIAL_USER_PROFILE;
    }
  });

  const [accounts, setAccounts] = useState<BankAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  });

  const [fixedObligations, setFixedObligations] = useState<FixedObligation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OBLIGATIONS);
      return saved ? JSON.parse(saved) : INITIAL_FIXED_OBLIGATIONS;
    } catch {
      return INITIAL_FIXED_OBLIGATIONS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  // Firebase Auth and Real-Time Sync states
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [syncStatus, setSyncStatus] = useState<'connecting' | 'synced' | 'offline' | 'error'>('connecting');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [firebaseModalOpen, setFirebaseModalOpen] = useState(false);

  // Modal controls
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [incomeModalType, setIncomeModalType] = useState<IncomeCategory>('basic_salary');

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseModalCategory, setExpenseModalCategory] = useState<ExpenseCategory>('daily_expenses');
  const [expenseModalTitle, setExpenseModalTitle] = useState('');

  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferSourceAccount, setTransferSourceAccount] = useState<AccountId>('sampath');

  const [backupModalOpen, setBackupModalOpen] = useState(false);

  // Migration: If legacy 'm_account' exists in local storage, remove it and transfer its balance to Sampath Bank
  useEffect(() => {
    // Check if m_account exists in accounts
    const mAccount = accounts.find((a) => (a.id as string) === 'm_account');
    if (mAccount) {
      const mBalance = mAccount.balance || 0;
      const cleanedAccounts = accounts
        .filter((a) => (a.id as string) !== 'm_account')
        .map((acc) => {
          if (acc.id === 'sampath') {
            return {
              ...acc,
              name: 'Sampath Bank (Salary & Main)',
              type: 'salary' as const,
              balance: acc.balance + mBalance,
              description: 'Primary salary (10th), Overtime OT (15th-20th), other income & daily banking',
            };
          }
          return acc;
        });
      setAccounts(cleanedAccounts);
    }

    // Clean legacy transactions referencing m_account
    const hasLegacyTx = transactions.some(
      (tx) => (tx.accountId as string) === 'm_account' || (tx.toAccountId as string) === 'm_account'
    );
    if (hasLegacyTx) {
      const updatedTransactions = transactions.map((tx) => {
        const item = { ...tx };
        if ((item.accountId as string) === 'm_account') {
          item.accountId = 'sampath' as AccountId;
          item.title = item.title.replace(/M Account/g, 'Sampath Bank');
        }
        if ((item.toAccountId as string) === 'm_account') {
          item.toAccountId = 'sampath' as AccountId;
          item.title = item.title.replace(/M Account/g, 'Sampath Bank');
        }
        return item;
      });
      setTransactions(updatedTransactions);
    }

    // Clean legacy fixed obligations paid from m_account
    const hasLegacyObligation = fixedObligations.some(
      (o) => (o.paidFromAccount as string) === 'm_account'
    );
    if (hasLegacyObligation) {
      setFixedObligations((prev) =>
        prev.map((o) =>
          (o.paidFromAccount as string) === 'm_account'
            ? { ...o, paidFromAccount: 'sampath' as AccountId }
            : o
        )
      );
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OBLIGATIONS, JSON.stringify(fixedObligations));
  }, [fixedObligations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  // Firebase Auth and Real-time Firestore Lifecycle
  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);

      if (!currentUser) {
        setSyncStatus('connecting');
        await ensureAuthenticatedUser();
        return;
      }

      setSyncStatus('connecting');

      try {
        // Bootstrap initial data into Firestore if user account is fresh
        await seedInitialDataIfEmpty(currentUser.uid, {
          user,
          accounts,
          obligations: fixedObligations,
          transactions,
        });

        // Real-time Firestore data listener
        unsubscribeFirestore = subscribeToUserData(currentUser.uid, {
          onUserLoaded: (cloudUser) => {
            if (cloudUser) {
              setUser(cloudUser);
              setSyncStatus('synced');
              setLastSyncedAt(new Date());
            }
          },
          onAccountsLoaded: (cloudAccounts) => {
            if (cloudAccounts && cloudAccounts.length > 0) {
              setAccounts(cloudAccounts);
              setSyncStatus('synced');
              setLastSyncedAt(new Date());
            }
          },
          onObligationsLoaded: (cloudObligations) => {
            if (cloudObligations) {
              setFixedObligations(cloudObligations);
              setSyncStatus('synced');
              setLastSyncedAt(new Date());
            }
          },
          onTransactionsLoaded: (cloudTx) => {
            if (cloudTx) {
              setTransactions(cloudTx);
              setSyncStatus('synced');
              setLastSyncedAt(new Date());
            }
          },
          onError: (err) => {
            console.warn('Firestore subscription status:', err);
            setSyncStatus('offline');
          },
        });
      } catch (err) {
        console.warn('Firebase sync initialization notice:', err);
        setSyncStatus('offline');
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  const handleForceSyncToCloud = async () => {
    if (!firebaseUser) return;
    setSyncStatus('connecting');
    await Promise.all([
      syncUserProfileToCloud(firebaseUser.uid, user),
      syncAllAccountsToCloud(firebaseUser.uid, accounts),
      syncAllObligationsToCloud(firebaseUser.uid, fixedObligations),
      ...transactions.map((tx) => syncTransactionToCloud(firebaseUser.uid, tx)),
    ]);
    setSyncStatus('synced');
    setLastSyncedAt(new Date());
  };

  const handleForceReloadFromCloud = async () => {
    setSyncStatus('synced');
    setLastSyncedAt(new Date());
  };

  // Total liquid net worth
  const totalLiquidNetWorth = accounts.reduce((acc, a) => acc + a.balance, 0);

  // Action Handlers
  const handleRecordIncome = (income: {
    amount: number;
    category: IncomeCategory;
    title: string;
    accountId: AccountId;
    date: string;
    note?: string;
    autoPayFixed?: boolean;
  }) => {
    const targetAccountId: AccountId = income.accountId || 'sampath';

    const newTx: Transaction = {
      id: `tx_${Date.now()}_inc`,
      date: income.date,
      type: 'income',
      amount: income.amount,
      category: income.category,
      title: income.title,
      accountId: targetAccountId,
      note: income.note,
    };

    let updatedAccounts = accounts.map((acc) => {
      if (acc.id === targetAccountId) {
        return { ...acc, balance: acc.balance + income.amount };
      }
      return acc;
    });

    let updatedTxList = [newTx, ...transactions];
    let updatedObligations = [...fixedObligations];

    // If user selected auto-pay pending fixed obligations from the target deposit account
    if (income.autoPayFixed) {
      const unpaid = updatedObligations.filter((o) => !o.isPaid);
      let runningBalance = updatedAccounts.find((a) => a.id === targetAccountId)?.balance || 0;

      unpaid.forEach((item) => {
        if (runningBalance >= item.amount) {
          runningBalance -= item.amount;

          // Add fixed expense transaction
          const fixedTx: Transaction = {
            id: `tx_${Date.now()}_fix_${item.id}`,
            date: income.date,
            type: 'expense',
            amount: item.amount,
            category: item.category,
            title: item.title,
            accountId: targetAccountId,
            note: `Auto-settled upon salary deposit (${targetAccountId === 'sampath' ? 'Sampath Bank' : targetAccountId})`,
            isFixed: true,
          };

          updatedTxList.unshift(fixedTx);

          // Mark item paid
          updatedObligations = updatedObligations.map((o) =>
            o.id === item.id
              ? {
                  ...o,
                  isPaid: true,
                  paidDate: income.date,
                  paidFromAccount: targetAccountId,
                }
              : o
          );
        }
      });

      updatedAccounts = updatedAccounts.map((acc) =>
        acc.id === targetAccountId ? { ...acc, balance: runningBalance } : acc
      );
    }

    setAccounts(updatedAccounts);
    setTransactions(updatedTxList);
    setFixedObligations(updatedObligations);

    if (firebaseUser) {
      syncAllAccountsToCloud(firebaseUser.uid, updatedAccounts);
      syncTransactionToCloud(firebaseUser.uid, newTx);
      if (income.autoPayFixed) {
        syncAllObligationsToCloud(firebaseUser.uid, updatedObligations);
        updatedTxList.forEach((tx) => syncTransactionToCloud(firebaseUser.uid, tx));
      }
    }
  };

  const handleAddExpense = (expense: {
    amount: number;
    category: ExpenseCategory;
    title: string;
    accountId: AccountId;
    date: string;
    note?: string;
  }) => {
    const newTx: Transaction = {
      id: `tx_${Date.now()}_exp`,
      date: expense.date,
      type: 'expense',
      amount: expense.amount,
      category: expense.category,
      title: expense.title,
      accountId: expense.accountId,
      note: expense.note,
    };

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === expense.accountId) {
          return { ...acc, balance: acc.balance - expense.amount };
        }
        return acc;
      })
    );

    setTransactions((prev) => [newTx, ...prev]);

    if (firebaseUser) {
      const acc = accounts.find((a) => a.id === expense.accountId);
      if (acc) {
        syncAccountToCloud(firebaseUser.uid, { ...acc, balance: acc.balance - expense.amount });
      }
      syncTransactionToCloud(firebaseUser.uid, newTx);
    }
  };

  const handleTransfer = (data: {
    fromAccountId: AccountId;
    toAccountId: AccountId;
    amount: number;
    date: string;
    note?: string;
  }) => {
    const fromName = accounts.find((a) => a.id === data.fromAccountId)?.name || data.fromAccountId;
    const toName = accounts.find((a) => a.id === data.toAccountId)?.name || data.toAccountId;

    const newTx: Transaction = {
      id: `tx_${Date.now()}_trf`,
      date: data.date,
      type: 'transfer',
      amount: data.amount,
      category: 'transfer',
      title: `Transfer: ${fromName} → ${toName}`,
      accountId: data.fromAccountId,
      toAccountId: data.toAccountId,
      note: data.note,
    };

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === data.fromAccountId) {
          return { ...acc, balance: acc.balance - data.amount };
        }
        if (acc.id === data.toAccountId) {
          return { ...acc, balance: acc.balance + data.amount };
        }
        return acc;
      })
    );

    setTransactions((prev) => [newTx, ...prev]);

    if (firebaseUser) {
      const fAcc = accounts.find((a) => a.id === data.fromAccountId);
      const tAcc = accounts.find((a) => a.id === data.toAccountId);
      if (fAcc) syncAccountToCloud(firebaseUser.uid, { ...fAcc, balance: fAcc.balance - data.amount });
      if (tAcc) syncAccountToCloud(firebaseUser.uid, { ...tAcc, balance: tAcc.balance + data.amount });
      syncTransactionToCloud(firebaseUser.uid, newTx);
    }
  };

  const handleToggleFixedPaid = (obligationId: string, accountId: AccountId) => {
    const obligation = fixedObligations.find((o) => o.id === obligationId);
    if (!obligation) return;

    const todayStr = new Date().toISOString().split('T')[0];

    if (!obligation.isPaid) {
      // Mark as paid
      setFixedObligations((prev) =>
        prev.map((o) =>
          o.id === obligationId
            ? {
                ...o,
                isPaid: true,
                paidDate: todayStr,
                paidFromAccount: accountId,
              }
            : o
        )
      );

      // Deduct from account
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === accountId ? { ...acc, balance: acc.balance - obligation.amount } : acc
        )
      );

      // Record transaction
      const newTx: Transaction = {
        id: `tx_${Date.now()}_fix_${obligation.id}`,
        date: todayStr,
        type: 'expense',
        amount: obligation.amount,
        category: obligation.category,
        title: `${obligation.title} (Monthly Fixed Bill)`,
        accountId,
        note: `Paid from ${accounts.find((a) => a.id === accountId)?.name || accountId}`,
        isFixed: true,
      };

      setTransactions((prev) => [newTx, ...prev]);

      if (firebaseUser) {
        syncObligationToCloud(firebaseUser.uid, {
          ...obligation,
          isPaid: true,
          paidDate: todayStr,
          paidFromAccount: accountId,
        });
        const acc = accounts.find((a) => a.id === accountId);
        if (acc) {
          syncAccountToCloud(firebaseUser.uid, { ...acc, balance: acc.balance - obligation.amount });
        }
        syncTransactionToCloud(firebaseUser.uid, newTx);
      }
    } else {
      // Undo paid
      const payingAccount = obligation.paidFromAccount || 'sampath';

      setFixedObligations((prev) =>
        prev.map((o) =>
          o.id === obligationId
            ? {
                ...o,
                isPaid: false,
                paidDate: undefined,
                paidFromAccount: undefined,
              }
            : o
        )
      );

      // Refund to paying account
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === payingAccount ? { ...acc, balance: acc.balance + obligation.amount } : acc
        )
      );

      // Remove transaction
      setTransactions((prev) =>
        prev.filter((tx) => !(tx.isFixed && tx.category === obligation.category))
      );

      if (firebaseUser) {
        syncObligationToCloud(firebaseUser.uid, {
          ...obligation,
          isPaid: false,
          paidDate: undefined,
          paidFromAccount: undefined,
        });
        const pAcc = accounts.find((a) => a.id === payingAccount);
        if (pAcc) {
          syncAccountToCloud(firebaseUser.uid, { ...pAcc, balance: pAcc.balance + obligation.amount });
        }
        const fixTx = transactions.find((tx) => tx.isFixed && tx.category === obligation.category);
        if (fixTx) {
          deleteTransactionFromCloud(firebaseUser.uid, fixTx.id);
        }
      }
    }
  };

  const handleAddObligation = (newObligation: Omit<FixedObligation, 'id' | 'isPaid'>) => {
    const item: FixedObligation = {
      ...newObligation,
      id: `fix_${Date.now()}`,
      isPaid: false,
    };
    setFixedObligations((prev) => [...prev, item]);

    if (firebaseUser) {
      syncObligationToCloud(firebaseUser.uid, item);
    }
  };

  const handleDeleteObligation = (obligationId: string) => {
    const obligation = fixedObligations.find((o) => o.id === obligationId);
    if (!obligation) return;

    // If it was marked as paid, refund back to the paying account and remove the expense transaction
    if (obligation.isPaid) {
      const payingAccount = obligation.paidFromAccount || 'sampath';
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === payingAccount ? { ...acc, balance: acc.balance + obligation.amount } : acc
        )
      );

      setTransactions((prev) =>
        prev.filter((tx) => !(tx.isFixed && tx.category === obligation.category))
      );
    }

    setFixedObligations((prev) => prev.filter((o) => o.id !== obligationId));

    if (firebaseUser) {
      deleteObligationFromCloud(firebaseUser.uid, obligationId);
      if (obligation.isPaid) {
        const payingAccount = obligation.paidFromAccount || 'sampath';
        const pAcc = accounts.find((a) => a.id === payingAccount);
        if (pAcc) {
          syncAccountToCloud(firebaseUser.uid, { ...pAcc, balance: pAcc.balance + obligation.amount });
        }
        const fixTx = transactions.find((tx) => tx.isFixed && tx.category === obligation.category);
        if (fixTx) {
          deleteTransactionFromCloud(firebaseUser.uid, fixTx.id);
        }
      }
    }
  };

  const handleUpdateObligation = (
    obligationId: string,
    updated: { title: string; amount: number; dueDay: number }
  ) => {
    setFixedObligations((prev) =>
      prev.map((o) => (o.id === obligationId ? { ...o, ...updated } : o))
    );

    if (firebaseUser) {
      const ob = fixedObligations.find((o) => o.id === obligationId);
      if (ob) {
        syncObligationToCloud(firebaseUser.uid, { ...ob, ...updated });
      }
    }
  };

  const handleRestoreDefaultObligations = () => {
    setFixedObligations(INITIAL_FIXED_OBLIGATIONS);
    if (firebaseUser) {
      syncAllObligationsToCloud(firebaseUser.uid, INITIAL_FIXED_OBLIGATIONS);
    }
  };

  const handleUpdateBalance = (accountId: AccountId, newBalance: number) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === accountId ? { ...acc, balance: newBalance } : acc))
    );

    if (firebaseUser) {
      const acc = accounts.find((a) => a.id === accountId);
      if (acc) {
        syncAccountToCloud(firebaseUser.uid, { ...acc, balance: newBalance });
      }
    }
  };

  const handleDeleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    // Reverse balance effect
    setAccounts((prev) =>
      prev.map((acc) => {
        if (tx.type === 'income' && acc.id === tx.accountId) {
          return { ...acc, balance: acc.balance - tx.amount };
        }
        if (tx.type === 'expense' && acc.id === tx.accountId) {
          return { ...acc, balance: acc.balance + tx.amount };
        }
        if (tx.type === 'transfer') {
          if (acc.id === tx.accountId) {
            return { ...acc, balance: acc.balance + tx.amount };
          }
          if (tx.toAccountId && acc.id === tx.toAccountId) {
            return { ...acc, balance: acc.balance - tx.amount };
          }
        }
        return acc;
      })
    );

    // If fixed bill transaction, also unmark
    if (tx.isFixed && tx.category) {
      setFixedObligations((prev) =>
        prev.map((o) => (o.category === tx.category ? { ...o, isPaid: false } : o))
      );
    }

    setTransactions((prev) => prev.filter((t) => t.id !== id));

    if (firebaseUser) {
      deleteTransactionFromCloud(firebaseUser.uid, id);
    }
  };

  const handleResetToDefaults = () => {
    setUser(INITIAL_USER_PROFILE);
    setAccounts(INITIAL_ACCOUNTS);
    setFixedObligations(INITIAL_FIXED_OBLIGATIONS);
    setTransactions(INITIAL_TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.OBLIGATIONS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);

    if (firebaseUser) {
      seedInitialDataIfEmpty(firebaseUser.uid, {
        user: INITIAL_USER_PROFILE,
        accounts: INITIAL_ACCOUNTS,
        obligations: INITIAL_FIXED_OBLIGATIONS,
        transactions: INITIAL_TRANSACTIONS,
      });
    }
  };

  const handleQuickTap = (category: ExpenseCategory, defaultTitle: string) => {
    setExpenseModalCategory(category);
    setExpenseModalTitle(defaultTitle);
    setExpenseModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Header */}
      <Header
        user={user}
        totalLiquidNetWorth={totalLiquidNetWorth}
        currentUser={firebaseUser}
        syncStatus={syncStatus}
        onOpenIncomeModal={(type) => {
          setIncomeModalType(type || 'basic_salary');
          setIncomeModalOpen(true);
        }}
        onOpenExpenseModal={() => {
          setExpenseModalCategory('daily_expenses');
          setExpenseModalTitle('Daily Food & Living');
          setExpenseModalOpen(true);
        }}
        onOpenTransferModal={() => {
          setTransferSourceAccount('sampath');
          setTransferModalOpen(true);
        }}
        onOpenBackupModal={() => setBackupModalOpen(true)}
        onOpenFirebaseModal={() => setFirebaseModalOpen(true)}
      />

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Pay Cycle Countdown & Salary Radar */}
        <PayCycleBanner
          accounts={accounts}
          fixedObligations={fixedObligations}
          onLogSalary={() => {
            setIncomeModalType('basic_salary');
            setIncomeModalOpen(true);
          }}
          onLogOT={() => {
            setIncomeModalType('ot_amount');
            setIncomeModalOpen(true);
          }}
          onLogOtherIncome={() => {
            setIncomeModalType('other_income');
            setIncomeModalOpen(true);
          }}
        />

        {/* Bank & Cash Accounts Grid */}
        <AccountsGrid
          accounts={accounts}
          onUpdateBalance={handleUpdateBalance}
          onInitiateTransfer={(fromId) => {
            setTransferSourceAccount(fromId);
            setTransferModalOpen(true);
          }}
          onOpenIncome={() => {
            setIncomeModalType('basic_salary');
            setIncomeModalOpen(true);
          }}
        />

        {/* Quick Expense Tap Presets (Pathum's exact frequent categories) */}
        <QuickExpenseButtons onQuickLog={handleQuickTap} />

        {/* Fixed Commitments (Bike rental, Seat, Mobile rental) */}
        <FixedObligationsCard
          obligations={fixedObligations}
          accounts={accounts}
          onTogglePaid={handleToggleFixedPaid}
          onAddObligation={handleAddObligation}
          onDeleteObligation={handleDeleteObligation}
          onUpdateObligation={handleUpdateObligation}
          onRestoreDefaults={handleRestoreDefaultObligations}
        />

        {/* Monthly Spending Analytics & Daily Safe-to-Spend meter */}
        <SpendingAnalytics
          transactions={transactions}
          fixedObligations={fixedObligations}
          accounts={accounts}
        />

        {/* Full Filterable Transaction History */}
        <TransactionList
          transactions={transactions}
          accounts={accounts}
          onDeleteTransaction={handleDeleteTransaction}
        />
      </main>

      {/* Modals */}
      <SalaryLoggerModal
        isOpen={incomeModalOpen}
        onClose={() => setIncomeModalOpen(false)}
        accounts={accounts}
        fixedObligations={fixedObligations}
        defaultType={incomeModalType}
        onRecordIncome={handleRecordIncome}
      />

      <QuickExpenseModal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        accounts={accounts}
        initialCategory={expenseModalCategory}
        initialTitle={expenseModalTitle}
        onAddExpense={handleAddExpense}
      />

      <TransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        accounts={accounts}
        initialFromAccount={transferSourceAccount}
        onTransfer={handleTransfer}
      />

      <DataBackupModal
        isOpen={backupModalOpen}
        onClose={() => setBackupModalOpen(false)}
        user={user}
        accounts={accounts}
        fixedObligations={fixedObligations}
        transactions={transactions}
        onUpdateUser={setUser}
        onRestoreData={(data) => {
          setUser(data.user);
          setAccounts(data.accounts);
          setFixedObligations(data.fixedObligations);
          setTransactions(data.transactions);
        }}
        onResetToDefaults={handleResetToDefaults}
        onOpenFirebaseModal={() => setFirebaseModalOpen(true)}
      />

      <FirebaseSyncModal
        isOpen={firebaseModalOpen}
        onClose={() => setFirebaseModalOpen(false)}
        currentUser={firebaseUser}
        syncStatus={syncStatus}
        lastSyncedAt={lastSyncedAt}
        user={user}
        accounts={accounts}
        fixedObligations={fixedObligations}
        transactions={transactions}
        onForceSyncToCloud={handleForceSyncToCloud}
        onForceReloadFromCloud={handleForceReloadFromCloud}
      />
    </div>
  );
}
