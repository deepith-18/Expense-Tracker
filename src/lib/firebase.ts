import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.apiKey !== 'YOUR_API_KEY'
);

let app = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);

    // Enable offline persistence
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support all of the features required to enable persistence');
      }
    });
  } catch (err) {
    console.warn('Firebase initialization error, fallback to local offline mode:', err);
  }
}

export { auth, db };

export async function loginWithGoogle(): Promise<{ user: User | null; error?: string }> {
  if (!isFirebaseConfigured || !auth) {
    return {
      user: {
        uid: 'demo-google-user',
        displayName: 'Deepith N',
        email: 'deepithdeekshith@gmail.com',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop',
      } as unknown as User,
    };
  }

  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return { user: result.user };
  } catch (error: unknown) {
    const err = error as Error;
    return { user: null, error: err.message };
  }
}

export async function logOut(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
}

export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  if (!isFirebaseConfigured || !auth) {
    // Demo guest mode
    callback({
      uid: 'demo-user-1',
      displayName: 'Deepith N',
      email: 'deepithdeekshith@gmail.com',
    } as unknown as User);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
}
