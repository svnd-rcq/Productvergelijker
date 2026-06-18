import React, { useRef } from 'react';

export default function ProductCapture({ product, index, onUpdate, onRemove, canRemove }) {
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Reset the input so the same file can be re-selected
    e.target.value = '';

    const newImages = [...product.images];
    const newPreviews = [...product.previewUrls];
    let loaded = 0;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        newImages.push(ev.target.result);
        newPreviews.push(ev.target.result);
        loaded++;
        if (loaded === files.length) {
          onUpdate({ ...product, images: [...newImages], previewUrls: [...newPreviews] });
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function handleRemoveImage(imgIndex) {
    onUpdate({
      ...product,
      images: product.images.filter((_, i) => i !== imgIndex),
      previewUrls: product.previewUrls.filter((_, i) => i !== imgIndex),
    });
  }

  const letter = String.fromCharCode(65 + index);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      {/* Card header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-purple-700 text-sm font-bold">{letter}</span>
          </div>
          <span className="font-semibold text-gray-800 text-sm">Product {letter}</span>
        </div>
        {canRemove && (
          <button
            onClick={onRemove}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
          >
            Verwijderen
          </button>
        )}
      </div>

      {/* Preview grid + add button */}
      {product.previewUrls.length > 0 ? (
        <div className="flex gap-2 flex-wrap">
          {product.previewUrls.map((url, i) => (
            <div key={i} className="relative group">
              <img
                src={url}
                alt={`Foto ${i + 1}`}
                className="w-20 h-20 object-cover rounded-xl border border-gray-100"
              />
              <button
                onClick={() => handleRemoveImage(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center leading-none"
                aria-label="Foto verwijderen"
              >
                ×
              </button>
            </div>
          ))}
          {/* Add more button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:border-purple-300 hover:text-purple-400 transition-colors"
            aria-label="Meer foto's toevoegen"
          >
            <span className="text-2xl leading-none">+</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-purple-300 hover:bg-purple-50 transition-all group cursor-pointer"
        >
          <span className="text-3xl">📷</span>
          <span className="text-sm font-medium text-gray-500 group-hover:text-purple-600">
            Foto toevoegen
          </span>
          <span className="text-xs text-gray-400">Tik om te fotograferen of uploaden</span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
