import type { Message, StressAnalysis, VitalSigns, InterventionType, RoutingResult, LLMFlag, InterventionContent, LLMProvider } from '../types';
import { ORI_SYSTEM_PROMPT, buildFollowUpPrompt, buildAnalysisPrompt, buildRoutingPrompt, buildInterventionIntroPrompt, buildSessionInsightPrompt } from './prompts';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';

const API_KEY_STORAGE_KEY = 'ori_api_key';
const LLM_PROVIDER_STORAGE_KEY = 'ori_llm_provider';

export function getStoredApiKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

export function getStoredLLMProvider(): LLMProvider | null {
  const stored = localStorage.getItem(LLM_PROVIDER_STORAGE_KEY);
  return (stored === 'gemini' || stored === 'openai') ? stored : null;
}

export function setLLMConfig(provider: LLMProvider, apiKey: string): void {
  localStorage.setItem(LLM_PROVIDER_STORAGE_KEY, provider);
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
}

export function clearLLMConfig(): void {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
  localStorage.removeItem(LLM_PROVIDER_STORAGE_KEY);
}

function getApiKey(): string {
  const key = getStoredApiKey();
  if (!key) {
    throw new Error('API key not configured. Please set up your LLM provider.');
  }
  return key;
}

function getLLMProvider(): LLMProvider {
  const provider = getStoredLLMProvider();
  if (!provider) {
    throw new Error('LLM provider not configured. Please set up your LLM provider.');
  }
  return provider;
}

function getApiUrl(): string {
  const provider = getLLMProvider();
  return provider === 'gemini' ? GEMINI_API_URL : OPENAI_API_URL;
}

function getModel(): string {
  const provider = getLLMProvider();
  return provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini';
}

async function callLLM(messages: Message[], jsonMode = false): Promise<string> {
  const apiKey = getApiKey();
  const apiUrl = getApiUrl();
  const model = getModel();

  const body: Record<string, unknown> = {
    model: model,
    messages,
    temperature: 0.7,
    max_tokens: 1500,
  };

  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function streamLLM(
  messages: Message[],
  onChunk: (text: string) => void
): Promise<string> {
  const apiKey = getApiKey();
  const apiUrl = getApiUrl();
  const model = getModel();

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages,
      temperature: 0.7,
      max_tokens: 500,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));

    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') continue;

      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices[0]?.delta?.content;
        if (content) {
          fullText += content;
          onChunk(fullText);
        }
      } catch {
        // Skip malformed chunks
      }
    }
  }

  return fullText;
}

const VALID_LLM_FLAGS: LLMFlag[] = ['overwhelm', 'rumination', 'fatigue', 'tension', 'neutral'];
const VALID_INTERVENTIONS: InterventionType[] = ['breathing', 'grounding', 'reframe', 'journaling', 'movement', 'rehearsal'];

export async function assessFollowUp(
  userCheckin: string,
  vitals: VitalSigns
): Promise<{ needed: boolean; question?: string }> {
  const messages: Message[] = [
    { role: 'system', content: ORI_SYSTEM_PROMPT + '\n\n' + buildFollowUpPrompt(vitals) },
    { role: 'user', content: userCheckin },
  ];

  const response = await callLLM(messages, true);

  try {
    const result = JSON.parse(response) as { needed: boolean; question?: string };

    if (typeof result.needed !== 'boolean') {
      throw new Error('Invalid needed field');
    }

    if (result.needed && (!result.question || !result.question.trim())) {
      throw new Error('Follow-up needed but question not provided');
    }

    return result;
  } catch (e) {
    console.error('Failed to parse follow-up assessment:', response, e);
    throw new Error('Failed to assess follow-up need. Please try again.');
  }
}

export async function getStressAnalysis(
  checkinResponse: string,
  vitals: VitalSigns,
  followUpQuestion?: string,
  followUpResponse?: string
): Promise<StressAnalysis> {
  const messages: Message[] = [
    { role: 'system', content: ORI_SYSTEM_PROMPT + '\n\n' + buildAnalysisPrompt(vitals) },
    { role: 'user', content: checkinResponse },
  ];

  // Only add follow-up turns if both question and response are provided
  if (followUpQuestion && followUpResponse) {
    messages.push(
      { role: 'assistant', content: followUpQuestion },
      { role: 'user', content: followUpResponse }
    );
  }

  const response = await callLLM(messages, true);

  try {
    const analysis = JSON.parse(response) as StressAnalysis;

    if (
      !analysis.reflection ||
      !analysis.transitionLine ||
      !analysis.llmFlag ||
      !analysis.interventionReason ||
      !analysis.reframePrompt ||
      !analysis.prescriptionQuote ||
      !analysis.tip
    ) {
      throw new Error('Missing required fields in analysis');
    }

    if (!VALID_LLM_FLAGS.includes(analysis.llmFlag)) {
      analysis.llmFlag = 'neutral';
    }

    return analysis;
  } catch (e) {
    console.error('Failed to parse LLM analysis:', response, e);
    throw new Error('Failed to parse stress analysis. Please try again.');
  }
}

export async function routeInterventionWithLLM(
  analysis: StressAnalysis,
  vitals: VitalSigns
): Promise<RoutingResult> {
  const messages: Message[] = [
    { role: 'system', content: ORI_SYSTEM_PROMPT },
    { role: 'user', content: buildRoutingPrompt(analysis, vitals) },
  ];

  const response = await callLLM(messages, true);

  try {
    const result = JSON.parse(response) as RoutingResult;

    // Validate interventions
    if (!VALID_INTERVENTIONS.includes(result.primary)) {
      throw new Error(`Invalid primary intervention: ${result.primary}`);
    }
    if (!VALID_INTERVENTIONS.includes(result.alternative)) {
      throw new Error(`Invalid alternative intervention: ${result.alternative}`);
    }

    return result;
  } catch (e) {
    console.error('Failed to parse routing response:', response, e);
    throw new Error('Failed to determine best intervention. Please try again.');
  }
}

export async function generateInterventionIntro(
  analysis: StressAnalysis,
  intervention: InterventionType,
  followUpResponse?: string
): Promise<InterventionContent | undefined> {
  const messages: Message[] = [
    { role: 'system', content: ORI_SYSTEM_PROMPT },
    { role: 'user', content: buildInterventionIntroPrompt(analysis, intervention, followUpResponse) },
  ];

  try {
    const response = await callLLM(messages, true);
    const content = JSON.parse(response) as InterventionContent;

    if (!content.introText || !content.completionText) {
      throw new Error('Missing intro or completion text');
    }

    return content;
  } catch (e) {
    console.error('Failed to generate intervention intro:', e);
    return undefined;
  }
}

export async function generateSessionInsight(
  analysis: StressAnalysis,
  intervention: InterventionType,
  userResponse: string,
  followUpResponse?: string
): Promise<string> {
  const messages: Message[] = [
    { role: 'system', content: ORI_SYSTEM_PROMPT },
    { role: 'user', content: buildSessionInsightPrompt(analysis, intervention, userResponse, followUpResponse) },
  ];

  try {
    const response = await callLLM(messages, false);
    return response.trim();
  } catch (e) {
    console.error('Failed to generate session insight:', e);
    return '';
  }
}
