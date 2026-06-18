const mockProducts = [
  {
    id: 'product_1',
    name: 'Calvé Pindakaas Stukjes',
    brand: 'Calvé',
    price: 2.49,
    quantity: { value: 350, unit: 'g' },
    price_per_100g: 0.71,
    nutrition_per_100g: {
      energy_kcal: 620,
      sugar_g: 8,
      salt_g: 0.4,
      protein_g: 25,
    },
    confidence: {
      name: 0.95,
      brand: 0.95,
      price: 0.9,
      quantity: 0.9,
      nutrition: 0.85,
    },
  },
  {
    id: 'product_2',
    name: 'AH 100% Pindakaas',
    brand: 'Albert Heijn',
    price: 3.19,
    quantity: { value: 500, unit: 'g' },
    price_per_100g: 0.64,
    nutrition_per_100g: {
      energy_kcal: 590,
      sugar_g: 5,
      salt_g: 0.7,
      protein_g: 27,
    },
    confidence: {
      name: 0.95,
      brand: 0.95,
      price: 0.9,
      quantity: 0.9,
      nutrition: 0.88,
    },
  },
];

const mockSummary =
  'AH 100% Pindakaas is goedkoper per 100 gram, bevat minder suiker en bevat meer eiwitten. ' +
  'Calvé Pindakaas Stukjes bevat minder zout. ' +
  'Als prijs per hoeveelheid, suiker en eiwitten belangrijk zijn, lijkt AH 100% Pindakaas de beste keuze. ' +
  'Controleer bij twijfel altijd het originele etiket.';

module.exports = { mockProducts, mockSummary };
