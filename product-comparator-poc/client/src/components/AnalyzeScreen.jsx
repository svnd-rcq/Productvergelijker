import React, { useState, useEffect } from 'react';

const STEPS = [
  { label: 'Tekst herkennen via OCR', icon: '🔤' },
  { label: 'Productinformatie ophalen', icon: '📦' },
  { label: 'Voedingswaarden extraheren', icon: '🥗' },
  { label: 'Vergelijking maken', icon: '⚖️' },
];

export default function AnalyzeScreen() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 850);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-14 flex flex-col items-center px-4">
      {/* Spinner */}
      <div className="w-14 h-14 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin mb-6" />

      <h2 className="text-xl font-semibold text-brand-dark mb-1 font-rethink">Producten analyseren…</h2>
      <p className="text-sm text-brand-dark/60 mb-8 text-center font-rethink">
        AI is bezig met het herkennen van de productinformatie
      </p>

      <div className="w-full max-w-sm space-y-3">
        {STEPS.map((step, i) => {
          const done = i < activeStep;
          const active = i === activeStep;
          return (
            <div
              key={i}
              className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-500 ${
                done
                  ? 'bg-brand-green/10 border-brand-green/40'
                  : active
                  ? 'bg-brand-blue/10 border-brand-blue/40'
                  : 'bg-brand-light/60 border-brand-light opacity-40'
              }`}
            >
              <span className="text-xl">{step.icon}</span>
              <span
                className={`flex-1 text-sm font-medium font-rethink ${
                  done ? 'text-brand-green' : active ? 'text-brand-blue' : 'text-brand-dark/30'
                }`}
              >
                {step.label}
              </span>
              {done && <span className="text-brand-green font-bold text-sm">✓</span>}
              {active && (
                <span className="w-4 h-4 border-2 border-brand-blue border-t-transparent rounded-full animate-spin inline-block" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
