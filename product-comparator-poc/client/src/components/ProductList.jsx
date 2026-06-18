import React from 'react';
import ProductCapture from './ProductCapture.jsx';

export default function ProductList({
  products,
  setProducts,
  onAnalyze,
  onUseDemoProducts,
  canAnalyze,
  demoMode,
  photoUnreadableIds = [],
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
  // Producten zonder barcode-data hebben een foto nodig
  const productsNeedingPhoto = products.filter((p) => !p.barcodeData);
  const productsWithBarcode  = products.filter((p) =>  p.barcodeData);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-brand-dark uppercase tracking-wide font-rethink">
          Stap 2 — Voedingswaardetabel fotograferen
        </h2>
        <span className="text-xs text-brand-dark/50">min. 2 producten</span>
      </div>

      {/* Producten waarbij de barcode al gevonden is — compact samenvatting */}
      {productsWithBarcode.map((product) => {
        const idx = products.indexOf(product);
        const letter = String.fromCharCode(65 + idx);
        return (
          <div
            key={product.id}
            className="bg-brand-green/10 border border-brand-green/30 rounded-2xl px-4 py-3 flex items-center gap-3"
          >
              <div className="w-7 h-7 bg-brand-green/20 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-brand-dark text-sm font-bold font-rethink">{letter}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-brand-dark truncate font-rethink">
                {product.barcodeData.name || `Product ${letter}`}
              </p>
              {product.barcodeData.brand && (
                <p className="text-xs text-brand-dark/60 truncate font-rethink">{product.barcodeData.brand}</p>
              )}
            </div>
            <span className="text-xs text-brand-green font-medium shrink-0 font-rethink">✓ Barcode</span>
          </div>
        );
      })}

      {/* Producten die nog een foto nodig hebben */}
      {productsNeedingPhoto.map((product) => {
        const index = products.indexOf(product);
        return (
          <ProductCapture
            key={product.id}
            product={product}
            index={index}
            onUpdate={(updated) => updateProduct(index, updated)}
            onRemove={() => removeProduct(index)}
            canRemove={products.length > 2}
            isUnreadable={photoUnreadableIds.includes(product.id)}
          />
        );
      })}

      {products.length < 5 && (
        <button
          onClick={addProduct}
          className="w-full border-2 border-dashed border-brand-blue/30 rounded-2xl py-3 text-sm text-brand-dark/50 hover:border-brand-blue hover:text-brand-blue transition-colors font-medium font-rethink"
        >
          + Product toevoegen
        </button>
      )}

      {/* Action buttons */}
      <div className="pt-2 space-y-3">
        {/* Demo button – zichtbaar als er nog geen foto's en geen barcode-data zijn */}
        {!hasAnyImage && productsWithBarcode.length === 0 && (
          <button
            onClick={onUseDemoProducts}
            className="w-full bg-brand-light hover:bg-brand-blue/20 active:bg-brand-blue/30 text-brand-dark font-semibold py-3.5 rounded-xl border border-brand-blue/30 transition-colors font-rethink"
          >
            🎭 Gebruik demo-producten (pindakaas)
          </button>
        )}

        {/* Analyse button – zichtbaar als er foto's of barcode-data zijn OF als demoMode actief is */}
        {(hasAnyImage || productsWithBarcode.length > 0 || demoMode) && (
          <button
            onClick={onAnalyze}
            disabled={!canAnalyze}
            className={`w-full font-semibold py-3.5 rounded-xl transition-colors ${
              canAnalyze
                ? 'bg-brand-blue hover:bg-brand-dark active:bg-brand-dark text-white shadow-sm'
                : 'bg-brand-light text-brand-dark/30 cursor-not-allowed'
            }`}
          >
            {demoMode && !hasAnyImage ? '🎭 Demo starten' : '🔍 Analyse starten'}
          </button>
        )}

        {demoMode && (
          <p className="text-center text-xs text-brand-dark/50 font-rethink">
            Demo-modus actief – mockdata wordt gebruikt, geen OpenAI-call
          </p>
        )}
      </div>
    </div>
  );
}
