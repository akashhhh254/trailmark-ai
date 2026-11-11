import React, { useEffect, useState } from 'react';
import { BrandLogo } from './BrandLogo';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Smooth progress progression over ~1.6 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 100;
        }
        return prev + 20;
      });
    }, 280);

    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        onComplete();
      }, 400); // Wait for fade-out transition
    }, 1600);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#fafaf9] flex flex-col items-center justify-center transition-opacity duration-400 ease-out select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center text-center space-y-6 max-w-sm px-6">
        {/* TM Logo Mark with Subtle Pulse */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-mono font-extrabold text-2xl shadow-md transform transition-transform duration-700 scale-100 animate-in zoom-in-95">
            TM
          </div>
          <div className="absolute inset-0 rounded-2xl ring-4 ring-stone-900/5 animate-ping opacity-25" />
        </div>

        {/* Brand Name & Tagline */}
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight text-stone-900 font-sans">
            TRAILMARK
          </h1>
          <p className="text-xs text-stone-500 font-medium">
            Turn project chaos into clear direction.
          </p>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-36 h-1 bg-stone-200/80 rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-stone-800 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-[10px] text-stone-400 font-mono tracking-wider">
          INITIALIZING WORKSPACE
        </span>
      </div>
    </div>
  );
};
