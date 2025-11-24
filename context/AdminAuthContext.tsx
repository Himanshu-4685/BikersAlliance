'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase-client';
import bcrypt from 'bcryptjs';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'editor';
  profile_image_url?: string | null;
  phone?: string | null;
  is_active: boolean;
  created_at: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<AdminUser>) => Promise<{ success: boolean; error?: string }>;
  checkPermission: (requiredRole: string) => boolean;
  logAction: (action: string, tableName?: string, recordId?: string, details?: any) => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Initialize admin session
  useEffect(() => {
    checkAdminSession();
  }, []);

  const checkAdminSession = async () => {
    try {
      setIsLoading(true);
      
      // Check if there's a valid session token in localStorage
      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        setAdmin(null);
        return;
      }

      // Verify token and get admin details
      const response = await fetch('/api/admin/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.ok) {
        const { admin: adminData } = await response.json();
        setAdmin(adminData);
      } else {
        localStorage.removeItem('admin_token');
        setAdmin(null);
      }
    } catch (err) {
      console.error('Error checking admin session:', err);
      setError('Failed to verify admin session');
      localStorage.removeItem('admin_token');
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAdmin(data.admin);
        localStorage.setItem('admin_token', data.token);
        
        // Log the login action
        await logAction('LOGIN');
        
        return { success: true };
      } else {
        setError(data.error || 'Login failed');
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      // Log the logout action before clearing session
      if (admin) {
        await logAction('LOGOUT');
      }

      localStorage.removeItem('admin_token');
      setAdmin(null);
      setError(null);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      return { success: false, error: errorMessage };
    }
  };

  const updateProfile = async (data: Partial<AdminUser>): Promise<{ success: boolean; error?: string }> => {
    if (!admin) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      setIsLoading(true);
      
      const response = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setAdmin(prev => prev ? { ...prev, ...result.admin } : null);
        await logAction('UPDATE_PROFILE', 'admin', admin.id, data);
        return { success: true };
      } else {
        setError(result.error || 'Failed to update profile');
        return { success: false, error: result.error || 'Failed to update profile' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const checkPermission = (requiredRole: string): boolean => {
    if (!admin || !admin.is_active) return false;
    
    const roleHierarchy = {
      'super_admin': 3,
      'admin': 2,
      'editor': 1
    };

    const adminLevel = roleHierarchy[admin.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;
    
    return adminLevel >= requiredLevel;
  };

  const logAction = async (action: string, tableName?: string, recordId?: string, details?: any): Promise<void> => {
    if (!admin) return;

    try {
      await fetch('/api/admin/audit-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({
          action,
          table_name: tableName,
          record_id: recordId,
          new_values: details
        })
      });
    } catch (err) {
      console.error('Failed to log admin action:', err);
    }
  };

  const value = {
    admin,
    isLoading,
    error,
    login,
    logout,
    updateProfile,
    checkPermission,
    logAction
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}