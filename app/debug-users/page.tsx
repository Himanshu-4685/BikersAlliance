'use client';

import { AuthProvider } from '@/context/AuthContext.supabase';
import UserDebugTool from '@/components/debug/UserDebugTool';

export default function UserDebugPage() {
  return (
    <AuthProvider>
      <UserDebugTool />
    </AuthProvider>
  );
}