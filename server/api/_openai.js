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

// Gemini models this key can use, best first: newest "flash", then "flash-lite" as backup.
let cachedModels = null;
async function geminiModels(key) {
  if (process.env.GEMINI_MODEL) return [process.env.GEMINI_MODEL];
  if (cachedModels) return cachedModels;
  let list = [];
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=${key}`);
    if (r.ok) {
      const j = await r.json();
      list = (j.models || [])
        .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
        .map((m) => String(m.name).replace(/^models\//, ''))
        .filter((n) => /^gemini-.*flash/.test(n) && !/(tts|image|live|audio|embedding|thinking|exp)/.test(n));
      const ver = (n) => parseFloat((n.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || '0');
      const score = (n) => ver(n) * 10 - (/lite/.test(n) ? 5 : 0) - (/preview/.test(n) ? 3 : 0);
      list.sort((x, y) => score(y) - score(x) || x.length - y.length);
    }
  } catch {}
  if (!list.includes('gemini-flash-latest')) list.push('gemini-flash-latest');
  return (cachedModels = list.slice(0, 5));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function gemini({ system, messages, image, json }) {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  const contents = messages.map((m, i) => {
    const parts = [{ text: m.content }];
    if (image && i === messages.length - 1) parts.push({ inline_data: { mime_type: 'image/jpeg', data: image } });
    return { role: m.role === 'assistant' ? 'model' : 'user', parts };
  });
  const body = JSON.stringify({
    system_instruction: { parts: [{ text: system }] },
    contents,
    generationConfig: { temperature: json ? 0.2 : 0.5, ...(json ? { responseMimeType: 'application/json' } : {}) },
  });
  const started = Date.now();
  const budget = 24000; // stay inside the function time limit
  let lastErr = 'no model';
  // Try each model; on "busy" (429/500/503) move to the next one, with one short retry.
  for (const model of await geminiModels(key)) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const left = budget - (Date.now() - started);
      if (left < 2500) throw new Error(`Gemini busy: ${lastErr}`);
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), left - 500);
      try {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body, signal: ctl.signal,
        });
        if (r.ok) {
          const j = await r.json();
          lastModel = model;
          return (j.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').filter(Boolean).join('');
        }
        lastErr = `${r.status} (${model}): ${(await r.text()).slice(0, 300)}`;
        if (r.status === 404 || r.status === 400 || r.status === 403) break; // not usable: next model
        if (attempt === 0) await sleep(700);
      } catch (e) {
        lastErr = `${model}: ${String(e?.message || e)}`;
      } finally {
        clearTimeout(timer);
      }
    }
  }
  throw new Error(`Gemini ${lastErr}`);
}

let lastModel = null;
export async function currentModel() {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  return key ? { used: lastModel, order: await geminiModels(key) } : process.env.OPENAI_MODEL || 'gpt-4o-mini';
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
