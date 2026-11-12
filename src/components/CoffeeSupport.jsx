import React from 'react';
import { Coffee, Heart, ExternalLink, Sparkles } from 'lucide-react';
import { MONETIZATION_CONFIG } from '../config/siteConfig';

export default function CoffeeSupport({
  variant = 'button',
  className = '',
  title = 'Enjoying AnkiDeckStudio?',
  subtitle = 'Keep this tool 100% free, private & ad-light by buying the developer a coffee.'
}) {
  const { coffeeUrl, coffeeSuggestedPrice } = MONETIZATION_CONFIG;

  if (variant === 'button') {
    return (
      <a
        href={coffeeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold
                   bg-amber-100 text-amber-900 border border-amber-300
                   hover:bg-amber-200 hover:border-amber-400 active:scale-95
                   transition-all duration-150 shadow-sm ${className}`}
        title={`Support AnkiDeckStudio with a ${coffeeSuggestedPrice} coffee on Gumroad`}
      >
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-400 text-amber-950">
          <Coffee className="w-3 h-3" />
        </span>
        <span>Buy Me a Coffee</span>
        <span className="bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded text-[10px] font-bold">
          {coffeeSuggestedPrice}
        </span>
      </a>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        className={`bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 
                   rounded-2xl p-5 my-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center 
                   justify-between gap-4 ${className}`}
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 shadow-sm">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" /> Tip Jar
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5 max-w-xl leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        <a
          href={coffeeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold
                     bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200
                     hover:from-amber-600 hover:to-orange-600 hover:shadow-lg hover:-translate-y-0.5
                     transition-all duration-150 shrink-0 self-stretch sm:self-auto justify-center"
        >
          <Coffee className="w-4 h-4" />
          <span>Buy Me a Coffee ({coffeeSuggestedPrice})</span>
          <ExternalLink className="w-3 h-3 opacity-80" />
        </a>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <a
        href={coffeeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-900 
                   font-medium hover:underline transition-colors ${className}`}
      >
        <Coffee className="w-3.5 h-3.5 text-amber-500" />
        <span>Buy developer a coffee ({coffeeSuggestedPrice})</span>
      </a>
    );
  }

  // default link
  return (
    <a
      href={coffeeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 text-sm text-gray-700 hover:text-amber-700 transition-colors ${className}`}
    >
      <Coffee className="w-4 h-4 text-amber-500" />
      <span>Buy Me a Coffee ({coffeeSuggestedPrice})</span>
      <ExternalLink className="w-3 h-3 text-gray-400" />
    </a>
  );
}
