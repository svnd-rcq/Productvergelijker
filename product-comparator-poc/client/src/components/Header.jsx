import React from 'react';

export default function Header() {
  return (
    <header className="bg-brand-dark border-b border-brand-dark shadow-sm sticky top-0 z-20">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center">
        <div className="bg-white rounded-xl px-3 py-1.5 shadow-sm">
          <img
            src="/Qompare text logo.png"
            alt="Qompare"
            className="h-6 w-auto"
          />
        </div>
      </div>
    </header>
  );
}
