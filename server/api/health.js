import { cors, ask, currentModel } from './_openai.js';

// GET /api/health — checks the AI key and makes one tiny test call.
// Never returns the key itself.
export default async function handler(req, res) {
  cors(res);
  const provider = process.env.GEMINI_API_KEY ? 'gemini' : process.env.OPENAI_API_KEY ? 'openai' : 'none';
  const keyLen = (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '').trim().length;
  if (provider === 'none') return res.status(200).json({ ok: false, provider, problem: 'No AI key set on the server' });
  try {
    const text = await ask({ system: 'Reply with the single word: OK', messages: [{ role: 'user', content: 'ping' }] });
    return res.status(200).json({ ok: true, provider, model: await currentModel(), keyLength: keyLen, reply: String(text).slice(0, 40) });
  } catch (e) {
    const msg = String(e?.message || e).replace(/key=[^&\s"]+/g, 'key=***').slice(0, 600);
    return res.status(200).json({ ok: false, provider, keyLength: keyLen, problem: msg });
  }
}
