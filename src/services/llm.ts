import type {
  StressAnalysis,
  VitalSigns,
  InterventionType,
  RoutingResult,
  InterventionContent,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    'VITE_API_BASE_URL is not set. Point it at the Django backend (e.g. http://localhost:8000).',
  );
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Backend error (${response.status}): ${detail}`);
  }

  return (await response.json()) as T;
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
