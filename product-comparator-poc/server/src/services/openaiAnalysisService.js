const { compareProducts } = require('./comparisonService');
const mockAnalysisService = require('./mockAnalysisService');

const SYSTEM_PROMPT = `Je bent een productinformatie-extractor voor een retail productvergelijker.
Analyseer de productfoto's. Haal alleen informatie uit zichtbare tekst of duidelijke visuele informatie.
Verzin niets. Gebruik null voor ontbrekende waarden.
Bepaal de productcategorie. Extraheer productnaam, merk, prijs, inhoud, voedingswaarden per 100g en confidence-scores.
Retourneer uitsluitend geldige JSON volgens het schema.`;

/**
 * Probeert OpenAI Vision te gebruiken voor productanalyse.
 * Als er geen API-key is of als OpenAI faalt, valt de service terug op mockdata
 * zodat de hackathon-demo altijd blijft werken.
 */
async function analyze(products) {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[OpenAI] Geen OPENAI_API_KEY gevonden – terugvallen op mockdata.');
    return mockAnalysisService.analyze(products);
  }

  try {
    const { OpenAI } = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const schemaExample = {
      category: 'food',
      products: products.map((p) => ({
        id: p.id,
        name: null,
        brand: null,
        price: null,
        quantity: { value: null, unit: null },
        price_per_100g: null,
        nutrition_per_100g: { energy_kcal: null, sugar_g: null, salt_g: null, protein_g: null },
        confidence: { name: 0, brand: 0, price: 0, quantity: 0, nutrition: 0 },
      })),
    };

    // Bouw de user-message op met tekst + afbeeldingen per product
    const userContent = [
      {
        type: 'text',
        text:
          `Analyseer ${products.length} producten en retourneer JSON in dit formaat:\n` +
          `${JSON.stringify(schemaExample, null, 2)}\n\n` +
          `Vereisten:\n` +
          `- Gebruik de gegeven product-IDs\n` +
          `- Gebruik null voor ontbrekende waarden\n` +
          `- Confidence is een getal tussen 0 en 1\n` +
          `- Bereken price_per_100g als prijs en hoeveelheid bekend zijn`,
      },
      ...products.flatMap((p, i) => {
        const parts = [{ type: 'text', text: `\nProduct ${i + 1} (id: ${p.id}):` }];
        if (p.images && p.images.length > 0) {
          p.images.forEach((img) => {
            if (img && img.startsWith('data:')) {
              parts.push({ type: 'image_url', image_url: { url: img, detail: 'high' } });
            }
          });
        }
        return parts;
      }),
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.choices[0].message.content);

    // Vergelijking altijd deterministisch berekenen – nooit door AI
    const best = compareProducts(parsed.products);
    parsed.comparison = { best };

    if (!parsed.summary) {
      parsed.summary = buildSummary(parsed.products, best);
    }

    return parsed;
  } catch (err) {
    console.error('[OpenAI] Analyse mislukt, terugvallen op mockdata:', err.message);
    return mockAnalysisService.analyze(products);
  }
}

function buildSummary(products, best) {
  const lines = [];

  const addInsight = (key, template) => {
    if (best[key]) {
      const winner = products.find((p) => p.id === best[key]);
      if (winner) lines.push(template(winner.name));
    }
  };

  addInsight('price_per_100g', (n) => `${n} is goedkoper per 100 gram.`);
  addInsight('sugar_g', (n) => `${n} bevat minder suiker.`);
  addInsight('protein_g', (n) => `${n} bevat meer eiwitten.`);
  addInsight('salt_g', (n) => `${n} bevat minder zout.`);
  addInsight('energy_kcal', (n) => `${n} heeft minder calorieën per 100 gram.`);

  lines.push('Controleer bij twijfel altijd het originele etiket.');
  return lines.join(' ');
}

module.exports = { analyze };
