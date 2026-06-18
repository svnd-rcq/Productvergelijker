const https = require('https');

/**
 * Zet de ruwe Open Food Facts quantity-string om naar { value, unit }.
 * Voorbeelden: "500 g", "1 l", "250ml" → { value: 500, unit: 'g' }
 */
function parseQuantity(raw) {
  if (!raw) return { value: null, unit: null };
  const match = String(raw).match(/^([\d.,]+)\s*(g|ml|l|kg|cl|oz|lb)?/i);
  if (!match) return { value: null, unit: null };
  let value = parseFloat(match[1].replace(',', '.'));
  let unit = (match[2] || '').toLowerCase() || null;
  // Normaliseer eenheden naar g/ml
  if (unit === 'l') { value = value * 1000; unit = 'ml'; }
  if (unit === 'kg') { value = value * 1000; unit = 'g'; }
  if (unit === 'cl') { value = value * 10; unit = 'ml'; }
  return { value, unit };
}

/**
 * Haalt productdata op via de Open Food Facts REST API.
 * Retourneert null als het product niet gevonden is of als de barcode ongeldig is.
 * @param {string} barcode - EAN-8, EAN-13, UPC-A of UPC-E barcode
 * @returns {Promise<object|null>}
 */
async function lookup(barcode) {
  // Barcode-validatie: alleen cijfers, 8–14 tekens
  if (!/^\d{8,14}$/.test(barcode)) return null;

  const fields = 'product_name,product_name_nl,brands,quantity,nutriments,allergens_tags';
  const url = `https://world.openfoodfacts.org/api/v3/product/${barcode}?fields=${fields}`;

  const raw = await new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { headers: { 'User-Agent': 'RC-Qompare/1.0 (dev@yourapp.com)' } },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error('Ongeldige JSON in Open Food Facts response'));
          }
        });
      },
    );
    req.on('error', reject);
    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error('Open Food Facts request timeout'));
    });
  });

  if (raw.status === 0 || !raw.product) return null;

  const p = raw.product;
  const n = p.nutriments || {};

  // Energie: prefereer kcal, anders kJ omzetten
  const energyKcal =
    n['energy-kcal_100g'] != null
      ? n['energy-kcal_100g']
      : n['energy_100g'] != null
      ? Math.round(n['energy_100g'] / 4.184)
      : null;

  // Allergens: strip taal-prefix ("en:gluten" → "gluten")
  const allergens = (p.allergens_tags || [])
    .map((tag) => tag.replace(/^[a-z-]+:/, '').trim())
    .filter(Boolean);

  return {
    barcode,
    name: p.product_name_nl || p.product_name || null,
    brand: p.brands ? p.brands.split(',')[0].trim() : null,
    quantity: parseQuantity(p.quantity),
    price: null,         // prijs niet beschikbaar via Open Food Facts
    price_per_100g: null,
    nutrition_per_100g: {
      energy_kcal: energyKcal,
      sugar_g:   n['sugars_100g']   ?? null,
      salt_g:    n['salt_100g']     ?? null,
      protein_g: n['proteins_100g'] ?? null,
      fat_g:     n['fat_100g']      ?? null,
    },
    allergens,
    confidence: {
      name:      (p.product_name_nl || p.product_name) ? 0.95 : 0,
      brand:     p.brands ? 0.9 : 0,
      price:     0,
      quantity:  p.quantity ? 0.85 : 0,
      nutrition: energyKcal != null ? 0.95 : 0,
    },
  };
}

module.exports = { lookup };
