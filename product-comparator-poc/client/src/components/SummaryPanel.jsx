import React from 'react';
import { PROFILES } from './ProfileSelector.jsx';

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
  { key: 'sugar_g', icon: '🍬', template: (n) => `${n} bevat minder suiker` },
  { key: 'protein_g', icon: '💪', template: (n) => `${n} bevat meer eiwitten` },
  { key: 'salt_g', icon: '🧂', template: (n) => `${n} bevat minder zout` },
  { key: 'energy_kcal', icon: '🔥', template: (n) => `${n} heeft minder calorieën per 100 gram` },
];

const UNAVAILABLE_PROFILES = ['biologisch', 'vegan', 'minst_bewerkt'];

export default function SummaryPanel({ result }) {
  const { products, comparison, summary } = result;
  const best = comparison?.best ?? {};
  const profileWinner = comparison?.profileWinner ?? null;
  const profiles = comparison?.profiles ?? [];
  const allergens = comparison?.allergens ?? [];

  // Profiel-labels ophalen
  const profileLabels = profiles
    .map((key) => PROFILES.find((p) => p.key === key))
    .filter(Boolean);

  // Winnaar: eerst profileWinner, dan terugvallen op meeste criteria
  let winner = profileWinner ? products.find((p) => p.id === profileWinner) : null;
  if (!winner) {
    const wins = {};
    products.forEach((p) => (wins[p.id] = 0));
    Object.values(best).forEach((id) => {
      if (id) wins[id] = (wins[id] ?? 0) + 1;
    });
    const winnerId = Object.entries(wins).sort((a, b) => b[1] - a[1])[0]?.[0];
    winner = products.find((p) => p.id === winnerId);
  }

  // Bouw inzicht-lijst
  const insights = INSIGHT_CONFIG.flatMap(({ key, icon, template }) => {
    if (!best[key]) return [];
    const w = products.find((p) => p.id === best[key]);
    return w ? [{ icon, text: template(displayName(w)) }] : [];
  });

  // Allergiecheck-inzicht
  const allergyHits = [];
  if (profiles.includes('allergiecheck') && allergens.length > 0) {
    const allergenLabel = allergens.join(', ');
    products.forEach((p) => {
      const productAllergens = (p.allergens || []).map((a) => a.toLowerCase());
      const conflicting = allergens.filter((a) => productAllergens.includes(a.toLowerCase()));
      if (conflicting.length > 0) {
        allergyHits.push({ product: p, conflicting });
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

  // Profielen die onvoldoende data hebben
  const unavailableSelected = profiles.filter((p) => UNAVAILABLE_PROFILES.includes(p));

  if (!winner) return null;

  return (
    <div className="mt-5 bg-brand-dark border border-brand-dark rounded-2xl p-4">
      {profileLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {profileLabels.map((p) => (
            <span
              key={p.key}
              className="inline-flex items-center gap-1 bg-brand-blue/20 border border-brand-blue/40 text-brand-light text-xs font-medium px-2.5 py-1 rounded-full font-rethink"
            >
              {p.icon} {p.label}
            </span>
          ))}
        </div>
      )}
      <div className="bg-white/10 rounded-xl p-3 border border-brand-blue/30 flex items-center gap-3">
        <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
          🏆
        </div>
        <div>
          <div className="text-xs text-brand-light/60 font-medium font-rethink">Aanbevolen product</div>
          <div className="font-semibold text-white text-sm font-rethink">{displayName(winner)}</div>
        </div>
      </div>

      {allergyHits.length > 0 && (
        <div className="mt-3 space-y-2">
          {allergyHits.map(({ product, conflicting }) => (
            <div
              key={product.id}
              className="flex items-start gap-3 bg-red-600 border border-red-400 rounded-xl p-3"
            >
              <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                🤧
              </div>
              <div>
                <div className="text-white font-bold text-sm font-rethink leading-tight">
                  Let op: allergiewaarschuwing!
                </div>
                <div className="text-red-100 text-sm font-rethink mt-0.5">
                  <span className="font-semibold">{displayName(product)}</span> bevat{' '}
                  {conflicting.map((a, i) => (
                    <span key={a}>
                      <span className="font-bold uppercase">{a}</span>
                      {i < conflicting.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
