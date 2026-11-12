import React, { useState } from 'react';
import { X, Crown, Check, Shield, Zap, ExternalLink } from 'lucide-react';
import { useDeck } from '../context/DeckContext';
import { MONETIZATION_CONFIG } from '../config/siteConfig';

const features = [
  'Download compressed .APKG files (any size)',
  'Export unlimited cards to PDF study guides',
  'No ads across the entire app',
  'Lifetime access — pay once, use forever',
  'Support independent development',
];

export default function ProModal() {
  const { setShowProModal, unlockPro } = useDeck();
  const [licenseKey, setLicenseKey] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [keyError, setKeyError] = useState('');

  const handleVerify = () => {
    setVerifying(true);
    setKeyError('');
    // Simple client-side key validation
    // In production, verify against Gumroad API
    setTimeout(() => {
      if (licenseKey.trim().length >= 8) {
        unlockPro(licenseKey.trim());
      } else {
        setKeyError('Please enter a valid license key from your Gumroad purchase.');
      }
      setVerifying(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white relative">
          <button
            onClick={() => setShowProModal(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Pro Pass</h2>
          </div>
          <p className="text-white/90 text-sm">Unlock all premium features with a one-time payment</p>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold">$5</span>
            <span className="text-white/80 text-sm">USD / lifetime</span>
          </div>
        </div>

        {/* Features */}
        <div className="p-6">
          <ul className="space-y-3 mb-6">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{f}</span>
              </li>
            ))}
          </ul>

          {/* Buy Button */}
          <a
            href={MONETIZATION_CONFIG.proPassUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-200 transition-all duration-200 mb-4"
          >
            <Zap className="w-5 h-5" />
            Purchase Pro Pass on Gumroad
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* License Key Input */}
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500 mb-2">Already purchased? Enter your license key:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="input-field flex-1 font-mono text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              />
              <button
                onClick={handleVerify}
                disabled={verifying || !licenseKey.trim()}
                className="btn-primary text-sm px-4"
              >
                {verifying ? '...' : 'Verify'}
              </button>
            </div>
            {keyError && <p className="text-xs text-red-500 mt-1">{keyError}</p>}
          </div>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Secure checkout</span>
            </div>
            <span>•</span>
            <span>Instant delivery</span>
            <span>•</span>
            <span>No subscription</span>
          </div>
        </div>
      </div>
    </div>
  );
}
