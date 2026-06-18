const mockAnalysisService = require('../../server/src/services/mockAnalysisService');
const openaiAnalysisService = require('../../server/src/services/openaiAnalysisService');

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

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { products, profiles, allergens } = JSON.parse(event.body || '{}');

    if (!products || !Array.isArray(products) || products.length < 2) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Minimaal twee producten zijn vereist.' }),
      };
    }

    const safeProfiles = Array.isArray(profiles) && profiles.length > 0 ? profiles : ['bewuste_keuze'];
    const safeAllergens = Array.isArray(allergens) ? allergens : [];
    const demoMode = process.env.DEMO_MODE !== 'false';
    const result = demoMode
      ? await mockAnalysisService.analyze(products, safeProfiles, safeAllergens)
      : await openaiAnalysisService.analyze(products, safeProfiles, safeAllergens);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Analyse fout:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Analyse mislukt.', details: error.message }),
    };
  }
};
