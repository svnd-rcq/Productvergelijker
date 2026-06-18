import React from 'react';

function displayName(product) {
  if (!product) return '';
  const { name, brand } = product;
  if (brand && name && !name.toLowerCase().includes(brand.toLowerCase())) {
    return `${name} van ${brand}`;
  }
  return name || '';
}

const INSIGHT_CONFIG = [
  { key: 'price_per_100g', icon: '💰', template: (n) => `${n} is goedkoper per 100 gram` },
  { key: 'sugar_g',        icon: '🍬', template: (n) => `${n} bevat minder suiker` },
  { key: 'protein_g',      icon: '💪', template: (n) => `${n} bevat meer eiwitten` },
  { key: 'salt_g',         icon: '🧂', template: (n) => `${n} bevat minder zout` },
  { key: 'energy_kcal',    icon: '🔥', template: (n) => `${n} heeft minder calorieën per 100 gram` },
];

export default function InsightsCard({ result }) {
  const { products, comparison } = result;
  const best = comparison?.best ?? {};
  const profiles = comparison?.profiles ?? [];
  const allergens = comparison?.allergens ?? [];

  const insights = INSIGHT_CONFIG.flatMap(({ key, icon, template }) => {
    if (!best[key]) return [];
    const w = products.find((p) => p.id === best[key]);
    return w ? [{ icon, text: template(displayName(w)) }] : [];
  });

  // Allergiecheck
  if (profiles.includes('allergiecheck') && allergens.length > 0) {
    const allergenLabel = allergens.join(', ');
    products.forEach((p) => {
      const productAllergens = (p.allergens || []).map((a) => a.toLowerCase());
      const conflicting = allergens.filter((a) => productAllergens.includes(a.toLowerCase()));
      if (conflicting.length > 0) {
        insights.push({
          icon: '⚠️',
          text: `${displayName(p)} bevat: ${conflicting.join(', ')}`,
          warning: true,
        });
      }
    });
    if (!insights.some((i) => i.warning)) {
      insights.push({ icon: '✅', text: `Geen van de producten bevat ${allergenLabel}` });
    }
  }

  if (insights.length === 0) return null;

  return (
    <div className="mt-4 bg-brand-dark border border-brand-dark rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">📊</span>
        <h3 className="font-semibold text-white text-sm font-rethink">Samenvatting</h3>
      </div>
      <ul className="space-y-2">
        {insights.map((insight, i) => (
          <li
            key={i}
            className={`flex items-start gap-2 text-sm font-rethink ${
              insight.warning ? 'text-yellow-300' : 'text-brand-light'
            }`}
          >
            <span className="text-base leading-5 flex-shrink-0">{insight.icon}</span>
            <span>{insight.text}</span>
          </li>
        ))}
        <li className="flex items-start gap-2 text-sm text-yellow-300 font-rethink pt-1 border-t border-white/10 mt-1">
          <span className="text-base leading-5 flex-shrink-0">⚠️</span>
          <span>Controleer bij twijfel altijd het originele etiket</span>
        </li>
      </ul>
    </div>
  );
}
