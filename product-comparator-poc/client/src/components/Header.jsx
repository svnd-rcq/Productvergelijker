import React from 'react';

export default function Header({ demoMode, onToggleDemoMode }) {
  return (
    <header className="bg-brand-dark border-b border-brand-dark shadow-sm sticky top-0 z-20">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center min-w-0">
          <div className="bg-white rounded-xl px-3 py-1.5 shadow-sm flex-shrink-0">
            <img
              src="/Qompare text logo.png"
              alt="Qompare"
              className="h-6 w-auto"
            />
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
