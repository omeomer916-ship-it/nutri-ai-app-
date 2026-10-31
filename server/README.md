# Nutri AI server

Two serverless endpoints for Vercel. Keeps the OpenAI key off the phone.

- `POST /api/scan` `{ image: base64 jpeg, lang: "ar"|"en", kind: "food"|"drink" }` → `{ name, kcal, protein, carbs, fat, confidence, items[], note }` or `{ error: "no_food" }`
- `POST /api/chat` `{ messages: [{role, content}], lang, context }` → `{ text }`

Env vars (set ONE key): `GEMINI_API_KEY` (free tier, from aistudio.google.com) or `OPENAI_API_KEY`.
Optional: `GEMINI_MODEL` (default `gemini-2.5-flash`), `OPENAI_MODEL` (chat, default `gpt-4o-mini`), `OPENAI_SCAN_MODEL` (photos, default `gpt-4o`).

Deploy: import this folder as a Vercel project (Root Directory = `server`), add the env var, deploy.

Hosted on Netlify: https://nutri-ai-server.netlify.app (GEMINI_API_KEY set in Netlify env).
