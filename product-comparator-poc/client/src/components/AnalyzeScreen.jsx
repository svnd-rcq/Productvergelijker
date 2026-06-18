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
      <div className="w-14 h-14 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-6" />

      <h2 className="text-xl font-bold text-gray-900 mb-1">Producten analyseren…</h2>
      <p className="text-sm text-gray-500 mb-8 text-center">
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
                  ? 'bg-green-50 border-green-100'
                  : active
                  ? 'bg-purple-50 border-purple-200'
                  : 'bg-gray-50 border-gray-100 opacity-40'
              }`}
            >
              <span className="text-xl">{step.icon}</span>
              <span
                className={`flex-1 text-sm font-medium ${
                  done ? 'text-green-700' : active ? 'text-purple-700' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
              {done && <span className="text-green-500 font-bold text-sm">✓</span>}
              {active && (
                <span className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin inline-block" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
