const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

const STORAGE_KEY = 'ori_auth';

interface Tokens {
  access: string;
  refresh: string;
}

function loadTokens(): Tokens | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Tokens) : null;
  } catch {
    return null;
  }
}

function saveTokens(tokens: Tokens): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getAccessToken(): string | null {
  return loadTokens()?.access ?? null;
}

export function getRefreshToken(): string | null {
  return loadTokens()?.refresh ?? null;
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}

async function authPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new AuthError(res.status, detail);
  }
  return res.json() as Promise<T>;
}

export class AuthError extends Error {
  status: number;
  detail: Record<string, unknown>;

  constructor(status: number, detail: Record<string, unknown>) {
    super(`Auth error ${status}`);
    this.status = status;
    this.detail = detail;
  }
}

export async function register(
  email: string,
  password1: string,
  password2: string,
): Promise<void> {
  const data = await authPost<{ access: string; refresh: string }>(
    '/api/auth/registration/',
    { email, password1, password2 },
  );
  saveTokens({ access: data.access, refresh: data.refresh });
}

export async function login(email: string, password: string): Promise<void> {
  const data = await authPost<{ access: string; refresh: string }>(
    '/api/auth/login/',
    { email, password },
  );
  saveTokens({ access: data.access, refresh: data.refresh });
}

export async function logout(): Promise<void> {
  const refresh = getRefreshToken();
  if (refresh) {
    try {
      await authPost('/api/auth/logout/', { refresh });
    } catch {
      // best-effort — clear locally regardless
    }
  }
  clearTokens();
}

export async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const data = await authPost<{ access: string }>(
      '/api/auth/token/refresh/',
      { refresh },
    );
    const tokens = loadTokens();
    if (tokens) {
      saveTokens({ ...tokens, access: data.access });
    }
    return data.access;
  } catch {
    clearTokens();
    return null;
  }
}
