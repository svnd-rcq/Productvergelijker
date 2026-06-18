const OpenAI = require('openai');

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let store, product;
  try {
    ({ store, product } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Ongeldige JSON' }) };
  }

  if (!store || !product) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'store en product zijn verplicht' }),
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Geen OpenAI API key geconfigureerd' }),
    };
  }

  try {
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Je bent een Nederlandse supermarkt prijsvergelijker. Geef realistische Nederlandse supermarktprijzen. Antwoord ALLEEN met geldig JSON, geen extra tekst of markdown.',
        },
        {
          role: 'user',
          content:
            `Schat de winkelprijs (in euros) voor dit product bij deze Nederlandse supermarkt:\n` +
            `Supermarkt: ${store}\n` +
            `Product: ${product}\n\n` +
            `Antwoord met dit exacte JSON formaat:\n` +
            `{"price": <getal met twee decimalen>, "unit": "<verpakkingseenheid bv 400g of 1L>", "confidence": "laag|gemiddeld|hoog"}\n\n` +
            `Als je geen redelijke schatting kunt maken, gebruik dan: {"price": null, "unit": null, "confidence": "laag"}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 120,
    });

    const raw = (completion.choices[0]?.message?.content ?? '').trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        price: typeof parsed.price === 'number' ? parsed.price : null,
        unit: parsed.unit ?? null,
        confidence: parsed.confidence ?? 'laag',
      }),
    };
  } catch (err) {
    console.error('[price-suggest] fout:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Fout bij ophalen prijssuggestie' }),
    };
  }
};
