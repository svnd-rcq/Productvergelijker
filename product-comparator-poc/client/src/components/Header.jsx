import React from 'react';

export default function Header({ demoMode, onToggleDemoMode }) {
  return (
    <header className="bg-brand-dark border-b border-brand-dark shadow-sm sticky top-0 z-20">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/Reconneqt_logo_transparant_zonder_tagline.png"
            alt="Reconneqt"
            className="h-8 w-auto flex-shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-white leading-tight truncate font-rethink">
              Productvergelijker
            </h1>
            <p className="text-xs text-brand-light leading-tight hidden sm:block opacity-80">
              Vergelijk producten op basis van foto's, prijs en voedingswaarden.
            </p>
          </div>
        </div>

        <button
          onClick={onToggleDemoMode}
          title={demoMode ? 'Demo-modus actief – klik voor AI-modus' : 'AI-modus actief – klik voor demo-modus'}
          className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all font-rethink ${
            demoMode
              ? 'bg-brand-blue/20 text-brand-light border-brand-blue/40 hover:bg-brand-blue/30'
              : 'bg-brand-green/20 text-brand-light border-brand-green/40 hover:bg-brand-green/30'
          }`}
        >
          {demoMode ? '🎭 Demo' : '🤖 AI'}
        </button>
      </div>
    </header>
  );
}
