/**
 * Vergelijkingsservice – bepaalt deterministisch welk product het beste scoort per criterium.
 *
 * Regels:
 *   Lager is beter : price_per_100g, energy_kcal, sugar_g, salt_g
 *   Hoger is beter : protein_g
 *
 * Met profiel-ondersteuning: bepaal ook een profileWinner op basis van gekozen profielen.
 */

const ALL_CRITERIA = [
  { key: 'price_per_100g', path: 'price_per_100g', lowerIsBetter: true },
  { key: 'energy_kcal', path: 'nutrition_per_100g.energy_kcal', lowerIsBetter: true },
  { key: 'sugar_g', path: 'nutrition_per_100g.sugar_g', lowerIsBetter: true },
  { key: 'salt_g', path: 'nutrition_per_100g.salt_g', lowerIsBetter: true },
  { key: 'protein_g', path: 'nutrition_per_100g.protein_g', lowerIsBetter: false },
  { key: 'fat_g', path: 'nutrition_per_100g.fat_g', lowerIsBetter: true },
];

// Welke criteria elk profiel gebruikt (voor het bepalen van de profileWinner)
const PROFILE_CRITERIA = {
  bewuste_keuze:  ['sugar_g', 'salt_g', 'energy_kcal', 'price_per_100g'],
  minder_suiker:  ['sugar_g'],
  minder_zout:    ['salt_g'],
  lijnbewust:     ['energy_kcal', 'sugar_g', 'fat_g'],
  veel_eiwitten:  ['protein_g'],
  budgetbewust:   ['price_per_100g'],
  biologisch:     [], // vereist data buiten huidig model
  vegan:          [], // vereist data buiten huidig model
  allergiecheck:  [], // wordt apart afgehandeld via allergens
  minst_bewerkt:  [], // vereist ingrediëntendata
  sportief:       ['protein_g', 'energy_kcal', 'sugar_g', 'price_per_100g'],
  gezin_balans:   ['price_per_100g', 'sugar_g', 'salt_g', 'energy_kcal'],
};

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => {
    if (acc === null || acc === undefined) return null;
    return acc[key] !== undefined ? acc[key] : null;
  }, obj);
}

function winnerForCriterion(products, criterion) {
  const values = products.map((p) => ({
    id: p.id,
    value: getNestedValue(p, criterion.path),
  }));

  const valid = values.filter((v) => v.value !== null && v.value !== undefined);
  if (valid.length === 0) return null;

  const winner = criterion.lowerIsBetter
    ? valid.reduce((a, b) => (a.value < b.value ? a : b))
    : valid.reduce((a, b) => (a.value > b.value ? a : b));

  const tied = valid.filter((v) => v.value === winner.value);
  return tied.length > 1 ? null : winner.id;
}

/**
 * Bereken standaard per-criterium winnaar (altijd alle criteria).
 */
function compareProducts(products) {
  const best = {};
  for (const criterion of ALL_CRITERIA) {
    best[criterion.key] = winnerForCriterion(products, criterion);
  }
  return best;
}

/**
 * Bepaal de profileWinner: welk product past het best bij de gekozen profielen.
 * Telt winpunten per product over alle profiel-relevante criteria.
 *
 * Speciale logica voor allergiecheck: product zonder geselecteerde allergenen wint.
 */
function getProfileWinner(products, profiles = [], allergens = []) {
  if (!profiles || profiles.length === 0) return null;

  const scores = {};
  products.forEach((p) => (scores[p.id] = 0));

  // Verwerk allergen-check apart
  if (profiles.includes('allergiecheck') && allergens.length > 0) {
    products.forEach((p) => {
      const productAllergens = (p.allergens || []).map((a) => a.toLowerCase());
      const hasConflict = allergens.some((a) => productAllergens.includes(a.toLowerCase()));
      if (!hasConflict) scores[p.id] += 2; // geef meer gewicht aan allergen-check
    });
  }

  // Verzamel unieke criteria-sleutels voor alle geselecteerde profielen
  const criteriaKeys = new Set();
  profiles.forEach((profile) => {
    (PROFILE_CRITERIA[profile] || []).forEach((k) => criteriaKeys.add(k));
  });

  for (const key of criteriaKeys) {
    const criterion = ALL_CRITERIA.find((c) => c.key === key);
    if (!criterion) continue;
    const winnerId = winnerForCriterion(products, criterion);
    if (winnerId) scores[winnerId] = (scores[winnerId] || 0) + 1;
  }

  // Geen enkel relevant criterium gevonden
  if (Object.values(scores).every((s) => s === 0)) return null;

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  // Bij gelijke score: geen winnaar aanwijzen
  if (sorted.length >= 2 && sorted[0][1] === sorted[1][1]) return null;
  return sorted[0][0];
}

module.exports = { compareProducts, getProfileWinner, PROFILE_CRITERIA };

