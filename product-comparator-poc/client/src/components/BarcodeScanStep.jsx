import React, { useState, useRef, useEffect, useCallback } from 'react';

// Status per product:
// idle         → beginscherm, toon "Scan barcode"-knop
// scanning     → camera modal open, ZXing actief
// looking-up   → barcode gelezen, bezig met backend-lookup
// found        → product gevonden, toon naam/merk
// not-found    → barcode gelezen, maar geen product in database
// scan-error   → barcode niet leesbaar binnen timeout
// photo-needed → gebruiker kiest voor foto-fallback

const SCAN_TIMEOUT_MS = 15000;

const PRICE_AWARE_PROFILES = ['bewuste_keuze', 'budgetbewust', 'gezin_balans', 'sportief'];

export default function BarcodeScanStep({ products, onNext, selectedProfiles = [] }) {
  const [statuses, setStatuses] = useState(() =>
    Object.fromEntries(
      products.map((p) => [p.id, { state: 'idle', data: null }]),
    ),
  );
  const [priceInputs, setPriceInputs] = useState(() =>
    Object.fromEntries(products.map((p) => [p.id, ''])),
  );
  const [toast, setToast] = useState(null); // { type: 'yellow'|'red', message }
  const [activeScan, setActiveScan] = useState(null); // productId dat nu scant

  const videoRef      = useRef(null);
  const controlsRef   = useRef(null);
  const timeoutRef    = useRef(null);
  const fileInputsRef = useRef({});

  const allReady = products.every((p) => {
    const s = statuses[p.id]?.state;
    return s === 'found' || s === 'photo-needed';
  });

  // ─── helpers ────────────────────────────────────────────────────────────────

  const setStatus = useCallback((productId, update) => {
    setStatuses((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], ...update },
    }));
  }, []);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
  }, []);

  // ─── foto-upload fallback ────────────────────────────────────────────────────

  const handleFileUpload = useCallback((productId, fileList) => {
    const files = Array.from(fileList);
    if (!files.length) return;

    // Reset het input-element zodat hetzelfde bestand opnieuw gekozen kan worden
    if (fileInputsRef.current[productId]) {
      fileInputsRef.current[productId].value = '';
    }

    let loaded = 0;
    const newImages = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        newImages.push(ev.target.result);
        loaded++;
        if (loaded === files.length) {
          setStatuses((prev) => ({
            ...prev,
            [productId]: {
              ...prev[productId],
              state: 'photo-needed',
              images: [...(prev[productId]?.images ?? []), ...newImages],
            },
          }));
          setToast(null);
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  // ─── camera cleanup ─────────────────────────────────────────────────────────

  const stopCamera = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (controlsRef.current) {
      try { controlsRef.current.stop(); } catch { /* ignore */ }
      controlsRef.current = null;
    }
    setActiveScan(null);
  }, []);

  // ─── ZXing scanning (starts when activeScan changes) ────────────────────────

  useEffect(() => {
    if (!activeScan || !videoRef.current) return;

    const productId = activeScan;
    let cancelled = false;

    async function startZXing() {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser');
        const { DecodeHintType, BarcodeFormat } = await import('@zxing/library');

        const hints = new Map();
        hints.set(DecodeHintType.TRY_HARDER, true);
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.CODE_128,
          BarcodeFormat.CODE_39,
          BarcodeFormat.QR_CODE,
          BarcodeFormat.DATA_MATRIX,
        ]);

        const reader = new BrowserMultiFormatReader(hints);

        // decodeFromVideoDevice start de camera en roept de callback per frame aan
        reader.decodeFromVideoDevice(
          undefined,           // deviceId undefined = standaard achterste camera
          videoRef.current,
          async (result, _err, controls) => {
            if (!controlsRef.current && controls) {
              controlsRef.current = controls;
            }
            if (cancelled || !result) return;

            // ── Barcode gelezen ──────────────────────────────────────────────
            cancelled = true;
            clearTimeout(timeoutRef.current);
            try { controls?.stop(); } catch { /* ignore */ }
            setActiveScan(null);
            setStatus(productId, { state: 'looking-up' });

            try {
              const barcode = result.getText();
              const apiBase = import.meta.env.VITE_API_URL ?? '';
              const res = await fetch(
                `${apiBase}/api/barcode/${encodeURIComponent(barcode)}`,
              );

              if (res.ok) {
                const data = await res.json();
                setStatus(productId, { state: 'found', data });
              } else {
                setStatus(productId, { state: 'not-found', data: null });
                showToast(
                  'red',
                  'We hebben geen voedingswaarden gevonden op basis van deze barcode. ' +
                  'Maak een foto van de voedingswaardetabel, dan proberen we de informatie uit de verpakking te halen.',
                );
              }
            } catch {
              setStatus(productId, { state: 'not-found', data: null });
              showToast(
                'red',
                'We hebben geen voedingswaarden gevonden op basis van deze barcode. ' +
                'Maak een foto van de voedingswaardetabel, dan proberen we de informatie uit de verpakking te halen.',
              );
            }
          },
        );
      } catch {
        if (!cancelled) {
          cancelled = true;
          clearTimeout(timeoutRef.current);
          setActiveScan(null);
          setStatus(productId, { state: 'scan-error' });
          showToast(
            'yellow',
            'Geen toegang tot de camera. Controleer de camera-machtigingen in je browser.',
          );
        }
      }

      // Timeout: barcode niet leesbaar binnen SCAN_TIMEOUT_MS
      timeoutRef.current = setTimeout(() => {
        if (!cancelled) {
          cancelled = true;
          try { controlsRef.current?.stop(); } catch { /* ignore */ }
          controlsRef.current = null;
          setActiveScan(null);
          setStatus(productId, { state: 'scan-error' });
          showToast(
            'yellow',
            'De barcode is niet goed leesbaar. Probeer opnieuw te scannen of maak een foto van de voedingswaardetabel.',
          );
        }
      }, SCAN_TIMEOUT_MS);
    }

    startZXing();

    return () => {
      cancelled = true;
      clearTimeout(timeoutRef.current);
      try { controlsRef.current?.stop(); } catch { /* ignore */ }
      controlsRef.current = null;
    };
  }, [activeScan, setStatus, showToast]);

  const showPriceInput = selectedProfiles.some((p) => PRICE_AWARE_PROFILES.includes(p));

  function handlePriceConfirm(productId) {
    const raw = priceInputs[productId];
    const price = parseFloat(raw.replace(',', '.'));
    if (isNaN(price) || price <= 0) return;
    setStatuses((prev) => {
      const data = prev[productId]?.data ?? {};
      const qty = data.quantity?.value;
      const unit = data.quantity?.unit;
      const price_per_100g =
        qty && (unit === 'g' || unit === 'ml')
          ? Math.round((price / qty) * 100 * 100) / 100
          : null;
      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          data: { ...data, price, price_per_100g },
          priceConfirmed: true,
        },
      };
    });
  }

  // ─── navigatie naar volgende stap ───────────────────────────────────────────

  function handleNext() {
    const barcodeResults = Object.fromEntries(
      products.map((p) => [p.id, statuses[p.id]?.data ?? null]),
    );
    const uploadedImages = Object.fromEntries(
      products.map((p) => [p.id, statuses[p.id]?.images ?? []]),
    );
    // Naar foto-stap alleen als een product photo-needed is én nog geen foto heeft geüpload
    const anyNeedsPhoto = products.some(
      (p) =>
        statuses[p.id]?.state === 'photo-needed' &&
        !(statuses[p.id]?.images?.length),
    );
    onNext(barcodeResults, anyNeedsPhoto, uploadedImages);
  }

  // ─── render helpers ──────────────────────────────────────────────────────────

  const letter = (index) => String.fromCharCode(65 + index);

  // ─── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* Toast melding */}
      {toast && (
        <div
          className={`rounded-xl p-3 text-sm font-medium flex items-start gap-2 ${
            toast.type === 'yellow'
              ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <span aria-hidden="true">{toast.type === 'yellow' ? '⚠️' : '❌'}</span>
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-auto opacity-60 hover:opacity-100 transition-opacity text-lg leading-none"
            aria-label="Melding sluiten"
          >
            ✕
          </button>
        </div>
      )}

      {/* Product-kaarten */}
      {products.map((product, index) => {
        const status = statuses[product.id] ?? { state: 'idle', data: null };

        return (
          <div
            key={product.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
          >
            {/* Koptekst */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-brand-blue/10 rounded-lg flex items-center justify-center">
                <span className="text-brand-blue text-sm font-bold font-rethink">
                  {letter(index)}
                </span>
              </div>
              <span className="font-semibold text-gray-800 text-sm">
                Product {letter(index)}
              </span>
            </div>

            {/* Idle — scan-knop */}
            {status.state === 'idle' && (
              <button
                onClick={() => {
                  setStatus(product.id, { state: 'scanning' });
                  setActiveScan(product.id);
                }}
                className="w-full bg-brand-blue hover:bg-brand-dark active:bg-brand-dark text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 font-rethink"
              >
                Barcode scannen
              </button>
            )}

            {/* Scanning — wacht op camera-modal */}
            {status.state === 'scanning' && (
              <div className="text-center text-sm text-brand-dark/50 py-3 font-rethink">
                <div className="animate-spin inline-block w-5 h-5 border-2 border-brand-blue/30 border-t-brand-blue rounded-full mr-2" />
                Camera openen…
              </div>
            )}

            {/* Looking up — backend-lookup actief */}
            {status.state === 'looking-up' && (
              <div className="text-center text-sm text-brand-dark/50 py-3 font-rethink">
                <div className="animate-spin inline-block w-5 h-5 border-2 border-brand-blue/30 border-t-brand-blue rounded-full mr-2" />
                Product opzoeken…
              </div>
            )}

            {/* Found — product gevonden */}
            {status.state === 'found' && status.data && (
              <div className="space-y-2">
                <div className="flex items-start gap-3 bg-brand-green/10 border border-brand-green/30 rounded-xl p-3">
                  <span className="text-brand-green text-lg mt-0.5" aria-hidden="true">✓</span>
                  <div>
                    <p className="text-sm font-semibold text-brand-dark font-rethink">
                      {status.data.name || 'Onbekend product'}
                    </p>
                    {status.data.brand && (
                      <p className="text-xs text-brand-dark/60 font-rethink">{status.data.brand}</p>
                    )}
                    {status.data.quantity?.value && (
                      <p className="text-xs text-brand-dark/50 font-rethink">
                        {status.data.quantity.value}&thinsp;{status.data.quantity.unit}
                      </p>
                    )}
                  </div>
                </div>

                {/* Prijs-invoer: toon alleen als profiel prijsbewust is én prijs onbekend */}
                {showPriceInput && !status.data.price && !status.priceConfirmed && (
                  <div className="bg-brand-light border border-brand-blue/20 rounded-xl p-3 space-y-2">
                    <p className="text-xs text-brand-dark/70 font-rethink">
                      💰 Wat is de prijs van dit product? (optioneel)
                    </p>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark/50 text-sm">€</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={priceInputs[product.id]}
                          onChange={(e) =>
                            setPriceInputs((prev) => ({ ...prev, [product.id]: e.target.value }))
                          }
                          onKeyDown={(e) => e.key === 'Enter' && handlePriceConfirm(product.id)}
                          className="w-full pl-7 pr-3 py-2 border border-brand-blue/30 rounded-lg text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue/40 font-rethink"
                        />
                      </div>
                      <button
                        onClick={() => handlePriceConfirm(product.id)}
                        className="bg-brand-blue hover:bg-brand-dark text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors font-rethink"
                      >
                        OK
                      </button>
                      <button
                        onClick={() =>
                          setStatuses((prev) => ({
                            ...prev,
                            [product.id]: { ...prev[product.id], priceConfirmed: true },
                          }))
                        }
                        className="text-xs text-brand-dark/40 hover:text-brand-blue px-2 font-rethink"
                      >
                        Overslaan
                      </button>
                    </div>
                  </div>
                )}

                {/* Bevestiging nadat prijs is ingevuld */}
                {showPriceInput && status.priceConfirmed && status.data.price && (
                  <p className="text-xs text-brand-green font-medium font-rethink">
                    💰 Prijs opgeslagen: € {Number(status.data.price).toFixed(2)}
                  </p>
                )}

                <button
                  onClick={() => setStatus(product.id, { state: 'idle', data: null })}
                  className="text-xs text-brand-dark/40 hover:text-brand-blue font-medium transition-colors font-rethink"
                >
                  Opnieuw scannen
                </button>
              </div>
            )}

            {/* Not-found of scan-error — toon fallback-opties */}
            {(status.state === 'not-found' || status.state === 'scan-error') && (
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={(el) => { fileInputsRef.current[product.id] = el; }}
                  onChange={(e) => handleFileUpload(product.id, e.target.files)}
                />
                <button
                  onClick={() => fileInputsRef.current[product.id]?.click()}
                  className="w-full bg-brand-light hover:bg-brand-blue/20 active:bg-brand-blue/30 border border-brand-blue/30 text-brand-dark font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 font-rethink"
                >
                  <span aria-hidden="true">📁</span> Foto uploaden
                </button>
                <button
                  onClick={() => setStatus(product.id, { state: 'photo-needed' })}
                  className="w-full bg-brand-light hover:bg-brand-blue/20 active:bg-brand-blue/30 border border-brand-blue/30 text-brand-dark font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 font-rethink"
                >
                  <span aria-hidden="true">📸</span> Foto maken in volgende stap
                </button>
                <button
                  onClick={() => {
                    setStatus(product.id, { state: 'idle' });
                    setToast(null);
                  }}
                  className="w-full text-xs text-brand-dark/40 hover:text-brand-blue font-medium transition-colors py-1 font-rethink"
                >
                  Opnieuw scannen
                </button>
              </div>
            )}

            {/* Photo-needed — geüploade foto's tonen of foto-stap bevestigen */}
            {status.state === 'photo-needed' && (
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={(el) => { fileInputsRef.current[product.id] = el; }}
                  onChange={(e) => handleFileUpload(product.id, e.target.files)}
                />
                {status.images?.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex gap-2 flex-wrap">
                      {status.images.map((src, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={src}
                            alt={`Foto ${i + 1}`}
                            className="w-20 h-20 object-cover rounded-xl border border-brand-light"
                          />
                          <button
                            onClick={() =>
                              setStatuses((prev) => ({
                                ...prev,
                                [product.id]: {
                                  ...prev[product.id],
                                  images: prev[product.id].images.filter((_, idx) => idx !== i),
                                },
                              }))
                            }
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center leading-none"
                            aria-label="Foto verwijderen"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => fileInputsRef.current[product.id]?.click()}
                        className="w-20 h-20 border-2 border-dashed border-brand-blue/30 rounded-xl flex items-center justify-center text-brand-blue/50 hover:border-brand-blue transition-colors"
                        aria-label="Meer foto's toevoegen"
                      >
                        <span className="text-2xl leading-none">+</span>
                      </button>
                    </div>
                    <p className="text-xs text-brand-green font-medium font-rethink">
                      ✓ {status.images.length} foto{status.images.length !== 1 ? "'s" : ''} toegevoegd
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 bg-brand-light border border-brand-blue/20 rounded-xl p-3">
                      <span className="text-brand-blue text-lg mt-0.5" aria-hidden="true">📸</span>
                      <p className="text-sm text-brand-dark flex-1 font-rethink">
                        Maak een scherpe foto van de voedingswaardetabel in de volgende stap.
                      </p>
                    </div>
                    <button
                      onClick={() => fileInputsRef.current[product.id]?.click()}
                      className="w-full bg-brand-light hover:bg-brand-blue/20 border border-brand-blue/30 text-brand-dark font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 font-rethink"
                    >
                      <span aria-hidden="true">📁</span> Toch liever foto uploaden
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setStatus(product.id, { state: 'idle' })}
                  className="text-xs text-brand-dark/40 hover:text-brand-blue font-medium transition-colors font-rethink"
                >
                  Herstart
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Camera-modal (gedeeld voor alle producten) */}
      {activeScan && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Barcode scannen"
        >
          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-sm shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-brand-light">
              <span className="font-semibold text-brand-dark text-sm font-rethink">
                Barcode scannen
              </span>
              <button
                onClick={() => {
                  stopCamera();
                  setStatus(activeScan, { state: 'idle' });
                }}
                className="text-brand-dark/40 hover:text-brand-dark text-xl leading-none transition-colors"
                aria-label="Camera sluiten"
              >
                ✕
              </button>
            </div>

            {/* Camera-beeld */}
            <div className="relative bg-black">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={videoRef}
                className="w-full aspect-video object-cover"
                autoPlay
                muted
                playsInline
              />
              {/* Scan-overlay met richtlijn */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-3/4 h-20 border-2 border-brand-blue rounded-xl opacity-80" />
              </div>
            </div>

            {/* Instructie */}
            <p className="px-4 py-3 text-xs text-brand-dark/50 text-center font-rethink">
              Richt de camera op de barcode van het product
            </p>
          </div>
        </div>
      )}

      {/* Volgende-knop — zichtbaar zodra alle producten gereed zijn */}
      {allReady && (
        <button
          onClick={handleNext}
          className="w-full bg-brand-blue hover:bg-brand-dark active:bg-brand-dark text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm font-rethink"
        >
          Volgende →
        </button>
      )}
    </div>
  );
}
