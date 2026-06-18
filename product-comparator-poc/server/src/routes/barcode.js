const express = require('express');
const router = express.Router();
const { lookup } = require('../services/openFoodFactsService');

/**
 * GET /api/barcode/:barcode
 * Zoekt productinformatie op via Open Food Facts op basis van barcode.
 * Retourneert 400 bij ongeldig formaat, 404 als product niet gevonden is.
 */
router.get('/:barcode', async (req, res) => {
  const { barcode } = req.params;

  if (!/^\d{8,14}$/.test(barcode)) {
    return res.status(400).json({ error: 'Ongeldige barcode. Verwacht 8–14 cijfers.' });
  }

  try {
    const product = await lookup(barcode);

    if (!product) {
      return res.status(404).json({
        error: 'Geen product gevonden voor deze barcode.',
      });
    }

    res.json(product);
  } catch (err) {
    console.error('[Barcode] Lookup fout:', err.message);
    res.status(502).json({
      error: 'Fout bij ophalen van productgegevens. Probeer het opnieuw.',
    });
  }
});

module.exports = router;
