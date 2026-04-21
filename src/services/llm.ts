import type {
  StressAnalysis,
  VitalSigns,
  InterventionType,
  RoutingResult,
  InterventionContent,
  SessionPayload,
  CheckInRecord,
} from '../types';
import { clearTokens, getAccessToken, refreshAccessToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    'VITE_API_BASE_URL is not set. Point it at the Django backend (e.g. http://localhost:8000).',
  );
}

async function authedFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const attempt = (token: string | null) =>
    fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {}),
      },
    });

  let response = await attempt(getAccessToken());

  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      clearTokens();
      throw new Error('Session expired. Please log in again.');
    }
    response = await attempt(newToken);
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Backend error (${response.status}): ${detail}`);
  }

  return (await response.json()) as T;
}

function post<T>(path: string, body: unknown): Promise<T> {
  return authedFetch<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export async function assessFollowUp(
  userCheckin: string,
  vitals: VitalSigns,
): Promise<{ needed: boolean; question?: string }> {
  return post('/api/llm/follow-up-needed', { userCheckin, vitals });
}

export async function getStressAnalysis(
  checkinResponse: string,
  vitals: VitalSigns,
  followUpQuestion?: string,
  followUpResponse?: string,
): Promise<StressAnalysis> {
  return post('/api/llm/analyze-stress', {
    checkinResponse,
    vitals,
    followUpQuestion,
    followUpResponse,
  });
}

export async function routeInterventionWithLLM(
  analysis: StressAnalysis,
  vitals: VitalSigns,
): Promise<RoutingResult> {
  return post('/api/llm/route-intervention', { analysis, vitals });
}

export async function generateInterventionIntro(
  analysis: StressAnalysis,
  intervention: InterventionType,
  followUpResponse?: string,
): Promise<InterventionContent | undefined> {
  try {
    const content = await post<InterventionContent | null>(
      '/api/llm/generate-intro',
      { analysis, intervention, followUpResponse },
    );
    return content ?? undefined;
  } catch (e) {
    console.error('Failed to generate intervention intro:', e);
    return undefined;
  }
}

export async function generateSessionInsight(
  analysis: StressAnalysis,
  intervention: InterventionType,
  userResponse: string,
  followUpResponse?: string,
): Promise<string> {
  try {
    const { insight } = await post<{ insight: string }>(
      '/api/llm/generate-insight',
      { analysis, intervention, userResponse, followUpResponse },
    );
    return insight;
  } catch (e) {
    console.error('Failed to generate session insight:', e);
    return '';
  }
}

export async function saveSession(payload: SessionPayload): Promise<{ id: number; created_at: string }> {
  return post('/api/history/save', payload);
}

export async function fetchHistory(): Promise<CheckInRecord[]> {
  return authedFetch<CheckInRecord[]>('/api/history/');
}
