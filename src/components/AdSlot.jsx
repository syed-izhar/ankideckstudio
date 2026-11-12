import React, { useEffect, useRef } from 'react';
import { useDeck } from '../context/DeckContext';
import { ADSENSE_CONFIG } from '../config/siteConfig';

export default function AdSlot({ format = 'leaderboard', className = '' }) {
  const { isProUnlocked } = useDeck();
  const adRef = useRef(null);

  // If user is Pro or AdSense is not enabled with a real publisher ID, render NOTHING
  const isEnabled = ADSENSE_CONFIG?.enabled &&
                    ADSENSE_CONFIG?.client &&
                    !ADSENSE_CONFIG.client.includes('XXXX') &&
                    !isProUnlocked;

  useEffect(() => {
    if (isEnabled && adRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [isEnabled]);

  if (!isEnabled) {
    return null;
  }

  const sizes = {
    leaderboard: { width: 728, height: 90, slot: ADSENSE_CONFIG.slots?.leaderboard },
    rectangle: { width: 300, height: 250, slot: ADSENSE_CONFIG.slots?.rectangle },
  };

  const config = sizes[format] || sizes.leaderboard;

  return (
    <div className={`flex justify-center my-6 overflow-hidden ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'inline-block', width: config.width, height: config.height }}
        data-ad-client={ADSENSE_CONFIG.client}
        data-ad-slot={config.slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
