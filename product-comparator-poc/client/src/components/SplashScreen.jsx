import React, { useState } from 'react';

export default function SplashScreen({ onDismiss }) {
  const [fading, setFading] = useState(false);

  function handleTap() {
    if (fading) return;
    setFading(true);
    setTimeout(onDismiss, 600);
  }

  return (
    <div
      onClick={handleTap}
      className="fixed inset-0 z-50 cursor-pointer select-none"
      style={{
        transition: 'opacity 600ms ease',
        opacity: fading ? 0 : 1,
      }}
    >
      <img
        src="/Frontend RC Qompare.jpg"
        alt="Qompare"
        className="w-full h-full object-cover"
        draggable={false}
      />
    </div>
  );
}
