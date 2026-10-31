// AI provider helper. Keys live on the server only, never in the app.
// Uses Google Gemini when GEMINI_API_KEY is set (free tier available),
// otherwise OpenAI with OPENAI_API_KEY.

export function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const useGemini = () => !!process.env.GEMINI_API_KEY;

/**
 * ask({ system, messages, image, json, scan })
 * - messages: [{ role: 'user'|'assistant', content: string }]
 * - image: base64 JPEG (optional), attached to the last user message
 * Returns the model's text.
 */
export async function ask({ system, messages, image, json = false, scan = false }) {
  return useGemini() ? gemini({ system, messages, image, json, scan }) : openai({ system, messages, image, json, scan });
}

// Pick a Gemini model: env override, else the newest "flash" model this key can use.
let cachedModel = null;
async function geminiModel(key) {
  if (process.env.GEMINI_MODEL) return process.env.GEMINI_MODEL;
  if (cachedModel) return cachedModel;
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=${key}`);
    if (r.ok) {
      const j = await r.json();
      const ok = (j.models || [])
        .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
        .map((m) => String(m.name).replace(/^models\//, ''))
        .filter((n) => /flash/.test(n) && !/(lite|tts|image|live|audio|embedding|thinking|exp|preview)/.test(n));
      const ver = (n) => parseFloat((n.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || '0');
      ok.sort((a, b) => ver(b) - ver(a) || a.length - b.length);
      if (ok[0]) return (cachedModel = ok[0]);
    }
  } catch {}
  return (cachedModel = 'gemini-flash-latest');
}

async function gemini({ system, messages, image, json }) {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  const contents = messages.map((m, i) => {
    const parts = [{ text: m.content }];
    if (image && i === messages.length - 1) parts.push({ inline_data: { mime_type: 'image/jpeg', data: image } });
    return { role: m.role === 'assistant' ? 'model' : 'user', parts };
  });
  const body = {
    system_instruction: { parts: [{ text: system }] },
    contents,
    generationConfig: { temperature: json ? 0.2 : 0.5, ...(json ? { responseMimeType: 'application/json' } : {}) },
  };
  const call = (model) =>
    fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  let model = await geminiModel(key);
  let r = await call(model);
  if (r.status === 404 && model !== 'gemini-flash-latest') {
    cachedModel = model = 'gemini-flash-latest';
    r = await call(model);
  }
  if (!r.ok) throw new Error(`Gemini ${r.status} (${model}): ${await r.text()}`);
  const j = await r.json();
  return (j.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').filter(Boolean).join('');
}

export async function currentModel() {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  return key ? geminiModel(key) : process.env.OPENAI_MODEL || 'gpt-4o-mini';
}

async function openai({ system, messages, image, json, scan }) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('No AI key: set GEMINI_API_KEY or OPENAI_API_KEY on the server');
  const model = (scan && (process.env.OPENAI_SCAN_MODEL || 'gpt-4o')) || process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const msgs = messages.map((m, i) =>
    image && i === messages.length - 1
      ? { role: 'user', content: [{ type: 'text', text: m.content }, { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image}`, detail: 'high' } }] }
      : { role: m.role, content: m.content },
  );
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: json ? 0.2 : 0.5,
      ...(json ? { response_format: { type: 'json_object' } } : {}),
      messages: [{ role: 'system', content: system }, ...msgs],
    }),
  });
  if (!r.ok) throw new Error(`OpenAI ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? '';
}

/** Parse JSON even if the model wrapped it in ```json fences. */
export function parseJson(text) {
  const t = String(text).trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();
  return JSON.parse(t);
}
