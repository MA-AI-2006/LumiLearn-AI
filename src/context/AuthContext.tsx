import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  fbSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User
} from '../services/firebase';
import { storage } from '../services/storage';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  intendedDestination: string | null;
  setIntendedDestination: (path: string | null) => void;
  signInEmail: (e: string, p: string) => Promise<void>;
  signUpEmail: (e: string, p: string, name: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signInAsGuest: () => void;
  resetPassword: (e: string) => Promise<void>;
  signOut: () => Promise<void>;
  guestMigrationCount: number | null;
  clearMigrationNotice: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [intendedDestination, setIntendedDestinationState] = useState<string | null>(null);
  const [guestMigrationCount, setGuestMigrationCount] = useState<number | null>(null);

  const setIntendedDestination = useCallback((path: string | null) => {
    setIntendedDestinationState(path);
  }, []);

  useEffect(() => {
    // Check if previously signed in as guest
    const guestStored = localStorage.getItem('lumilearn_is_guest');
    if (guestStored === 'true') {
      const guestId = localStorage.getItem('lumilearn_guest_uid') || 'guest_' + Date.now();
      setCurrentUser({
        uid: guestId,
        displayName: 'Student Guest',
        email: 'student@lumilearn.ai',
        isAnonymous: true
      } as any);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        localStorage.removeItem('lumilearn_is_guest');
        // Check if there are local guest items to migrate
        try {
          const migrated = await storage.migrateGuestDataToUser(user.uid);
          if (migrated > 0) {
            setGuestMigrationCount(migrated);
          }
        } catch (e) {
          console.warn('Guest migration notice error:', e);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInEmail = async (email: string, pass: string) => {
    localStorage.removeItem('lumilearn_is_guest');
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpEmail = async (email: string, pass: string, name: string) => {
    localStorage.removeItem('lumilearn_is_guest');
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user && name) {
      await updateProfile(res.user, { displayName: name });
    }
  };

  const signInGoogle = async () => {
    localStorage.removeItem('lumilearn_is_guest');
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signInAsGuest = () => {
    let guestId = localStorage.getItem('lumilearn_guest_uid');
    if (!guestId) {
      guestId = 'guest_' + Date.now();
      localStorage.setItem('lumilearn_guest_uid', guestId);
    }
    localStorage.setItem('lumilearn_is_guest', 'true');
    setCurrentUser({
      uid: guestId,
      displayName: 'Student Guest',
      email: 'guest@lumilearn.ai',
      isAnonymous: true
    } as any);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const signOut = async () => {
    localStorage.removeItem('lumilearn_is_guest');
    try {
      await fbSignOut(auth);
    } catch (e) {
      // Ignore if was local guest
    }
    setCurrentUser(null);
  };

  const clearMigrationNotice = () => setGuestMigrationCount(null);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      currentUser,
      loading,
      intendedDestination,
      setIntendedDestination,
      signInEmail,
      signUpEmail,
      signInGoogle,
      signInAsGuest,
      resetPassword,
      signOut,
      guestMigrationCount,
      clearMigrationNotice
    }),
    [
      currentUser,
      loading,
      intendedDestination,
      setIntendedDestination,
      guestMigrationCount
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
