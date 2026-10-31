import { cors, ask, parseJson } from './_openai.js';
import { CUISINE_GUIDE, LANGS } from './_food.js';

// POST /api/scan  { image: base64 jpeg, lang: 'ar'|'en', kind: 'food'|'drink', cat }
export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  try {
    const { image, lang = 'en', kind = 'food' } = req.body || {};
    if (!image || image.length < 100) return res.status(400).json({ error: 'no_image' });
    const L = LANGS[lang] || 'English';
    const sys =
      `You are a precise nutrition analyst, as good as the best calorie-scanner apps, and an expert in Arab and world cuisines. ` +
      `Look at the photo of a ${kind === 'drink' ? 'drink' : 'meal'}. ` +
      `1) Name the dish the way people really call it (e.g. "مسخّن" / "Musakhan", not "chicken with bread"). ` +
      `2) List every visible item with an estimated weight in grams (ml for drinks), using the portion rules. ` +
      `3) Compute realistic calories and macros from standard nutrition data, including hidden oil, ghee, sauces and sugar. ` +
      `Be realistic, never round everything to the same number, and do not under-estimate fried or oily food.\n` +
      CUISINE_GUIDE +
      `\nReturn ONLY a JSON object: {"name": short dish name, "kcal": number, "protein": grams, "carbs": grams, "fat": grams, ` +
      `"confidence": "high"|"medium"|"low", "items": [{"name": string, "grams": number, "kcal": number}], ` +
      `"note": one short helpful sentence (portion assumption, hidden calories or a tip)}. ` +
      `Write name, item names and note in ${L}. If there is no food or drink in the photo return {"error":"no_food"}.`;
    const out = await ask({
      system: sys,
      messages: [{ role: 'user', content: 'Analyze this photo and answer with the JSON object only.' }],
      image,
      json: true,
      scan: true,
    });
    const data = parseJson(out);
    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server', message: String(e.message || e) });
  }
}
