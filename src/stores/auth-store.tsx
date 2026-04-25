import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type { SessionPayload } from '../types/api';
import * as authService from '../services/auth';

type AuthState = {
  status: 'authenticated' | 'anonymous';
  session: SessionPayload | null;
  signIn: (password: string) => ReturnType<typeof authService.login>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthState['status']>(() =>
    authService.hasToken() ? 'authenticated' : 'anonymous',
  );
  const [session, setSession] = useState<SessionPayload | null>(null);

  async function refreshSession() {
    if (!authService.hasToken()) {
      setStatus('anonymous');
      setSession(null);
      return;
    }

    // Trust the stored token first so newly-created sessions can enter immediately
    // even if the backend takes a moment to recognize the token on auth.me.
    setStatus('authenticated');

    try {
      const result = await authService.restoreSession();
      if (result.ok) {
        setSession(result.data);
        setStatus('authenticated');
      } else {
        setSession(null);
        setStatus('anonymous');
      }
    } catch (error) {
      console.error('Falha ao restaurar sessao:', error);
      setSession(null);
      setStatus('anonymous');
    }
  }

  async function signOut() {
    await authService.logout();
    setSession(null);
    setStatus('anonymous');
  }

  async function signIn(password: string) {
    const result = await authService.login(password);

    if (result.ok && result.data?.token) {
      setSession(result.data);
      setStatus('authenticated');
    } else if (!result.ok) {
      setSession(null);
      setStatus('anonymous');
    }

    return result;
  }

  useEffect(() => {
    if (authService.hasToken()) {
      void refreshSession();
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      status,
      session,
      signIn,
      signOut,
      refreshSession,
    }),
    [session, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }

  return context;
}
