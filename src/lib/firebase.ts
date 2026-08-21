import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

// Firebase web app configuration
// These values come from Firebase Console → Project Settings → Your apps → Web app
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'velora-store-5f44c.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'velora-store-5f44c',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'velora-store-5f44c.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account', // Always show account picker
});

/**
 * Sign in with Google popup and return the Firebase user + ID token
 */
export async function signInWithGooglePopup(): Promise<{
  user: FirebaseUser;
  idToken: string;
}> {
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  return { user: result.user, idToken };
}

/**
 * Get a fresh ID token for the currently signed-in user.
 * Returns null if no user is signed in.
 */
export async function getFirebaseIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(/* forceRefresh */ true);
}

/**
 * Sign out of Firebase
 */
export async function firebaseSignOut(): Promise<void> {
  await signOut(auth);
}

/**
 * Listen for auth state changes
 */
export function onFirebaseAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export type { FirebaseUser };
