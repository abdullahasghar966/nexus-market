/**
 * Firebase Admin SDK — SERVER ONLY. Never import from a client component.
 * Lazily initialized so the app builds without credentials; getters throw
 * only when actually invoked at runtime without configuration.
 */
import {
  cert,
  getApps,
  getApp,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function getAdminApp(): App {
  if (getApps().length > 0) return getApp();

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  // Private keys are stored with escaped newlines in env files.
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin credentials are missing. Set FIREBASE_ADMIN_CLIENT_EMAIL, " +
        "FIREBASE_ADMIN_PRIVATE_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID. See .env.example.",
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export function adminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function adminDb(): Firestore {
  return getFirestore(getAdminApp());
}
