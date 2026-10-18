import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  User
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  updateDoc
} from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyDkOLYMRWfPzsQoSjQNdm9WKhN7byn2zoY",
  authDomain: "my-projects-60959.firebaseapp.com",
  projectId: "my-projects-60959",
  storageBucket: "my-projects-60959.firebasestorage.app",
  messagingSenderId: "668162934132",
  appId: "1:668162934132:web:3a1378cba39568fab85821",
  measurementId: "G-MDHP9NSZQJ"
};

// Initialize Firebase safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Authentication helper exports
export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  fbSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
};
export type { User };

// Firestore collection references helper
export const getUserDoc = (uid: string) => doc(db, "users", uid);
export const getUserSubcollection = (uid: string, sub: string) =>
  collection(db, "users", uid, sub);

export {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  updateDoc
};
