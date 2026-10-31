// Shared food knowledge used by the scanner and the coach.
// Goal: be accurate for Arab / Middle Eastern home cooking AND world cuisines.

export const CUISINE_GUIDE = `
FOOD KNOWLEDGE (use it to recognise dishes and portions correctly):

Levantine / Palestinian / Jordanian / Syrian / Lebanese:
- Musakhan (taboon bread + sumac onions + olive oil + chicken): very oily; one loaf with 1/4 chicken ≈ 700–900 kcal.
- Mansaf (lamb, jameed yogurt sauce, rice, shrak bread, nuts): typical plate ≈ 800–1100 kcal; jameed + ghee are calorie dense.
- Maqluba (rice, fried eggplant/cauliflower, chicken): fried vegetables add oil; plate ≈ 600–800 kcal.
- Mujaddara, molokhia, freekeh, waraq dawali, kibbeh (fried vs baked), fatteh, shakshuka, ful medames.
- Hummus (≈170 kcal/100 g, more with olive oil on top), falafel (≈55–65 kcal per piece, fried),
  tabbouleh, fattoush, baba ghanoush, labneh (≈150–180 kcal/100 g), za'atar + olive oil manakish (≈350–450 kcal each).
- Shawarma wrap ≈ 500–700 kcal (garlic sauce adds 100–200), shawarma plate ≈ 800–1000.
- Sweets: knafeh (≈350–450 kcal per 100 g, syrup!), baklava (≈60–90 kcal per small piece), qatayef, ma'amoul, basbousa.
- Drinks: Arabic coffee (≈5 kcal), tea with 2 tsp sugar (≈35 kcal), sahlab, jallab, tamarind, fresh juices (sugar!).
Gulf / Iraqi / Egyptian / Maghreb: kabsa, mandi, machboos, harees, quzi, dolma, koshari (≈700 kcal plate),
  feteer, mahshi, couscous, tajine, harira, msemen, bastilla.
Turkish / Persian: doner, lahmacun, pide, börek, iskender, kebabs, tahdig, ghormeh sabzi.
South Asian: biryani, curries (ghee/cream), naan (≈260–300 kcal), dal, samosa, chapati.
East / Southeast Asian: sushi (≈40–60 kcal per nigiri), ramen (≈500–900), pho, fried rice, pad thai, dumplings, bibimbap.
Western / Latin: burgers, pizza (≈250–300 kcal per slice), pasta, salads with dressing, tacos, burritos, BBQ.

PORTION RULES:
- Use visual references: plate (~26 cm), bowl, glass (~250 ml), Arabic bread loaf (~80–100 g, ~240 kcal), fork, hand.
- Always count cooking oil, ghee, butter, tahini, garlic sauce, syrup and sugar in drinks — these are the usual hidden calories.
- Shared platters (mansaf, maqluba, kabsa, mezze): if the photo shows a large shared tray, estimate ONE person's portion
  and say so in the note.
- Halal note: if pork or alcohol is clearly visible, mention it in the note.
`;

export const LANGS = {
  ar: 'Arabic (simple, friendly Levantine-style Arabic is fine)',
  en: 'English', fr: 'French', es: 'Spanish', de: 'German', tr: 'Turkish',
  ru: 'Russian', id: 'Indonesian', ur: 'Urdu',
};
