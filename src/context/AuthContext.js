import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  getIdToken,
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email, password, confirmPassword) => {
    setIsLoading(true);
    try {
      if (password !== confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }
      await createUserWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const getIdToken = async () => {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    throw new Error('No user logged in');
  };

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
    signInWithGoogle,
    getIdToken,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
