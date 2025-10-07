'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Define a simple User type to replace the Supabase one
interface User {
  id: string;
  email: string;
  fullName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on component mount
  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
      try {
        // Check for existing session using cookies/localStorage
        const token = localStorage.getItem('auth-token');
        if (token) {
          // This would be replaced with your actual API call to validate the token
          // For now we'll simulate a user being logged in
          setUser({
            id: 'simulated-user-id',
            email: 'user@example.com',
          });
        }
      } catch (err) {
        console.error('Unexpected error checking auth state:', err);
        setError('Failed to authenticate user');
      } finally {
        setIsLoading(false);
      }
    };

    // Check for authentication changes (replace with your actual implementation)
    const handleAuthChange = () => {
      // You could add an event listener here for auth changes
      // For example, listening to storage changes if you're using localStorage
    };

    checkUser();
    window.addEventListener('storage', handleAuthChange);

    // Clean up subscription on unmount
    return () => {
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Replace with actual API call to your authentication endpoint
      // Example: const response = await axios.post('/api/auth/login', { email, password });
      
      // For demonstration, we'll simulate a successful login
      if (email && password) {
        // Store authentication token
        localStorage.setItem('auth-token', 'simulated-auth-token');
        
        const userData: User = {
          id: 'simulated-user-id',
          email: email,
          fullName: 'Simulated User'
        };
        
        setUser(userData);
        return { success: true };
      } else {
        const errorMessage = 'Invalid email or password';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
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
      // Replace with actual API call to your registration endpoint
      // Example: const response = await axios.post('/api/auth/register', { email, password, fullName });
      
      // For demonstration, we'll simulate a successful registration
      if (email && password && fullName) {
        // Store authentication token
        localStorage.setItem('auth-token', 'simulated-auth-token');
        
        const userData: User = {
          id: 'new-user-id',
          email: email,
          fullName: fullName
        };
        
        setUser(userData);
        return { success: true };
      } else {
        const errorMessage = 'Please fill in all required fields';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
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
      // Replace with actual API call if needed
      // Example: await axios.post('/api/auth/logout');
      
      // Remove authentication token
      localStorage.removeItem('auth-token');
      
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
