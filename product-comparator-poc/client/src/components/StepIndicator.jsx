import React from 'react';

const STEPS = [
  { num: 1, label: 'Producten' },
  { num: 2, label: 'Analyse' },
  { num: 3, label: 'Resultaat' },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-1 py-5 mt-2">
      {STEPS.map((step, i) => (
        <React.Fragment key={step.num}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                currentStep > step.num
                  ? 'bg-purple-600 text-white'
                  : currentStep === step.num
                  ? 'bg-purple-600 text-white ring-4 ring-purple-100'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {currentStep > step.num ? '✓' : step.num}
            </div>
            <span
              className={`text-xs font-medium transition-colors ${
                currentStep >= step.num ? 'text-purple-700' : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`w-12 h-0.5 mb-5 transition-all duration-300 ${
                currentStep > step.num ? 'bg-purple-500' : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
