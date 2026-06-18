const { compareProducts } = require('./comparisonService');
const mockAnalysisService = require('./mockAnalysisService');

// Prompt voor foto-analyse: exact voorgeschreven 3-stappen structuur
const PHOTO_SYSTEM_PROMPT = `You analyze product photos to extract nutritional information and allergens.
Always respond with valid JSON in one of these two formats:
- If no relevant data could be extracted: {"status":"not_found"}
- If data was extracted: {"status":"found","trustworthy":true,"data":{...exact Open Food Facts product format...}}
The "trustworthy" field must be false when values are likely misread or uncertain.`;

const PHOTO_USER_PROMPT =
  'there are 3 possible steps to make:\n' +
  '1 determine whether this is the picture(s) of a nutritional table, ingredient list, both, or neither\n' +
  '2.a if the picture(s) includes nutritional facts, extract those nutritional facts\n' +
  '2.b if the picture(s) includes an ingredient list, extract the allergens\n' +
  '3 if any data has been extracted, give me a json with this data, exactly formatted how Open Food Facts ' +
  'formats it\'s product data – also return whether the data is trustworthy or is likely misread, ' +
  'if no data was extracted, respond with "404"';

/**
 * Zet Open Food Facts nutriments + allergens_tags om naar intern schema.
 */
function mapOffToInternal(id, offData, trustworthy) {
  const n = offData.nutriments || {};
  const energyKcal =
    n['energy-kcal_100g'] != null ? n['energy-kcal_100g'] :
    n['energy_kcal_100g'] != null ? n['energy_kcal_100g'] :
    n['energy_100g'] != null ? Math.round(n['energy_100g'] / 4.184) : null;

  const nutritionConfidence = energyKcal != null ? (trustworthy ? 0.85 : 0.5) : 0;

  const allergens = (offData.allergens_tags || [])
    .map((tag) => tag.replace(/^[a-z-]+:/, '').trim())
    .filter(Boolean);

  return {
    id,
    name: offData.product_name_nl || offData.product_name || null,
    brand: offData.brands ? offData.brands.split(',')[0].trim() : null,
    price: null,
    quantity: { value: null, unit: null },
    price_per_100g: null,
    nutrition_per_100g: {
      energy_kcal: energyKcal,
      sugar_g:   n['sugars_100g']   ?? null,
      salt_g:    n['salt_100g']     ?? null,
      protein_g: n['proteins_100g'] ?? null,
      fat_g:     n['fat_100g']      ?? null,
    },
    allergens,
    confidence: { name: 0, brand: 0, price: 0, quantity: 0, nutrition: nutritionConfidence },
  };
}

function emptyProduct(id) {
  return {
    id,
    name: null, brand: null, price: null,
    quantity: { value: null, unit: null }, price_per_100g: null,
    nutrition_per_100g: { energy_kcal: null, sugar_g: null, salt_g: null, protein_g: null, fat_g: null },
    allergens: [],
    confidence: { name: 0, brand: 0, price: 0, quantity: 0, nutrition: 0 },
  };
}

/**
 * Stuurt één product's foto's naar OpenAI met het 3-stappen prompt.
 * Retourneert het product-object, met photo_unreadable: true als de foto niet bruikbaar was.
 */
async function analyzePhotoProduct(openai, product) {
  const images = (product.images || []).filter((img) => img?.startsWith('data:'));
  if (images.length === 0) {
    return { ...emptyProduct(product.id), photo_unreadable: true };
  }

  const userContent = [
    { type: 'text', text: PHOTO_USER_PROMPT },
    ...images.map((img) => ({ type: 'image_url', image_url: { url: img, detail: 'high' } })),
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: PHOTO_SYSTEM_PROMPT },
      { role: 'user', content: userContent },
    ],
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  const parsed = JSON.parse(response.choices[0].message.content);

  if (parsed.status === 'not_found' || !parsed.data) {
    return { ...emptyProduct(product.id), photo_unreadable: true };
  }

  return mapOffToInternal(product.id, parsed.data, parsed.trustworthy !== false);
}

/**
 * Probeert OpenAI Vision te gebruiken voor productanalyse.
 * Als er geen API-key is of als OpenAI faalt, valt de service terug op mockdata.
 */
async function analyze(products) {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[OpenAI] Geen OPENAI_API_KEY gevonden – terugvallen op mockdata.');
    return mockAnalysisService.analyze(products);
  }

  try {
    const { OpenAI } = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Splits producten: met barcode-data (geen OpenAI nodig) vs zonder (foto-analyse)
    const withBarcode = products.filter((p) => p.barcodeData);
    const withPhotos  = products.filter((p) => !p.barcodeData);

    // Barcode-producten direct omzetten naar het analyse-schema
    const barcodeResults = withBarcode.map((p) => ({
      id: p.id,
      name: p.barcodeData.name || null,
      brand: p.barcodeData.brand || null,
      price: null,
      quantity: p.barcodeData.quantity || { value: null, unit: null },
      price_per_100g: null,
      nutrition_per_100g: {
        ...(p.barcodeData.nutrition_per_100g || {}),
        fat_g: p.barcodeData.nutrition_per_100g?.fat_g ?? null,
      },
      allergens: p.barcodeData.allergens || [],
      confidence: p.barcodeData.confidence || { name: 0, brand: 0, price: 0, quantity: 0, nutrition: 0 },
    }));

    // Foto-producten: één AI-call per product met het 3-stappen prompt
    const photoResults = await Promise.all(
      withPhotos.map((p) => analyzePhotoProduct(openai, p)),
    );

    // Voeg resultaten samen, behoud de originele volgorde
    const allProducts = products.map((p) =>
      barcodeResults.find((r) => r.id === p.id) ||
      photoResults.find((r) => r.id === p.id) ||
      emptyProduct(p.id),
    );

    // Vergelijking alleen berekenen over producten zonder unreadable-foto
    const comparableProducts = allProducts.filter((p) => !p.photo_unreadable);
    const best = compareProducts(comparableProducts.length >= 2 ? comparableProducts : allProducts);
    const summary = buildSummary(allProducts, best);

    return { category: 'food', products: allProducts, comparison: { best }, summary };
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
  addInsight('sugar_g',        (n) => `${n} bevat minder suiker.`);
  addInsight('protein_g',      (n) => `${n} bevat meer eiwitten.`);
  addInsight('salt_g',         (n) => `${n} bevat minder zout.`);
  addInsight('energy_kcal',    (n) => `${n} heeft minder calorieën per 100 gram.`);
  lines.push('Controleer bij twijfel altijd het originele etiket.');
  return lines.join(' ');
}

module.exports = { analyze };
