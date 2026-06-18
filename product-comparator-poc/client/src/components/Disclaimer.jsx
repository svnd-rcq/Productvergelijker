import React from 'react';

export default function Disclaimer() {
  return (
    <div className="mt-4 bg-brand-dark/5 border border-brand-blue/20 rounded-xl px-4 py-3 flex items-start gap-2">
      <span className="text-brand-blue text-sm flex-shrink-0 mt-0.5">&#9432;</span>
      <p className="text-xs text-brand-dark/70 leading-relaxed font-rethink">
        Gegevens zijn automatisch herkend uit foto's met AI. Controleer bij twijfel altijd het
        originele productlabel in de winkel.
      </p>
    </div>
  );
}
