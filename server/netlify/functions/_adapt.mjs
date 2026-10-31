// Runs the Vercel-style handlers (req, res) inside Netlify Functions (Request -> Response).
export function adapt(handler) {
  return async (request) => {
    let body = {};
    if (request.method === 'POST') {
      try { body = await request.json(); } catch { body = {}; }
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
