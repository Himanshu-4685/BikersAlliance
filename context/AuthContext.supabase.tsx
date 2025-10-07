'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import supabase from '@/lib/supabase';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on component mount
  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
      try {
        const { user, error } = await getCurrentUser();
        if (error) {
          console.error('Error checking auth state:', error);
          setError(error.message);
        } else {
          setUser(user);
        }
      } catch (err) {
        console.error('Unexpected error checking auth state:', err);
        setError('Failed to authenticate user');
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const { user, error } = await signIn(email, password);

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      setUser(user);
      return { success: true };
    } catch (err) {
      const errorMessage = 'Failed to sign in';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const { user, error } = await signUp(email, password, fullName);

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      setUser(user);
      return { success: true };
    } catch (err) {
      const errorMessage = 'Failed to create account';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await signOut();

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      setUser(null);
      return { success: true };
    } catch (err) {
      const errorMessage = 'Failed to sign out';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}