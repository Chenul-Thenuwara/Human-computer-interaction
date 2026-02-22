// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock_key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock_domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock_project_id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock_bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "mock_sender_id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "mock_app_id",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "mock_measurement_id",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Analytics (optional)
let analytics: Analytics | undefined;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Auth
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

async function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

function signOut() {
  return firebaseSignOut(auth);
}

function onAuthChange(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

async function getUserRole(uid: string): Promise<string | null> {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (userDoc.exists()) {
    return userDoc.data().role ?? null;
  }
  return null;
}

/**
 * Creates a user profile document in Firestore.
 * Called after signup. role defaults to "user" unless overridden.
 */
async function createUserProfile(
  uid: string,
  email: string,
  role: "admin" | "user" = "user",
  displayName?: string
) {
  const userRef = doc(db, "users", uid);
  const existing = await getDoc(userRef);
  if (!existing.exists()) {
    await setDoc(userRef, {
      uid,
      email,
      displayName: displayName ?? email.split("@")[0],
      role,
      createdAt: serverTimestamp(),
    });
  }
}

export { app, analytics, auth, storage, db, signIn, signUp, resetPassword, signOut, onAuthChange, signInWithGoogle, getUserRole, createUserProfile };
export type { User };

