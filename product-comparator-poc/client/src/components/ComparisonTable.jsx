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
    key: 'price_per_100g',
    label: 'Prijs per 100 g',
    render: (p) => (p.price_per_100g != null ? formatPrice(p.price_per_100g) : 'Niet gevonden'),
    bestKey: 'price_per_100g',
    confidenceField: 'price',
  },
  {
    key: 'energy_kcal',
    label: 'Calorieën per 100 g',
    render: (p) => formatNutrition(p.nutrition_per_100g?.energy_kcal, 'kcal'),
    bestKey: 'energy_kcal',
    confidenceField: 'nutrition',
  },
  {
    key: 'sugar_g',
    label: 'Suiker per 100 g',
    render: (p) => formatNutrition(p.nutrition_per_100g?.sugar_g, 'g'),
    bestKey: 'sugar_g',
    confidenceField: 'nutrition',
  },
  {
    key: 'salt_g',
    label: 'Zout per 100 g',
    render: (p) => formatNutrition(p.nutrition_per_100g?.salt_g, 'g'),
    bestKey: 'salt_g',
    confidenceField: 'nutrition',
  },
  {
    key: 'fat_g',
    label: 'Vet per 100 g',
    render: (p) => formatNutrition(p.nutrition_per_100g?.fat_g, 'g'),
    bestKey: null,
    confidenceField: 'nutrition',
  },
  {
    key: 'protein_g',
    label: 'Eiwitten per 100 g',
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
    <span className="ml-1 text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-medium">
      Onzeker
    </span>
  );
}

export default function ComparisonTable({ result }) {
  const { products, comparison } = result;
  const best = comparison?.best ?? {};

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold text-gray-900 mb-3">Vergelijkingstabel</h2>
      <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full min-w-[380px] bg-white text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-36">
                Criterium
              </th>
              {products.map((p, i) => (
                <th key={p.id} className="px-4 py-3 text-center">
                  <div className="font-semibold text-gray-800 leading-tight">
                    {p.name ?? `Product ${i + 1}`}
                  </div>
                  {p.brand && (
                    <div className="text-xs text-gray-400 font-normal">{p.brand}</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CRITERIA.map((criterion, rowIdx) => (
              <tr
                key={criterion.key}
                className={`border-b border-gray-50 last:border-0 ${
                  rowIdx % 2 === 1 ? 'bg-gray-50/60' : ''
                }`}
              >
                <td className="px-4 py-3 text-gray-600 font-medium whitespace-nowrap">
                  {criterion.label}
                </td>
                {products.map((p) => {
                  const isBest = criterion.bestKey != null && best[criterion.bestKey] === p.id;
                  return (
                    <td
                      key={p.id}
                      className={`px-4 py-3 text-center transition-colors ${
                        isBest ? 'bg-green-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        <span className={`font-medium ${isBest ? 'text-green-700' : 'text-gray-800'}`}>
                          {criterion.render(p)}
                        </span>
                        {isBest && (
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">
                            Beste
                          </span>
                        )}
                        <ConfidenceBadge
                          confidence={p.confidence}
                          field={criterion.confidenceField}
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
