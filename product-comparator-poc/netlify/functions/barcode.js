const { lookup } = require('../../server/src/services/openFoodFactsService');

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event) => {
  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  // Barcode kan via querystring (redirect: ?barcode=...) of via het pad binnenkomen
  // Netlify redirect: /api/barcode/:barcode → /.netlify/functions/barcode?barcode=:barcode
  const qs = event.queryStringParameters || {};
  let barcode = qs.barcode || '';

  // Fallback: haal barcode uit het pad als querystring leeg is
  // event.path = /.netlify/functions/barcode of /api/barcode/1234567890123
  if (!barcode) {
    const pathMatch = (event.rawUrl || event.path || '').match(/\/(\d{8,14})(?:\?|$)/);
    if (pathMatch) barcode = pathMatch[1];
  }

  console.log('[Barcode Function] path:', event.path, '| barcode:', barcode, '| qs:', JSON.stringify(qs));

  if (!barcode || !/^\d{8,14}$/.test(barcode)) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Ongeldige barcode. Verwacht 8–14 cijfers.',
        received: barcode,
        hint: 'Zorg dat je de barcode (streepjescode) scant, niet een QR-code.',
      }),
    };
  }

  try {
    const product = await lookup(barcode);

    if (!product) {
      console.log('[Barcode Function] Niet gevonden:', barcode);
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Geen product gevonden voor deze barcode.' }),
      };
    }

    console.log('[Barcode Function] Gevonden:', barcode, '->', product.name || '(naam onbekend)');
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(product),
    };
  } catch (err) {
    console.error('[Barcode Function] Fout voor', barcode, ':', err.message);
    return {
      statusCode: 502,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Fout bij ophalen van productgegevens. Probeer het opnieuw.' }),
    };
  }
};
