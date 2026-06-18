import React from 'react';
import { formatPrice, formatNutrition, formatQuantity } from '../utils/formatters.js';

const CRITERIA = [
  {
    key: 'price',
    label: 'Prijs',
    render: (p) => formatPrice(p.price),
    bestKey: null,
    confidenceField: 'price',
  },
  {
    key: 'quantity',
    label: 'Inhoud',
    render: (p) => formatQuantity(p.quantity),
    bestKey: null,
    confidenceField: 'quantity',
  },
  {
    key: '_divider',
    label: null,
    render: null,
    bestKey: null,
    confidenceField: null,
    divider: true,
  },
  {
    key: 'price_per_100g',
    label: 'Prijs',
    render: (p) => (p.price_per_100g != null ? formatPrice(p.price_per_100g) : 'Niet gevonden'),
    bestKey: 'price_per_100g',
    confidenceField: 'price',
  },
  {
    key: 'energy_kcal',
    label: 'Calorieën',
    render: (p) => formatNutrition(p.nutrition_per_100g?.energy_kcal, 'kcal'),
    bestKey: 'energy_kcal',
    confidenceField: 'nutrition',
  },
  {
    key: 'sugar_g',
    label: 'Suiker',
    render: (p) => formatNutrition(p.nutrition_per_100g?.sugar_g, 'g'),
    bestKey: 'sugar_g',
    confidenceField: 'nutrition',
  },
  {
    key: 'salt_g',
    label: 'Zout',
    render: (p) => formatNutrition(p.nutrition_per_100g?.salt_g, 'g'),
    bestKey: 'salt_g',
    confidenceField: 'nutrition',
  },
  {
    key: 'fat_g',
    label: 'Vet',
    render: (p) => formatNutrition(p.nutrition_per_100g?.fat_g, 'g'),
    bestKey: null,
    confidenceField: 'nutrition',
  },
  {
    key: 'protein_g',
    label: 'Eiwitten',
    render: (p) => formatNutrition(p.nutrition_per_100g?.protein_g, 'g'),
    bestKey: 'protein_g',
    confidenceField: 'nutrition',
  },
  {
    key: 'allergens',
    label: 'Allergenen',
    render: (p) => {
      const list = p.allergens;
      if (!list || list.length === 0) return 'Geen / onbekend';
      return list.map((a) => a.charAt(0).toUpperCase() + a.slice(1)).join(', ');
    },
    bestKey: null,
    confidenceField: null,
  },
];

function ConfidenceBadge({ confidence, field }) {
  const val = confidence?.[field];
  if (val == null || val >= 0.75) return null;
  return (
    <span className="ml-1 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-medium font-rethink">
      Onzeker
    </span>
  );
}

export default function ComparisonTable({ result }) {
  const { products, comparison } = result;
  const best = comparison?.best ?? {};

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-brand-dark mb-3 font-rethink">Vergelijkingstabel</h2>
      <div className="overflow-x-auto rounded-2xl border border-brand-light shadow-sm">
        <table className="w-full bg-white text-sm">
          <thead>
            <tr className="bg-brand-dark border-b border-brand-dark/80">
              <th className="text-left text-xs font-semibold text-brand-light uppercase tracking-wide px-3 py-3 w-24 font-rethink">
                Criterium
              </th>
              {products.map((p, i) => (
                <th key={p.id} className="px-2 py-3 text-center">
                  <div className="font-semibold text-white leading-tight font-rethink">
                    {p.name ?? `Product ${i + 1}`}
                  </div>
                  {p.brand && (
                    <div className="text-xs text-brand-light/60 font-normal font-rethink">{p.brand}</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CRITERIA.map((criterion, rowIdx) => {
              if (criterion.divider) {
                return (
                  <tr key={criterion.key}>
                    <td
                      colSpan={products.length + 1}
                      className="px-3 py-1.5 bg-brand-light/60 text-brand-dark/50 text-xs font-semibold uppercase tracking-wide font-rethink"
                    >
                      Per 100 g
                    </td>
                  </tr>
                );
              }
              return (
              <tr
                key={criterion.key}
                className={`border-b border-gray-50 last:border-0 ${
                  rowIdx % 2 === 1 ? 'bg-brand-light/40' : ''
                }`}
              >
                <td className="px-3 py-3 text-brand-dark font-medium text-xs leading-snug font-rethink">
                  {criterion.label}
                </td>
                {products.map((p) => {
                  const isBest = criterion.bestKey != null && best[criterion.bestKey] === p.id;
                  return (
                    <td
                      key={p.id}
                      className={`px-2 py-3 text-center transition-colors ${
                        isBest ? 'bg-brand-green/30' : ''
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        <span className={`font-medium font-rethink ${isBest ? 'text-brand-green' : 'text-brand-dark'}`}>
                          {criterion.render(p)}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
