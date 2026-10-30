# Nutri AI server

Two serverless endpoints for Vercel. Keeps the OpenAI key off the phone.

- `POST /api/scan` `{ image: base64 jpeg, lang: "ar"|"en", kind: "food"|"drink" }` → `{ name, kcal, protein, carbs, fat, confidence, items[], note }` or `{ error: "no_food" }`
- `POST /api/chat` `{ messages: [{role, content}], lang, context }` → `{ text }`

Env vars: `OPENAI_API_KEY` (required), `OPENAI_MODEL` (optional, default `gpt-4o-mini`).

Deploy: import this folder as a Vercel project (Root Directory = `server`), add the env var, deploy.
