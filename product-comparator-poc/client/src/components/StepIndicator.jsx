import React from 'react';

const STEPS = [
  { num: 1, label: 'Barcode' },
  { num: 2, label: 'Producten' },
  { num: 3, label: 'Profiel' },
  { num: 4, label: 'Analyse' },
  { num: 5, label: 'Resultaat' },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-1 py-5 mt-2">
      {STEPS.map((step, i) => (
        <React.Fragment key={step.num}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 font-rethink ${
                currentStep > step.num
                  ? 'bg-brand-blue text-white'
                  : currentStep === step.num
                  ? 'bg-brand-blue text-white ring-4 ring-brand-blue/20'
                  : 'bg-brand-light text-brand-dark/40'
              }`}
            >
              {currentStep > step.num ? '✓' : step.num}
            </div>
            <span
              className={`text-xs font-medium transition-colors font-rethink ${
                currentStep >= step.num ? 'text-brand-dark' : 'text-brand-dark/40'
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`w-12 h-0.5 mb-5 transition-all duration-300 ${
                currentStep > step.num ? 'bg-brand-blue' : 'bg-brand-dark/20'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
