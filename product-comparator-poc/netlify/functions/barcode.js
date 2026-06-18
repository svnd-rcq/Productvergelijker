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

  const barcode = event.queryStringParameters?.barcode || '';

  if (!/^\d{8,14}$/.test(barcode)) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Ongeldige barcode. Verwacht 8–14 cijfers.' }),
    };
  }

  try {
    const product = await lookup(barcode);

    if (!product) {
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Geen product gevonden voor deze barcode.' }),
      };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(product),
    };
  } catch (err) {
    console.error('[Barcode] Lookup fout:', err.message);
    return {
      statusCode: 502,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Fout bij ophalen van productgegevens. Probeer het opnieuw.' }),
    };
  }
};
