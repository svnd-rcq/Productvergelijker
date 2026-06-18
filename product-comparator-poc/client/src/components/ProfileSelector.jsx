import React, { useState } from 'react';

export const PROFILES = [
  {
    key: 'bewuste_keuze',
    label: 'Bewuste keuze',
    icon: '⚖️',
    description: 'Balans tussen suiker, zout, calorieën en prijs per eenheid',
  },
  {
    key: 'minder_suiker',
    label: 'Minder suiker',
    icon: '🍬',
    description: 'Laagste suiker per 100g/ml',
  },
  {
    key: 'minder_zout',
    label: 'Minder zout',
    icon: '🧂',
    description: 'Laagste zout per 100g/ml',
  },
  {
    key: 'lijnbewust',
    label: 'Lijnbewust',
    icon: '🔥',
    description: 'Calorieën, suiker en verzadigd vet',
  },
  {
    key: 'veel_eiwitten',
    label: 'Veel eiwitten',
    icon: '💪',
    description: 'Hoogste eiwitten per 100g/ml',
  },
  {
    key: 'budgetbewust',
    label: 'Budgetbewust',
    icon: '💰',
    description: 'Laagste prijs per 100g/ml',
  },
  {
    key: 'biologisch',
    label: 'Biologisch',
    icon: '🌿',
    description: 'Biologische claims of keurmerken',
  },
  {
    key: 'vegan',
    label: 'Vegan',
    icon: '🥦',
    description: 'Vegan claim of ingrediëntencheck',
  },
  {
    key: 'allergiecheck',
    label: 'Allergiecheck',
    icon: '⚠️',
    description: 'Allergenen vermijden',
  },
  {
    key: 'minst_bewerkt',
    label: 'Minst bewerkt',
    icon: '🌾',
    description: 'Korte ingrediëntenlijst, minder toevoegingen',
  },
  {
    key: 'sportief',
    label: 'Sportief',
    icon: '🏃',
    description: 'Eiwitten, calorieën, suiker en prijs',
  },
  {
    key: 'gezin_balans',
    label: 'Gezin / balans',
    icon: '👨‍👩‍👧',
    description: 'Goede balans tussen prijs en voedingswaarden',
  },
];

export const ALLERGEN_OPTIONS = [
  { key: 'gluten', label: 'Gluten' },
  { key: 'melk', label: 'Melk' },
  { key: 'noten', label: 'Noten' },
  { key: 'pinda', label: "Pinda's" },
  { key: 'ei', label: 'Ei' },
  { key: 'soja', label: 'Soja' },
  { key: 'sesam', label: 'Sesam' },
  { key: 'schaaldieren', label: 'Schaaldieren' },
  { key: 'vis', label: 'Vis' },
];

export default function ProfileSelector({ onNext }) {
  const [selectedProfiles, setSelectedProfiles] = useState(['bewuste_keuze']);
  const [selectedAllergens, setSelectedAllergens] = useState([]);

  function toggleProfile(key) {
    setSelectedProfiles((prev) => {
      if (prev.includes(key)) {
        // Minimaal één profiel verplicht
        if (prev.length === 1) return prev;
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });
  }

  function toggleAllergen(key) {
    setSelectedAllergens((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  const showAllergenPicker = selectedProfiles.includes('allergiecheck');

  function handleNext() {
    onNext(selectedProfiles, selectedAllergens);
  }

  return (
    <div className="mt-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-brand-dark font-rethink mb-1">
          Waar wil je op letten?
        </h2>
        <p className="text-sm text-brand-dark/60 font-rethink">
          Kies één of meer profielen. De vergelijking past zich aan op jouw keuze.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PROFILES.map((profile) => {
          const isSelected = selectedProfiles.includes(profile.key);
          return (
            <button
              key={profile.key}
              onClick={() => toggleProfile(profile.key)}
              className={`flex flex-col items-start gap-1.5 rounded-2xl border-2 p-3.5 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-brand-blue bg-brand-blue/10 shadow-sm'
                  : 'border-brand-light bg-white hover:border-brand-blue/40 hover:bg-brand-light/60'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-2xl leading-none">{profile.icon}</span>
                {isSelected && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue text-white text-xs font-bold">
                    ✓
                  </span>
                )}
              </div>
              <span
                className={`text-sm font-semibold leading-tight font-rethink ${
                  isSelected ? 'text-brand-blue' : 'text-brand-dark'
                }`}
              >
                {profile.label}
              </span>
              <span className="text-xs text-brand-dark/50 leading-tight font-rethink line-clamp-2">
                {profile.description}
              </span>
            </button>
          );
        })}
      </div>

      {showAllergenPicker && (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm font-semibold text-yellow-800 mb-3 font-rethink">
            ⚠️ Welke allergenen wil je vermijden?
          </p>
          <div className="flex flex-wrap gap-2">
            {ALLERGEN_OPTIONS.map((allergen) => {
              const isActive = selectedAllergens.includes(allergen.key);
              return (
                <button
                  key={allergen.key}
                  onClick={() => toggleAllergen(allergen.key)}
                  className={`rounded-xl border px-3 py-1.5 text-sm font-medium font-rethink transition-all ${
                    isActive
                      ? 'border-yellow-600 bg-yellow-400 text-yellow-900'
                      : 'border-yellow-300 bg-white text-yellow-800 hover:bg-yellow-100'
                  }`}
                >
                  {allergen.label}
                </button>
              );
            })}
          </div>
          {selectedAllergens.length === 0 && (
            <p className="mt-2 text-xs text-yellow-700 font-rethink">
              Kies minimaal één allergeen om te vermijden.
            </p>
          )}
        </div>
      )}

      <button
        onClick={handleNext}
        disabled={showAllergenPicker && selectedAllergens.length === 0}
        className="w-full bg-brand-blue hover:bg-brand-dark disabled:bg-brand-dark/30 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm font-rethink"
      >
        Analyseer producten →
      </button>
    </div>
  );
}
