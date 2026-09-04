import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { BankAccount, FixedObligation, Transaction, UserProfile } from '../types';

export const firebaseConfig = firebaseConfigJson;

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Use custom firestoreDatabaseId if specified in config
export const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? firebaseConfig.firestoreDatabaseId
    : undefined
);

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
}

export async function logOutFromFirebase() {
  return signOut(auth);
}

export async function ensureAuthenticatedUser(): Promise<FirebaseUser | null> {
  if (auth.currentUser) return auth.currentUser;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.warn('Anonymous sign-in could not be completed (offline or restricted):', err);
    return null;
  }
}

/**
 * Real-time listeners for all user data collections
 */
export function subscribeToUserData(
  userId: string,
  callbacks: {
    onUserLoaded: (profile: UserProfile) => void;
    onAccountsLoaded: (accounts: BankAccount[]) => void;
    onObligationsLoaded: (obligations: FixedObligation[]) => void;
    onTransactionsLoaded: (transactions: Transaction[]) => void;
    onError: (err: Error) => void;
  }
) {
  const unsubscribers: (() => void)[] = [];

  // 1. Profile Document
  const profileDocRef = doc(db, 'users', userId);
  const unsubProfile = onSnapshot(
    profileDocRef,
    (snap) => {
      if (snap.exists()) {
        callbacks.onUserLoaded(snap.data() as UserProfile);
      }
    },
    (err) => callbacks.onError(err)
  );
  unsubscribers.push(unsubProfile);

  // 2. Accounts Collection
  const accountsColRef = collection(db, 'users', userId, 'accounts');
  const unsubAccounts = onSnapshot(
    accountsColRef,
    (snap) => {
      if (!snap.empty) {
        const list = snap.docs.map((d) => d.data() as BankAccount);
        callbacks.onAccountsLoaded(list);
      }
    },
    (err) => callbacks.onError(err)
  );
  unsubscribers.push(unsubAccounts);

  // 3. Fixed Obligations Collection
  const obligationsColRef = collection(db, 'users', userId, 'obligations');
  const unsubObligations = onSnapshot(
    obligationsColRef,
    (snap) => {
      const list = snap.docs.map((d) => d.data() as FixedObligation);
      callbacks.onObligationsLoaded(list);
    },
    (err) => callbacks.onError(err)
  );
  unsubscribers.push(unsubObligations);

  // 4. Transactions Collection
  const txColRef = collection(db, 'users', userId, 'transactions');
  const unsubTx = onSnapshot(
    txColRef,
    (snap) => {
      const list = snap.docs.map((d) => d.data() as Transaction);
      // Sort newest date first
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      callbacks.onTransactionsLoaded(list);
    },
    (err) => callbacks.onError(err)
  );
  unsubscribers.push(unsubTx);

  return () => {
    unsubscribers.forEach((fn) => fn());
  };
}

/**
 * Cloud persistence write operations
 */
export async function syncUserProfileToCloud(userId: string, profile: UserProfile) {
  const ref = doc(db, 'users', userId);
  await setDoc(ref, { ...profile, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function syncAccountToCloud(userId: string, account: BankAccount) {
  const ref = doc(db, 'users', userId, 'accounts', account.id);
  await setDoc(ref, account, { merge: true });
}

export async function syncAllAccountsToCloud(userId: string, accounts: BankAccount[]) {
  const batch = writeBatch(db);
  accounts.forEach((acc) => {
    const ref = doc(db, 'users', userId, 'accounts', acc.id);
    batch.set(ref, acc, { merge: true });
  });
  await batch.commit();
}

export async function syncObligationToCloud(userId: string, obligation: FixedObligation) {
  const ref = doc(db, 'users', userId, 'obligations', obligation.id);
  await setDoc(ref, obligation, { merge: true });
}

export async function syncAllObligationsToCloud(userId: string, obligations: FixedObligation[]) {
  const batch = writeBatch(db);
  // Also clear any deleted obligations by writing current
  obligations.forEach((obl) => {
    const ref = doc(db, 'users', userId, 'obligations', obl.id);
    batch.set(ref, obl);
  });
  await batch.commit();
}

export async function deleteObligationFromCloud(userId: string, obligationId: string) {
  const ref = doc(db, 'users', userId, 'obligations', obligationId);
  await deleteDoc(ref);
}

export async function syncTransactionToCloud(userId: string, transaction: Transaction) {
  const ref = doc(db, 'users', userId, 'transactions', transaction.id);
  await setDoc(ref, transaction, { merge: true });
}

export async function deleteTransactionFromCloud(userId: string, transactionId: string) {
  const ref = doc(db, 'users', userId, 'transactions', transactionId);
  await deleteDoc(ref);
}

/**
 * Bootstrap or full sync from local state into Firebase Firestore
 */
export async function seedInitialDataIfEmpty(
  userId: string,
  initial: {
    user: UserProfile;
    accounts: BankAccount[];
    obligations: FixedObligation[];
    transactions: Transaction[];
  }
) {
  try {
    const accountsColRef = collection(db, 'users', userId, 'accounts');
    const existingAccounts = await getDocs(accountsColRef);

    if (existingAccounts.empty) {
      console.log('Bootstrapping Firestore with initial data for user:', userId);
      const batch = writeBatch(db);

      // User profile
      const userRef = doc(db, 'users', userId);
      batch.set(userRef, { ...initial.user, updatedAt: new Date().toISOString() });

      // Accounts
      initial.accounts.forEach((acc) => {
        const accRef = doc(db, 'users', userId, 'accounts', acc.id);
        batch.set(accRef, acc);
      });

      // Obligations
      initial.obligations.forEach((obl) => {
        const oblRef = doc(db, 'users', userId, 'obligations', obl.id);
        batch.set(oblRef, obl);
      });

      // Transactions
      initial.transactions.forEach((tx) => {
        const txRef = doc(db, 'users', userId, 'transactions', tx.id);
        batch.set(txRef, tx);
      });

      await batch.commit();
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error during Firestore bootstrap:', err);
    return false;
  }
}
