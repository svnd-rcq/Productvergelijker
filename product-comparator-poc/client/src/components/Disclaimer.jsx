import React from 'react';

export default function Disclaimer() {
  return (
    <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
      <span className="text-amber-500 text-sm flex-shrink-0 mt-0.5">ℹ️</span>
      <p className="text-xs text-amber-700 leading-relaxed">
        Gegevens zijn automatisch herkend uit foto's met AI. Controleer bij twijfel altijd het
        originele productlabel in de winkel.
      </p>
    </div>
  );
}
