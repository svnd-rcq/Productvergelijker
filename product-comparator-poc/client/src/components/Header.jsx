import React from 'react';

export default function Header({ demoMode, onToggleDemoMode }) {
  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-20">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-gray-900 leading-tight truncate">
              Productvergelijker
            </h1>
            <p className="text-xs text-gray-400 leading-tight hidden sm:block">
              Vergelijk producten op basis van foto's, prijs en voedingswaarden.
            </p>
          </div>
        </div>

        <button
          onClick={onToggleDemoMode}
          title={demoMode ? 'Demo-modus actief – klik voor AI-modus' : 'AI-modus actief – klik voor demo-modus'}
          className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
            demoMode
              ? 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200'
              : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
          }`}
        >
          {demoMode ? '🎭 Demo' : '🤖 AI'}
        </button>
      </div>
    </header>
  );
}
