const express = require('express');
const router = express.Router();
const mockAnalysisService = require('../services/mockAnalysisService');
const openaiAnalysisService = require('../services/openaiAnalysisService');

router.post('/', async (req, res) => {
  try {
    const { products, profiles, allergens } = req.body;

    if (!products || !Array.isArray(products) || products.length < 2) {
      return res.status(400).json({ error: 'Minimaal twee producten zijn vereist.' });
    }

    const safeProfiles = Array.isArray(profiles) && profiles.length > 0 ? profiles : ['bewuste_keuze'];
    const safeAllergens = Array.isArray(allergens) ? allergens : [];
    const demoMode = process.env.DEMO_MODE !== 'false';

    let result;
    if (demoMode) {
      result = await mockAnalysisService.analyze(products, safeProfiles, safeAllergens);
    } else {
      result = await openaiAnalysisService.analyze(products, safeProfiles, safeAllergens);
    }

    res.json(result);
  } catch (error) {
    console.error('Analyse fout:', error);
    res.status(500).json({ error: 'Analyse mislukt.', details: error.message });
  }
});

module.exports = router;
