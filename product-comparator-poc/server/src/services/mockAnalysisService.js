const { mockProducts, mockSummary } = require('../data/mockProducts');
const { compareProducts, getProfileWinner } = require('./comparisonService');

/**
 * Retourneert altijd de vaste pindakaas-mockdata.
 * Mapt de ontvangen product-IDs op de mock-producten zodat IDs kloppen.
 */
async function analyze(products, profiles = ['bewuste_keuze'], allergens = []) {
  const analyzedProducts = products.map((p, index) => {
    // Als het product al barcode-data heeft, gebruik die direct
    if (p.barcodeData) {
      return {
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
        confidence: p.barcodeData.confidence || {
          name: 0, brand: 0, price: 0, quantity: 0, nutrition: 0,
        },
      };
    }
    const mock = mockProducts[index] || mockProducts[mockProducts.length - 1];
    return { ...mock, id: p.id };
  });

  const best = compareProducts(analyzedProducts);
  const profileWinner = getProfileWinner(analyzedProducts, profiles, allergens);

  return {
    category: 'food',
    products: analyzedProducts,
    comparison: { best, profileWinner, profiles, allergens },
    summary: mockSummary,
  };
}

module.exports = { analyze };
