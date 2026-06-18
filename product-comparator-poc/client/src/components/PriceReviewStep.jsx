import React, { useState, useEffect } from 'react';

/**
 * PriceReviewStep
 *
 * Shown after barcode scan when a price-aware profile is selected.
 * For each scanned product, fetch an OpenAI price suggestion using
 * the product name from barcodeData, then let the user confirm / correct.
 *
 * Props:
 *   products     – array of product objects from App state
 *   store        – store name string (from storeContext)
 *   onNext       – (confirmedPrices: { [productId]: number|null }) => void
 *   onSkip       – () => void
 */
export default function PriceReviewStep({ products, store, onNext, onSkip }) {
  // { [productId]: { status: 'idle'|'loading'|'found'|'error', price: number|null, unit: string|null, inputValue: string } }
  const [priceState, setPriceState] = useState(() =>
    Object.fromEntries(
      products.map((p) => [p.id, { status: 'idle', price: null, unit: null, inputValue: '' }])
    )
  );

  function setProductPrice(productId, patch) {
    setPriceState((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], ...patch },
    }));
  }

  async function fetchPrice(productId, productName) {
    if (!productName || !store) return;
    setProductPrice(productId, { status: 'loading' });

    try {
      const apiBase = import.meta.env.VITE_API_URL ?? '';
      const response = await fetch(`${apiBase}/api/price-suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store, product: productName }),
      });

      if (!response.ok) throw new Error('fetch failed');
      const data = await response.json();

      if (typeof data.price === 'number') {
        const formatted = data.price.toFixed(2).replace('.', ',');
        setProductPrice(productId, {
          status: 'found',
          price: data.price,
          unit: data.unit ?? null,
          inputValue: formatted,
        });
      } else {
        setProductPrice(productId, { status: 'error', price: null, inputValue: '' });
      }
    } catch {
      setProductPrice(productId, { status: 'error', price: null, inputValue: '' });
    }
  }

  // Auto-fetch for every product that has a name from barcodeData
  useEffect(() => {
    products.forEach((p) => {
      const name = p.barcodeData?.name;
      if (name) fetchPrice(p.id, name);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleNext() {
    const confirmedPrices = Object.fromEntries(
      products.map((p) => {
        const raw = priceState[p.id]?.inputValue ?? '';
        const parsed = parseFloat(raw.replace(',', '.'));
        return [p.id, isNaN(parsed) ? null : parsed];
      })
    );
    onNext(confirmedPrices);
  }

  const letter = (i) => String.fromCharCode(65 + i);

  return (
    <div className="mt-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-brand-dark font-rethink mb-1">
          Prijssuggestie controleren
        </h2>
        <p className="text-sm text-brand-dark/60 font-rethink">
          Op basis van <span className="font-medium text-brand-dark">{store}</span> en de gescande producten. Pas de prijs aan als die niet klopt.
        </p>
      </div>

      <div className="space-y-3">
        {products.map((product, index) => {
          const ps = priceState[product.id];
          const bd = product.barcodeData;
          const productName = bd?.name ?? null;
          const brand = bd?.brand ?? null;
          const hasBarcode = !!bd;

          return (
            <div key={product.id} className="bg-white rounded-2xl border border-brand-light p-4 space-y-3">
              {/* Product header */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-brand-blue/10 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-brand-blue text-sm font-bold font-rethink">{letter(index)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-brand-dark font-rethink truncate">
                    {productName ?? `Product ${letter(index)}`}
                  </p>
                  {brand && (
                    <p className="text-xs text-brand-dark/50 font-rethink">{brand}</p>
                  )}
                </div>
              </div>

              {/* No barcode found */}
              {!hasBarcode && (
                <p className="text-xs text-brand-dark/40 font-rethink italic">
                  Geen barcode gescand — prijs overgeslagen
                </p>
              )}

              {/* Has barcode, no name */}
              {hasBarcode && !productName && (
                <p className="text-xs text-orange-600 font-rethink">
                  Productnaam onbekend — geen prijssuggestie mogelijk
                </p>
              )}

              {/* Loading */}
              {hasBarcode && productName && ps.status === 'loading' && (
                <div className="flex items-center gap-2 text-xs text-brand-dark/50 font-rethink">
                  <span className="animate-spin">⏳</span> Prijs ophalen…
                </div>
              )}

              {/* Found or error — show editable input */}
              {hasBarcode && productName && (ps.status === 'found' || ps.status === 'error') && (
                <div className="space-y-1.5">
                  {ps.status === 'found' && (
                    <p className="text-xs text-brand-dark/50 font-rethink">
                      Geschatte prijs bij {store}{ps.unit ? ` · ${ps.unit}` : ''} — je kunt dit aanpassen
                    </p>
                  )}
                  {ps.status === 'error' && (
                    <p className="text-xs text-orange-600 font-rethink">
                      Geen prijs gevonden — vul zelf in
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-brand-dark/60 font-rethink">€</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={ps.inputValue}
                      onChange={(e) =>
                        setProductPrice(product.id, { inputValue: e.target.value })
                      }
                      placeholder="0,00"
                      className="w-28 rounded-lg border border-brand-light px-3 py-2 text-sm font-semibold font-rethink focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-2 pt-2">
        <button
          onClick={handleNext}
          className="w-full bg-brand-blue hover:bg-brand-dark text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm font-rethink"
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
