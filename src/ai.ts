import type { Cat } from './store';

export const API = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
// Identifies the app to our server (set the same value as APP_KEY in Netlify).
const APP_KEY = 'nai_2fe1587a7b743bca6647c099';

export type ScanResult = {
  name: string;
  kcal: number; protein: number; carbs: number; fat: number;
  confidence: 'high' | 'medium' | 'low';
  items: { name: string; grams: number; kcal: number }[];
  note?: string;
  error?: string;
};

export class AiError extends Error {
  constructor(public code: 'no_api' | 'network' | 'no_food' | 'server' | 'rate', msg?: string) { super(msg ?? code); }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  if (!API) throw new AiError('no_api');
  let r: Response;
  try {
    r = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-app-key': APP_KEY },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AiError('network');
  }
  if (r.status === 429) throw new AiError('rate');
  if (!r.ok) throw new AiError('server', `HTTP ${r.status}`);
  return (await r.json()) as T;
}

export async function scanMeal(base64: string, lang: string, kind: 'food' | 'drink', cat: Cat): Promise<ScanResult> {
  const res = await post<ScanResult>('/api/scan', { image: base64, lang, kind, cat });
  if (res.error === 'no_food') throw new AiError('no_food');
  return res;
}

export type ChatMsg = { role: 'user' | 'assistant'; content: string };

export async function askCoach(messages: ChatMsg[], lang: string, context: string): Promise<string> {
  const res = await post<{ text: string }>('/api/chat', { messages, lang, context });
  return res.text;
}

export type DescribeResult = ScanResult & { heard?: string };

/** Meal from words: typed text or a recorded voice note (base64 m4a). */
export async function describeMeal(input: { text?: string; audio?: string; mime?: string }, lang: string): Promise<DescribeResult> {
  const res = await post<DescribeResult>('/api/describe', { ...input, lang });
  if (res.error === 'no_food') throw new AiError('no_food');
  return res;
}
