/**
 * Normaliseert allergeen-namen (Engels/OFF-formaat) naar Nederlandse sleutels
 * die overeenkomen met de keuzes in de gebruikersinterface.
 *
 * Open Food Facts en OpenAI retourneren allergenen als Engelse tags,
 * bijv. "en:peanuts" → "peanuts". De app gebruikt Nederlandse sleutels
 * zoals "pinda", "melk", etc.
 */

const ENGLISH_TO_DUTCH = {
  // Pinda
  'peanuts':               'pinda',
  'peanut':                'pinda',
  // Melk
  'milk':                  'melk',
  'dairy':                 'melk',
  'lactose':               'melk',
  // Noten (boomvruchten)
  'nuts':                  'noten',
  'tree-nuts':             'noten',
  'tree nuts':             'noten',
  'almonds':               'noten',
  'hazelnuts':             'noten',
  'walnuts':               'noten',
  'cashews':               'noten',
  'pistachios':            'noten',
  'macadamia':             'noten',
  'pecan':                 'noten',
  'brazil-nuts':           'noten',
  'brazil nuts':           'noten',
  'pine-nuts':             'noten',
  'pine nuts':             'noten',
  // Ei
  'eggs':                  'ei',
  'egg':                   'ei',
  // Soja
  'soybeans':              'soja',
  'soy':                   'soja',
  'soya':                  'soja',
  'soybeans':              'soja',
  // Sesam
  'sesame':                'sesam',
  'sesame-seeds':          'sesam',
  'sesame seeds':          'sesam',
  // Schaaldieren
  'crustaceans':           'schaaldieren',
  'crustacean-products':   'schaaldieren',
  'crustacean products':   'schaaldieren',
  // Vis
  'fish':                  'vis',
  // Gluten / granen
  'gluten':                'gluten',
  'wheat':                 'gluten',
  'rye':                   'gluten',
  'barley':                'gluten',
  'oats':                  'gluten',
  'spelt':                 'gluten',
  'kamut':                 'gluten',
  'cereals-containing-gluten': 'gluten',
  'cereals containing gluten': 'gluten',
};

/**
 * Zet één allergeen-tag om naar een Nederlandse sleutel.
 * Strips eerst eventuele taal-prefix (bijv. "en:", "nl:").
 * Geeft de originele (kleine letters) terug als er geen mapping is.
 *
 * @param {string} tag
 * @returns {string}
 */
function normalizeAllergen(tag) {
  if (!tag) return '';
  // Strip taal-prefix: "en:peanuts" → "peanuts"
  const stripped = tag.replace(/^[a-z]{2,5}:/, '').trim().toLowerCase();
  return ENGLISH_TO_DUTCH[stripped] || stripped;
}

/**
 * Normaliseert een array van allergeen-tags naar unieke Nederlandse sleutels.
 *
 * @param {string[]} tags
 * @returns {string[]}
 */
function normalizeAllergens(tags) {
  if (!Array.isArray(tags)) return [];
  const normalized = tags.map(normalizeAllergen).filter(Boolean);
  // Uniek houden
  return [...new Set(normalized)];
}

module.exports = { normalizeAllergen, normalizeAllergens };
