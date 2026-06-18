import React from 'react';
import ProductCapture from './ProductCapture.jsx';

export default function ProductList({
  products,
  setProducts,
  onAnalyze,
  onUseDemoProducts,
  canAnalyze,
  demoMode,
}) {
  function updateProduct(index, updated) {
    const next = [...products];
    next[index] = updated;
    setProducts(next);
  }

  function removeProduct(index) {
    setProducts(products.filter((_, i) => i !== index));
  }

  function addProduct() {
    if (products.length >= 5) return;
    setProducts([
      ...products,
      { id: `product_${Date.now()}`, images: [], previewUrls: [] },
    ]);
  }

  const hasAnyImage = products.some((p) => p.images.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Stap 1 — Producten toevoegen
        </h2>
        <span className="text-xs text-gray-400">min. 2 producten</span>
      </div>

      {products.map((product, index) => (
        <ProductCapture
          key={product.id}
          product={product}
          index={index}
          onUpdate={(updated) => updateProduct(index, updated)}
          onRemove={() => removeProduct(index)}
          canRemove={products.length > 2}
        />
      ))}

      {products.length < 5 && (
        <button
          onClick={addProduct}
          className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-3 text-sm text-gray-400 hover:border-purple-200 hover:text-purple-500 transition-colors font-medium"
        >
          + Product toevoegen
        </button>
      )}

      {/* Action buttons */}
      <div className="pt-2 space-y-3">
        {/* Demo button – altijd zichtbaar als er nog geen foto's zijn */}
        {!hasAnyImage && (
          <button
            onClick={onUseDemoProducts}
            className="w-full bg-purple-50 hover:bg-purple-100 active:bg-purple-200 text-purple-700 font-semibold py-3.5 rounded-xl border border-purple-200 transition-colors"
          >
            🎭 Gebruik demo-producten (pindakaas)
          </button>
        )}

        {/* Analyse button – zichtbaar als er foto's zijn OF als demoMode actief is */}
        {(hasAnyImage || demoMode) && (
          <button
            onClick={onAnalyze}
            disabled={!canAnalyze}
            className={`w-full font-semibold py-3.5 rounded-xl transition-colors ${
              canAnalyze
                ? 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {demoMode && !hasAnyImage ? '🎭 Demo starten' : '🔍 Analyse starten'}
          </button>
        )}

        {demoMode && (
          <p className="text-center text-xs text-gray-400">
            Demo-modus actief – mockdata wordt gebruikt, geen OpenAI-call
          </p>
        )}
      </div>
    </div>
  );
}
