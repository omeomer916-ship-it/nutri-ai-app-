import { cors, openai, LANGS } from './_openai.js';

// POST /api/chat  { messages: [{role, content}], lang, context }
export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  try {
    const { messages = [], lang = 'en', context = '' } = req.body || {};
    const L = LANGS[lang] || 'English';
    const sys =
      `You are Nutri AI, a friendly and accurate nutrition coach inside a calorie-tracking app. ` +
      `Answer any question clearly and correctly, in ${L}, short enough for a phone screen (use short lists when helpful). ` +
      `Use the user's data when relevant: ${context} ` +
      `Do not give medical diagnoses; suggest seeing a doctor for medical conditions.`;
    const clean = messages
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
    const text = await openai({ temperature: 0.5, messages: [{ role: 'system', content: sys }, ...clean] });
    return res.status(200).json({ text });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server', message: String(e.message || e) });
  }
}
