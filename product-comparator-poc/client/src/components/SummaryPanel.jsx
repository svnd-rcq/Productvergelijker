import React from 'react';

const INSIGHT_CONFIG = [
  { key: 'price_per_100g', icon: '💰', template: (n) => `${n} is goedkoper per 100 gram` },
  { key: 'sugar_g', icon: '🍬', template: (n) => `${n} bevat minder suiker` },
  { key: 'protein_g', icon: '💪', template: (n) => `${n} bevat meer eiwitten` },
  { key: 'salt_g', icon: '🧂', template: (n) => `${n} bevat minder zout` },
  { key: 'energy_kcal', icon: '🔥', template: (n) => `${n} heeft minder calorieën per 100 gram` },
];

export default function SummaryPanel({ result }) {
  const { products, comparison, summary } = result;
  const best = comparison?.best ?? {};

  // Tel winsten per product
  const wins = {};
  products.forEach((p) => (wins[p.id] = 0));
  Object.values(best).forEach((id) => {
    if (id) wins[id] = (wins[id] ?? 0) + 1;
  });
  const winnerId = Object.entries(wins).sort((a, b) => b[1] - a[1])[0]?.[0];
  const winner = products.find((p) => p.id === winnerId);

  // Bouw inzicht-lijst
  const insights = INSIGHT_CONFIG.flatMap(({ key, icon, template }) => {
    if (!best[key]) return [];
    const w = products.find((p) => p.id === best[key]);
    return w ? [{ icon, text: template(w.name) }] : [];
  });

  return (
    <div className="mt-5 bg-purple-50 border border-purple-100 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🤖</span>
        <h3 className="font-bold text-purple-900 text-base">AI Samenvatting</h3>
      </div>

      {winner && (
        <div className="bg-white rounded-xl p-3 mb-4 border border-purple-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
            🏆
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">Aanbevolen product</div>
            <div className="font-semibold text-gray-800 text-sm">{winner.name}</div>
          </div>
        </div>
      )}

      {summary && (
        <p className="text-sm text-gray-700 mb-4 leading-relaxed">{summary}</p>
      )}

      {insights.length > 0 && (
        <ul className="space-y-2">
          {insights.map((insight, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-base leading-5 flex-shrink-0">{insight.icon}</span>
              <span>{insight.text}</span>
            </li>
          ))}
          <li className="flex items-start gap-2 text-sm text-amber-700">
            <span className="text-base leading-5 flex-shrink-0">⚠️</span>
            <span>Controleer bij twijfel altijd het originele etiket</span>
          </li>
        </ul>
      )}
    </div>
  );
}
