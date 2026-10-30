import { cors, openai, LANGS } from './_openai.js';

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
      `You are a precise nutrition analyst like the Cal AI app. Look at the photo of a ${kind === 'drink' ? 'drink' : 'meal'}. ` +
      `Identify each food or drink item, estimate each portion in grams (or ml) from visual cues such as plate, bowl, cup and utensil size, ` +
      `then compute realistic calories and macros using standard nutrition databases. Account for visible oil, sauces and sugar. ` +
      `Return ONLY a JSON object: {"name": short meal name, "kcal": number, "protein": grams, "carbs": grams, "fat": grams, ` +
      `"confidence": "high"|"medium"|"low", "items": [{"name": string, "grams": number, "kcal": number}], "note": one short sentence about uncertainty}. ` +
      `Write name, item names and note in ${L}. If there is no food or drink in the photo return {"error":"no_food"}.`;
    const out = await openai({
      response_format: { type: 'json_object' },
      temperature: 0.2,
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: [
          { type: 'text', text: 'Analyze this photo.' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image}`, detail: 'high' } },
        ] },
      ],
    });
    const data = JSON.parse(out);
    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server', message: String(e.message || e) });
  }
}
