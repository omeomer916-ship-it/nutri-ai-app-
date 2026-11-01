import { cors, ask } from './_openai.js';
import { CUISINE_GUIDE, LANGS } from './_food.js';

// POST /api/tool  { tool, text?, image?, lang, context }
// AI tools with fixed, server-side instructions. The app can only pick a tool, not write the prompt.
const STYLE =
  'Answer for a phone screen in short markdown: "**Heading**" lines and "- " bullets, no tables, no code blocks. ' +
  'Give realistic numbers (kcal, protein grams) for each suggestion. Be warm and practical. Stay under 220 words.';

const TOOLS = {
  fridge: { image: true, need: 'image', task: (x) =>
    `The photo shows the user's fridge, pantry or ingredients. List what you can see in one line, then suggest 3 healthy dishes they can cook mostly from it. ` +
    `For each: name, kcal and protein per serving, time in minutes, and 3-4 short steps. Prefer dishes that fit the calories and protein they have left today. ${x ? `Extra note from the user: ${x}` : ''}` },
  menu: { image: true, need: 'any', task: (x) =>
    `The user is at a restaurant. ${x ? `Menu text or restaurant: ${x}.` : 'The photo shows the menu.'} Pick the 3 best orders for their goal, with estimated kcal and protein for each, ` +
    `one smart tweak per dish (sauce on the side, grilled not fried, etc.), and 2 items to avoid and why.` },
  label: { image: true, need: 'image', task: (x) =>
    `The photo shows a food package, nutrition facts label or ingredient list. Read it. Give: a one-line verdict (Great / OK sometimes / Better avoid), ` +
    `calories and key numbers per serving, red flags (added sugar, salt, trans fat, long additive lists), allergens you can see, and one healthier alternative. ${x ? `User question: ${x}` : ''}` },
  plan: { need: 'none', task: (x) =>
    `Create a one-day meal plan that hits the user's calorie and protein goals (within 5%). Breakfast, lunch, dinner and 1-2 snacks, each with kcal and protein, ` +
    `using foods from around the world that are easy to find. End with the day's total and a short grocery list. ${x ? `Preferences: ${x}` : ''}` },
  week: { need: 'none', task: (x) =>
    `Create a simple 7-day meal plan outline that fits the user's goals: for each day one line per meal (breakfast, lunch, dinner), with approx daily kcal. ` +
    `Reuse ingredients to save money and time. End with one grocery list grouped by section. ${x ? `Preferences: ${x}` : ''}` },
  swap: { need: 'text', task: (x) =>
    `The user wants healthier swaps for: ${x}. Give 4 swaps that keep the taste they love. For each: the swap, kcal saved per portion and why it is better.` },
  craving: { need: 'text', task: (x) =>
    `The user is craving: ${x}. Give 4 smart ways to satisfy it within the calories they have left today, from a lighter version to a proper treat in a controlled portion. ` +
    `Include kcal for each and one tip to enjoy it without overeating.` },
  eatout: { need: 'text', task: (x) =>
    `The user will eat at: ${x} (a restaurant, chain or type of cuisine). Tell them the 3 best orders for their goal with kcal and protein, how to customise them, and what to skip.` },
  compare: { need: 'text', task: (x) =>
    `Compare these foods for the user: ${x}. For a normal portion of each give kcal, protein, carbs, fat and fibre, then say which fits their goal better and when the other one is fine.` },
  snack: { need: 'none', task: (x) =>
    `Suggest 5 snacks the user can have right now that fit the calories and protein they have left today. Mix sweet and savoury, home and store-bought. Give kcal and protein for each. ${x ? `Note: ${x}` : ''}` },
  workout: { need: 'text', task: (x) =>
    `The user's workout: ${x}. Tell them what to eat before (timing, 2 options) and after (timing, 2 options) with kcal and protein, plus how much water.` },
  grocery: { need: 'none', task: (x) =>
    `Build a healthy grocery list for one week for the user's goal, grouped by section (produce, protein, dairy, grains, pantry), with rough amounts. ` +
    `Keep it affordable and add 3 quick meal ideas from the list. ${x ? `Details: ${x}` : ''}` },
};

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  try {
    const { tool, text = '', image, lang = 'en', context = '' } = req.body || {};
    const T = TOOLS[tool];
    if (!T) return res.status(400).json({ error: 'tool' });
    const said = String(text).slice(0, 800).trim();
    const img = T.image && typeof image === 'string' && image.length > 200 ? image : undefined;
    if (T.need === 'image' && !img) return res.status(400).json({ error: 'empty' });
    if (T.need === 'text' && !said) return res.status(400).json({ error: 'empty' });
    if (T.need === 'any' && !img && !said) return res.status(400).json({ error: 'empty' });
    const L = LANGS[lang] || 'English';
    const sys =
      `You are Nutri AI, an expert nutrition assistant inside a calorie-tracking app used worldwide. Reply in ${L}. ${STYLE} ` +
      `User data: ${String(context).slice(0, 1500)} ` +
      `Never diagnose illness; for medical conditions, pregnancy or eating disorders suggest seeing a doctor. ` +
      `If the request or photo has nothing to do with food, nutrition or fitness, reply only with: NO_FOOD\n` + CUISINE_GUIDE;
    const out = await ask({ system: sys, messages: [{ role: 'user', content: T.task(said) }], image: img });
    if (/^\s*NO_FOOD\s*$/.test(out)) return res.status(200).json({ error: 'no_food' });
    return res.status(200).json({ text: out });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server', message: String(e.message || e) });
  }
}
