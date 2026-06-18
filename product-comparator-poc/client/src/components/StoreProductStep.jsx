import React, { useState, useEffect } from 'react';

const STORES = [
  { key: 'albert_heijn', label: 'Albert Heijn' },
  { key: 'jumbo', label: 'Jumbo' },
  { key: 'lidl', label: 'Lidl' },
  { key: 'aldi', label: 'Aldi' },
  { key: 'plus', label: 'Plus' },
  { key: 'dirk', label: 'Dirk' },
  { key: 'spar', label: 'Spar' },
  { key: 'coop', label: 'Coop' },
  { key: 'hoogvliet', label: 'Hoogvliet' },
  { key: 'vomar', label: 'Vomar' },
  { key: 'dekamarkt', label: 'DekaMarkt' },
  { key: 'nettorama', label: 'Nettorama' },
];

export default function StoreProductStep({ onNext, onSkip }) {
  const [selectedStore, setSelectedStore] = useState(null);
  const [showCustomStore, setShowCustomStore] = useState(false);
  const [customStore, setCustomStore] = useState('');
  const [geoStatus, setGeoStatus] = useState('idle'); // idle | loading | granted | denied

  useEffect(() => {
    if (!navigator.geolocation) return;
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      () => setGeoStatus('granted'),
      () => setGeoStatus('denied'),
      { timeout: 5000 }
    );
  }, []);

  const activeStoreName = showCustomStore
    ? customStore.trim()
    : STORES.find((s) => s.key === selectedStore)?.label ?? '';

  const storeSelected = activeStoreName.length > 0;

  function handleNext() {
    onNext({ store: activeStoreName });
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-brand-dark font-rethink mb-1">
          In welke winkel ben je?
        </h2>
        <p className="text-sm text-brand-dark/60 font-rethink">
          Kies jouw winkel zodat we na het scannen een prijssuggestie kunnen geven.
        </p>
        {geoStatus === 'granted' && (
          <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1 font-rethink">
            📍 Locatie bepaald
          </span>
        )}
      </div>

      {/* Store grid */}
      {!showCustomStore && (
        <div className="grid grid-cols-3 gap-2">
          {STORES.map((store) => {
            const isSelected = selectedStore === store.key;
            return (
              <button
                key={store.key}
                onClick={() => setSelectedStore(store.key)}
                className={`rounded-xl border-2 py-2.5 px-2 text-sm font-medium font-rethink text-center transition-all duration-150 ${
                  isSelected
                    ? 'border-brand-blue bg-brand-blue/10 text-brand-blue'
                    : 'border-brand-light bg-white text-brand-dark hover:border-brand-blue/40 hover:bg-brand-light/60'
                }`}
              >
                {store.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Custom store input */}
      {showCustomStore && (
        <input
          type="text"
          value={customStore}
          onChange={(e) => setCustomStore(e.target.value)}
          placeholder="Naam van de winkel"
          className="w-full rounded-xl border border-brand-light px-4 py-3 text-sm font-rethink focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          autoFocus
        />
      )}

      <button
        onClick={() => {
          setShowCustomStore(!showCustomStore);
          setSelectedStore(null);
          setCustomStore('');
        }}
        className="text-xs text-brand-dark/50 hover:text-brand-dark font-rethink transition-colors"
      >
        {showCustomStore ? '← Terug naar lijst' : 'Winkel niet in lijst? Typ hier →'}
      </button>

      {/* Actions */}
      <div className="space-y-2 pt-2">
        <button
          onClick={handleNext}
          disabled={!storeSelected}
          className="w-full bg-brand-blue hover:bg-brand-dark disabled:bg-brand-dark/30 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm font-rethink"
        >
          Doorgaan →
        </button>
        <button
          onClick={onSkip}
          className="w-full text-brand-dark/50 hover:text-brand-dark text-sm font-rethink py-1 transition-colors"
        >
          Overslaan
        </button>
      </div>
    </div>
  );
}
