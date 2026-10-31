import { cors, openai } from './_openai.js';
import { CUISINE_GUIDE, LANGS } from './_food.js';

// POST /api/chat  { messages: [{role, content}], lang, context }
export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  try {
    const { messages = [], lang = 'en', context = '' } = req.body || {};
    const L = LANGS[lang] || 'English';
    const sys =
      `You are Nutri AI, a warm, expert nutrition coach inside a calorie-tracking app used by Arabs and people worldwide. ` +
      `Answer any food, diet, fitness or health-habit question clearly and correctly, in ${L}, short enough for a phone screen ` +
      `(short paragraphs or 3–6 bullet points). Give concrete numbers (kcal, grams) when useful. ` +
      `Respect culture: suggest realistic swaps for Arab home food (e.g. less oil in maqluba, baked kibbeh, half bread), ` +
      `Ramadan-aware advice for suhoor and iftar when relevant, halal options, and world cuisines for travellers. ` +
      `Use the user's data when relevant: ${context} ` +
      `Do not diagnose illness; for medical conditions, pregnancy or eating disorders, advise seeing a doctor.\n` +
      CUISINE_GUIDE + `\n`;
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
