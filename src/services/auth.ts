import { apiRequest } from './api';
import type { ApiResult, SessionPayload } from '../types/api';

const TOKEN_KEY = 'rm_token';
const EXPIRES_KEY = 'rm_expires_at';

export async function login(password: string) {
  const result = await apiRequest('auth.login', { password });

  if (result.ok) {
    persistSession(result);
  }

  return result;
}

export async function restoreSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return { ok: false } as ApiResult<SessionPayload>;
  }

  const result = await apiRequest('auth.me');

  if (result.ok) {
    persistSession(result);
    return result;
  }

  clearSession();
  return result;
}

export async function logout() {
  try {
    await apiRequest('auth.logout');
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  } finally {
    clearSession();
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRES_KEY);
}

export function hasToken() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

function persistSession(result: ApiResult<SessionPayload>) {
  if (!result.ok || !result.data?.token) {
    return;
  }

  localStorage.setItem(TOKEN_KEY, result.data.token);
  localStorage.setItem(EXPIRES_KEY, String(result.data.expiresAt ?? ''));
}
