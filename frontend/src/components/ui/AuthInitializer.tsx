'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Restores auth session from localStorage on app load
export function AuthInitializer() {
  const { restoreSession } = useAuth();
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);
  return null;
}
