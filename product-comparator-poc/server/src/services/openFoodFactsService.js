const https = require('https');
const { normalizeAllergens } = require('../utils/allergenUtils');

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
 * Doet een HTTPS GET-request en parsed de JSON-response.
 */
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { headers: { 'User-Agent': 'RC-Qompare/1.0 (dev@yourapp.com)' } },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch { reject(new Error('Ongeldige JSON in Open Food Facts response')); }
        });
      },
    );
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('Open Food Facts request timeout')); });
  });
}

/**
 * Haalt productdata op via de Open Food Facts REST API.
 * Probeert eerst v3, daarna v2 als fallback.
 * Retourneert null als het product niet gevonden is of als de barcode ongeldig is.
 * @param {string} barcode - EAN-8, EAN-13, UPC-A of UPC-E barcode
 * @returns {Promise<object|null>}
 */
async function lookup(barcode) {
  // Barcode-validatie: alleen cijfers, 8–14 tekens
  if (!/^\d{8,14}$/.test(barcode)) return null;

  const fields = 'product_name,product_name_nl,brands,quantity,nutriments,allergens_tags';

  // ── Stap 1: probeer v3 ────────────────────────────────────────────────────
  let raw;
  try {
    const url = 'https://world.openfoodfacts.org/api/v3/product/' + barcode + '?fields=' + fields;
    raw = await httpsGet(url);
    console.log('[OFF v3]', barcode, '→ status:', raw.status, '| product:', !!raw.product);
  } catch (err) {
    console.warn('[OFF v3] Request fout, fallback naar v2:', err.message);
    raw = null;
  }

  // v3: status is string "success" of "failure"
  const v3Found = raw && raw.status === 'success' && raw.product;

  // ── Stap 2: v2 als fallback (betere coverage voor sommige producten) ──────
  if (!v3Found) {
    try {
      const urlV2 = 'https://world.openfoodfacts.org/api/v2/product/' + barcode + '.json?fields=' + fields;
      const rawV2 = await httpsGet(urlV2);
      console.log('[OFF v2]', barcode, '→ status:', rawV2.status, '| product:', !!rawV2.product);
      // v2: status is getal 1 (gevonden) of 0 (niet gevonden)
      if (rawV2.status === 1 && rawV2.product) {
        raw = rawV2;
      } else {
        return null; // ook v2 vindt het niet
      }
    } catch (err) {
      console.warn('[OFF v2] Request fout:', err.message);
      return null;
    }
  }

  const p = raw.product;
  const n = p.nutriments || {};

  // Energie: prefereer kcal, anders kJ omzetten
  const energyKcal =
    n['energy-kcal_100g'] != null
      ? n['energy-kcal_100g']
      : n['energy_100g'] != null
      ? Math.round(n['energy_100g'] / 4.184)
      : null;

  // Allergens: normaliseer naar Nederlandse sleutels ("en:peanuts" → "pinda")
  const allergens = normalizeAllergens(p.allergens_tags || []);

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
