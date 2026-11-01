import { cors, ask, parseJson } from './_openai.js';
import { CUISINE_GUIDE, LANGS } from './_food.js';

// POST /api/describe  { text?: string, audio?: base64, mime?: string, lang }
// The user says or types what they ate ("two eggs, toast and a latte"); returns the same shape as /api/scan.
export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  try {
    const { text = '', audio, mime, lang = 'en' } = req.body || {};
    const said = String(text).slice(0, 600).trim();
    if (!said && !(audio && audio.length > 200)) return res.status(400).json({ error: 'empty' });
    const L = LANGS[lang] || 'English';
    const sys =
      `You are a precise nutrition analyst for world cuisines. The user ${audio ? 'recorded a voice note (any language)' : 'typed'} describing what they ate or drank. ` +
      `Understand quantities ("two", "half a plate", "a big mug"), brands and restaurant items. If no amount is given, assume one normal portion. ` +
      `List every item with estimated grams and calories, then compute realistic totals including oil, butter, sugar and sauces.\n` +
      CUISINE_GUIDE +
      `\nReturn ONLY a JSON object: {"name": short meal name, "kcal": number, "protein": grams, "carbs": grams, "fat": grams, ` +
      `"confidence": "high"|"medium"|"low", "items": [{"name": string, "grams": number, "kcal": number}], "heard": what the user said, as plain text, ` +
      `"note": one short helpful sentence}. Write name, items, heard and note in ${L}. If the input is not about food or drink return {"error":"no_food"}.`;
    const out = await ask({
      system: sys,
      messages: [{ role: 'user', content: said ? `What I ate: ${said}` : 'Listen to my voice note about what I ate and answer with the JSON object only.' }],
      audio: audio ? { data: audio, mime: mime || 'audio/mp4' } : undefined,
      json: true,
    });
    return res.status(200).json(parseJson(out));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server', message: String(e.message || e) });
  }
}
