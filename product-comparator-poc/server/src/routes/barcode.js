const express = require('express');
const router = express.Router();
const { lookup } = require('../services/openFoodFactsService');

/**
 * GET /api/barcode/:barcode
 * Zoekt productinformatie op via Open Food Facts op basis van barcode.
 */
router.get('/:barcode', async (req, res) => {
  const { barcode } = req.params;

  console.log('[Barcode] Lookup aangevraagd voor:', barcode, '| type:', typeof barcode, '| lengte:', barcode.length);

  if (!/^\d{8,14}$/.test(barcode)) {
    console.log('[Barcode] Ongeldige barcode-formaat:', JSON.stringify(barcode));
    return res.status(400).json({
      error: 'Ongeldige barcode. Verwacht 8–14 cijfers.',
      received: barcode,
      hint: 'Zorg dat je de barcode (streepjescode) scant, niet een QR-code.',
    });
  }

  try {
    const product = await lookup(barcode);

    if (!product) {
      console.log('[Barcode] Niet gevonden in Open Food Facts:', barcode);
      return res.status(404).json({
        error: 'Geen product gevonden voor deze barcode.',
      });
    }

    console.log('[Barcode] Gevonden:', barcode, '->', product.name || '(naam onbekend)');
    res.json(product);
  } catch (err) {
    console.error('[Barcode] Lookup fout voor', barcode, ':', err.message);
    res.status(502).json({
      error: 'Fout bij ophalen van productgegevens. Probeer het opnieuw.',
    });
  }
});

module.exports = router;
