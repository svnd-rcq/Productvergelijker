/**
 * Formatteer een prijs als "€ 2.49" of "Niet gevonden"
 */
export function formatPrice(value) {
  if (value === null || value === undefined) return 'Niet gevonden';
  return `€\u00a0${Number(value).toFixed(2)}`;
}

/**
 * Formatteer een voedingswaarde als "25 g" of "Niet gevonden"
 */
export function formatNutrition(value, unit) {
  if (value === null || value === undefined) return 'Niet gevonden';
  const formatted = unit === 'kcal' ? Math.round(value) : value;
  return `${formatted}\u00a0${unit}`;
}

/**
 * Formatteer hoeveelheid-object als "350 g" of "Niet gevonden"
 */
export function formatQuantity(quantity) {
  if (!quantity || quantity.value === null || quantity.value === undefined)
    return 'Niet gevonden';
  const unit = quantity.unit ?? '';
  return `${quantity.value}${unit ? `\u00a0${unit}` : ''}`;
}
