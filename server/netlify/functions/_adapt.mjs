// Runs the Vercel-style handlers (req, res) inside Netlify Functions (Request -> Response),
// with basic abuse protection: app key, per-IP rate limit and body size limits.

const HITS = new Map(); // ip|route -> [timestamps]  (per warm instance)
const LIMITS = { scan: 30, chat: 80, describe: 40 }; // requests per hour per IP
const MAX_BODY = 3_000_000; // bytes (a 1024px JPEG in base64 is ~200 KB)

function limited(ip, route) {
  const max = LIMITS[route];
  if (!max) return false;
  const k = ip + '|' + route, now = Date.now();
  const list = (HITS.get(k) || []).filter((t) => now - t < 3600_000);
  list.push(now);
  HITS.set(k, list);
  if (HITS.size > 5000) HITS.clear();
  return list.length > max;
}

const json = (status, obj) => new Response(JSON.stringify(obj), {
  status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
});

export function adapt(handler, route) {
  return async (request, context) => {
    if (request.method === 'POST') {
      // App key: set APP_KEY in Netlify to require it (old app builds without the key are then refused).
      const want = process.env.APP_KEY;
      const got = request.headers.get('x-app-key');
      if (want && process.env.APP_KEY_REQUIRED === '1' && got !== want) return json(401, { error: 'key' });
      const ip = context?.ip || request.headers.get('x-nf-client-connection-ip') || 'x';
      if (limited(ip, route)) return json(429, { error: 'rate' });
      const len = Number(request.headers.get('content-length') || 0);
      if (len > MAX_BODY) return json(413, { error: 'too_big' });
    }
    let body = {};
    if (request.method === 'POST') {
      try { body = await request.json(); } catch { body = {}; }
      if (JSON.stringify(body).length > MAX_BODY) return json(413, { error: 'too_big' });
      if (Array.isArray(body.messages)) {
        body.messages = body.messages.slice(-12).map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '').slice(0, 2000) }));
      }
      if (typeof body.context === 'string') body.context = body.context.slice(0, 1500);
    }
    const headers = {};
    let status = 200;
    let payload = null;
    const res = {
      setHeader: (k, v) => { headers[k] = v; },
      status: (c) => { status = c; return res; },
      json: (b) => { payload = JSON.stringify(b); headers['Content-Type'] = 'application/json'; return res; },
      end: () => res,
    };
    await handler({ method: request.method, body }, res);
    return new Response(payload, { status, headers });
  };
}
