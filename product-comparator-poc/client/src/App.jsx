import React, { useState } from 'react';
import SplashScreen from './components/SplashScreen.jsx';
import Header from './components/Header.jsx';
import StepIndicator from './components/StepIndicator.jsx';
import BarcodeScanStep from './components/BarcodeScanStep.jsx';
import ProductList from './components/ProductList.jsx';
import ProfileSelector from './components/ProfileSelector.jsx';
import AnalyzeScreen from './components/AnalyzeScreen.jsx';
import ComparisonTable from './components/ComparisonTable.jsx';
import SummaryPanel from './components/SummaryPanel.jsx';
import InsightsCard from './components/InsightsCard.jsx';
import Disclaimer from './components/Disclaimer.jsx';

const EMPTY_PRODUCTS = () => [
  { id: 'product_1', images: [], previewUrls: [] },
  { id: 'product_2', images: [], previewUrls: [] },
];

// Schermen: barcode | capture | profile | analyzing | result | error
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [screen, setScreen] = useState('profile');
  const [products, setProducts] = useState(EMPTY_PRODUCTS());
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [demoMode, setDemoMode] = useState(true);
  const [selectedProfiles, setSelectedProfiles] = useState(['bewuste_keuze']);
  const [selectedAllergens, setSelectedAllergens] = useState([]);

  const canAnalyze =
    demoMode || products.filter((p) => p.images.length > 0 || p.barcodeData).length >= 2;

  async function runAnalysis(productList, profiles = selectedProfiles, allergens = selectedAllergens) {
    setScreen('analyzing');
    setError(null);

    try {
      // Minimale wachttijd voor de animatie
      await new Promise((r) => setTimeout(r, 3600));

      const apiBase = import.meta.env.VITE_API_URL ?? '';
      const response = await fetch(`${apiBase}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: productList.map((p) => ({
            id: p.id,
            images: p.images,
            barcodeData: p.barcodeData ?? null,
          })),
          profiles,
          allergens,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Serverfout: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      setScreen('result');
    } catch (err) {
      console.error(err);
      setError(err.message);
      setScreen('error');
    }
  }

  /**
   * Callback van BarcodeScanStep.
   * barcodeResults: { [productId]: barcodeData | null }
   * anyNeedsPhoto:  true als minstens één product een foto-fallback vereist
   */
  function handleBarcodeNext(barcodeResults, anyNeedsPhoto, uploadedImages = {}) {
    const updatedProducts = products.map((p) => {
      const imgs = uploadedImages[p.id] ?? [];
      return {
        ...p,
        barcodeData: barcodeResults[p.id] ?? null,
        images: imgs.length ? imgs : p.images,
        previewUrls: imgs.length ? imgs : p.previewUrls,
      };
    });
    setProducts(updatedProducts);

    if (anyNeedsPhoto) {
      // Ga naar de foto-stap voor producten zonder barcode-data
      setScreen('capture');
    } else {
      // Alle producten hebben barcode-data — direct analyseren
      runAnalysis(updatedProducts);
    }
  }

  function handleProfileNext(profiles, allergens) {
    setSelectedProfiles(profiles);
    setSelectedAllergens(allergens);
    setScreen('barcode');
  }

  function handleAnalyze() {
    runAnalysis(products);
  }

  function handleUseDemoProducts() {
    const demoList = EMPTY_PRODUCTS(); // lege IDs, backend vult mockdata in
    setProducts(demoList);
    setDemoMode(true);
    runAnalysis(demoList, selectedProfiles, selectedAllergens);
  }

  function handleReset() {
    setScreen('profile');
    setProducts(EMPTY_PRODUCTS());
    setResult(null);
    setError(null);
  }

  // Stap 1 = profiel, stap 2 = barcode, stap 3 = analyse, stap 4 = resultaat
  const stepForScreen = { profile: 1, barcode: 2, capture: 2, analyzing: 3, result: 4, error: 1 };
  const screenForStep = { 1: 'profile', 2: 'barcode' };

  function handleStepClick(stepNum) {
    const target = screenForStep[stepNum];
    if (target) setScreen(target);
  }

  if (showSplash) {
    return <SplashScreen onDismiss={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-brand-light font-rethink">
      <Header demoMode={demoMode} onToggleDemoMode={() => setDemoMode((v) => !v)} />

      <main className="max-w-2xl mx-auto px-4 pb-16">
        {screen !== 'analyzing' && (
          <StepIndicator
            currentStep={stepForScreen[screen] ?? 1}
            onStepClick={handleStepClick}
          />
        )}

        {screen === 'barcode' && (
          <BarcodeScanStep
            products={products}
            onNext={handleBarcodeNext}
            selectedProfiles={selectedProfiles}
          />
        )}

        {screen === 'capture' && (
          <ProductList
            products={products}
            setProducts={setProducts}
            onAnalyze={handleAnalyze}
            onUseDemoProducts={handleUseDemoProducts}
            canAnalyze={canAnalyze}
            demoMode={demoMode}
          />
        )}

        {screen === 'profile' && (
          <ProfileSelector onNext={handleProfileNext} />
        )}

        {screen === 'analyzing' && <AnalyzeScreen />}

        {screen === 'result' && result && (
          <div className="space-y-1">
            <SummaryPanel result={result} />
            <ComparisonTable result={result} />
            <InsightsCard result={result} />
            <Disclaimer />
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setScreen('profile')}
                className="w-full sm:w-auto border border-brand-dark/30 hover:border-brand-dark text-brand-dark font-semibold py-3 px-8 rounded-xl transition-colors"
              >
                ← Terug naar profielen
              </button>
              <button
                onClick={handleReset}
                className="w-full sm:w-auto bg-brand-blue hover:bg-brand-dark active:bg-brand-dark text-white font-semibold py-3 px-8 rounded-xl transition-colors shadow-sm"
              >
                Vergelijk opnieuw
              </button>
            </div>
          </div>
        )}

        {screen === 'error' && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-red-700 font-bold text-lg mb-1">Analyse mislukt</h3>
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <p className="text-gray-600 text-sm mb-5">
              De analyse is niet gelukt. Gebruik het demo-resultaat of probeer opnieuw.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={handleReset}
                className="bg-white hover:bg-brand-light border border-brand-light text-brand-dark font-medium py-2.5 px-6 rounded-xl transition-colors"
              >
                Opnieuw proberen
              </button>
              <button
                onClick={handleUseDemoProducts}
                className="bg-brand-blue hover:bg-brand-dark text-white font-medium py-2.5 px-6 rounded-xl transition-colors"
              >
                🎭 Demo gebruiken
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
