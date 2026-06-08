/**
 * Firebase client SDK singleton (browser + RSC/SSR-safe to import).
 *
 * Services are only instantiated when real NEXT_PUBLIC_* config is present.
 * Without it, `auth`/`db`/`storage` are null and every consumer guards on
 * `isFirebaseConfigured`, so the app builds and prerenders cleanly with no keys.
 */
import {
  initializeApp,
  getApps,
  getApp,
  type FirebaseApp,
  type FirebaseOptions,
} from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** True when real (non-placeholder) Firebase config is present. */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId,
);

export const firebaseApp: FirebaseApp | undefined = isFirebaseConfigured
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : undefined;

export const auth: Auth = (
  isFirebaseConfigured && firebaseApp ? getAuth(firebaseApp) : null
) as Auth;

export const db: Firestore = (
  isFirebaseConfigured && firebaseApp ? getFirestore(firebaseApp) : null
) as Firestore;

export const storage: FirebaseStorage = (
  isFirebaseConfigured && firebaseApp ? getStorage(firebaseApp) : null
) as FirebaseStorage;

export const googleProvider = new GoogleAuthProvider();
