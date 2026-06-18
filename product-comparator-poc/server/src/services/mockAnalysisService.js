const { mockProducts, mockSummary } = require('../data/mockProducts');
const { compareProducts } = require('./comparisonService');

/**
 * Retourneert altijd de vaste pindakaas-mockdata.
 * Mapt de ontvangen product-IDs op de mock-producten zodat IDs kloppen.
 */
async function analyze(products) {
  const analyzedProducts = products.map((p, index) => {
    const mock = mockProducts[index] || mockProducts[mockProducts.length - 1];
    return { ...mock, id: p.id };
  });

  const best = compareProducts(analyzedProducts);

  return {
    category: 'food',
    products: analyzedProducts,
    comparison: { best },
    summary: mockSummary,
  };
}

module.exports = { analyze };
