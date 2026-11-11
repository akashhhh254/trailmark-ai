import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  theme = 'light',
  className = '',
}) => {
  const getSymbolSize = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6 text-[10px]';
      case 'md':
        return 'w-8 h-8 text-xs';
      case 'lg':
        return 'w-10 h-10 text-sm';
      case 'xl':
        return 'w-14 h-14 text-base';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'md':
        return 'text-sm';
      case 'lg':
        return 'text-base';
      case 'xl':
        return 'text-xl';
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* TM Minimalist Geometric Brandmark */}
      <div
        className={`${getSymbolSize()} rounded-lg flex items-center justify-center font-bold tracking-tighter transition-transform duration-200 ${
          isDark
            ? 'bg-white text-stone-900 shadow-sm'
            : 'bg-stone-900 text-white shadow-xs'
        }`}
        aria-label="Trailmark TM Logo"
      >
        <span className="font-mono tracking-tight font-extrabold">TM</span>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={`${getTextSize()} font-bold tracking-tight font-sans leading-none ${
              isDark ? 'text-white' : 'text-stone-900'
            }`}
          >
            TRAILMARK
          </span>
          <span
            className={`text-[9px] tracking-widest uppercase font-medium mt-0.5 leading-none ${
              isDark ? 'text-stone-400' : 'text-stone-500'
            }`}
          >
            Verified Handover
          </span>
        </div>
      )}
    </div>
  );
};
