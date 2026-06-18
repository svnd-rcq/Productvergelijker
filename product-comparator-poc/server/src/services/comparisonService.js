/**
 * Vergelijkingsservice – bepaalt deterministisch welk product het beste scoort per criterium.
 *
 * Regels:
 *   Lager is beter : price_per_100g, energy_kcal, sugar_g, salt_g
 *   Hoger is beter : protein_g
 */

const CRITERIA = [
  { key: 'price_per_100g', path: 'price_per_100g', lowerIsBetter: true },
  { key: 'energy_kcal', path: 'nutrition_per_100g.energy_kcal', lowerIsBetter: true },
  { key: 'sugar_g', path: 'nutrition_per_100g.sugar_g', lowerIsBetter: true },
  { key: 'salt_g', path: 'nutrition_per_100g.salt_g', lowerIsBetter: true },
  { key: 'protein_g', path: 'nutrition_per_100g.protein_g', lowerIsBetter: false },
];

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => {
    if (acc === null || acc === undefined) return null;
    return acc[key] !== undefined ? acc[key] : null;
  }, obj);
}

function compareProducts(products) {
  const best = {};

  for (const criterion of CRITERIA) {
    const values = products.map((p) => ({
      id: p.id,
      value: getNestedValue(p, criterion.path),
    }));

    const valid = values.filter((v) => v.value !== null && v.value !== undefined);

    if (valid.length === 0) {
      best[criterion.key] = null;
      continue;
    }

    const winner = criterion.lowerIsBetter
      ? valid.reduce((a, b) => (a.value < b.value ? a : b))
      : valid.reduce((a, b) => (a.value > b.value ? a : b));

    // Bij gelijke score geen winnaar aanwijzen
    const tied = valid.filter((v) => v.value === winner.value);
    best[criterion.key] = tied.length > 1 ? null : winner.id;
  }

  return best;
}

module.exports = { compareProducts };
