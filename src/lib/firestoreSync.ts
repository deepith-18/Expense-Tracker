import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { Transaction, Category, Account, Friend, UserProfile } from '../types';

export interface FirestoreSettingsData {
  userProfile?: UserProfile;
  categories?: Category[];
  accounts?: Account[];
  friends?: Friend[];
  updatedAt?: number;
}

/**
 * Save or update a single transaction in Firestore under `users/{uid}/transactions/{tx.id}`
 */
export async function saveTransactionToFirestore(uid: string, tx: Transaction): Promise<void> {
  const firestore = db;
  if (!isFirebaseConfigured || !firestore || !uid) return;
  try {
    const docRef = doc(firestore, 'users', uid, 'transactions', tx.id);
    await setDoc(docRef, {
      ...tx,
      updatedAt: tx.updatedAt || Date.now(),
    }, { merge: true });
  } catch (err) {
    console.error('Failed to save transaction to Firestore:', err);
    throw err;
  }
}

/**
 * Save multiple transactions in Firestore using a batch operation
 */
export async function saveMultipleTransactionsToFirestore(uid: string, txs: Transaction[]): Promise<void> {
  const firestore = db;
  if (!isFirebaseConfigured || !firestore || !uid || txs.length === 0) return;
  try {
    // Firestore batches allow up to 500 operations per batch
    const batchSize = 450;
    for (let i = 0; i < txs.length; i += batchSize) {
      const chunk = txs.slice(i, i + batchSize);
      const batch = writeBatch(firestore);
      chunk.forEach((tx) => {
        const docRef = doc(firestore, 'users', uid, 'transactions', tx.id);
        batch.set(docRef, {
          ...tx,
          updatedAt: tx.updatedAt || Date.now(),
        }, { merge: true });
      });
      await batch.commit();
    }
  } catch (err) {
    console.error('Failed to batch save transactions to Firestore:', err);
    throw err;
  }
}

/**
 * Delete a transaction from Firestore
 */
export async function deleteTransactionFromFirestore(uid: string, txId: string): Promise<void> {
  const firestore = db;
  if (!isFirebaseConfigured || !firestore || !uid) return;
  try {
    const docRef = doc(firestore, 'users', uid, 'transactions', txId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Failed to delete transaction from Firestore:', err);
    throw err;
  }
}

/**
 * Save user profile, categories, accounts, and friends settings in Firestore
 */
export async function saveSettingsToFirestore(
  uid: string,
  settings: FirestoreSettingsData
): Promise<void> {
  const firestore = db;
  if (!isFirebaseConfigured || !firestore || !uid) return;
  try {
    const docRef = doc(firestore, 'users', uid, 'settings', 'data');
    await setDoc(docRef, {
      ...settings,
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (err) {
    console.error('Failed to save settings to Firestore:', err);
    throw err;
  }
}

/**
 * Real-time listener for user's transactions and settings in Firestore
 */
export function subscribeToUserFirestore(
  uid: string,
  callbacks: {
    onTransactionsChange: (transactions: Transaction[]) => void;
    onSettingsChange: (settings: FirestoreSettingsData) => void;
    onError?: (error: Error) => void;
  }
): Unsubscribe {
  const firestore = db;
  if (!isFirebaseConfigured || !firestore || !uid) {
    return () => {};
  }

  const txsColRef = collection(firestore, 'users', uid, 'transactions');
  const settingsDocRef = doc(firestore, 'users', uid, 'settings', 'data');

  const unsubscribeTxs = onSnapshot(
    txsColRef,
    (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Transaction);
      });
      // Sort descending by date / createdAt
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt);
      callbacks.onTransactionsChange(items);
    },
    (error) => {
      console.error('Firestore transactions snapshot error:', error);
      if (callbacks.onError) callbacks.onError(error);
    }
  );

  const unsubscribeSettings = onSnapshot(
    settingsDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callbacks.onSettingsChange(snapshot.data() as FirestoreSettingsData);
      }
    },
    (error) => {
      console.error('Firestore settings snapshot error:', error);
      if (callbacks.onError) callbacks.onError(error);
    }
  );

  return () => {
    unsubscribeTxs();
    unsubscribeSettings();
  };
}

