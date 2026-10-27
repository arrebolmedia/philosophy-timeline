'use client';

import { SessionProvider } from 'next-auth/react';
import { BASE_PATH } from '@/lib/basePath';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // El cliente de NextAuth no ve NEXTAUTH_URL (no es NEXT_PUBLIC), así que sin
  // esto consultaría /api/auth/* en la raíz del dominio en vez de bajo el basePath.
  // Este prop también fija la ruta que usan signIn() y signOut().
  return <SessionProvider basePath={`${BASE_PATH}/api/auth`}>{children}</SessionProvider>;
}
