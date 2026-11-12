import React, { useState } from 'react';
import { X, Shield, FileText, Lock, Database, Cookie, CreditCard, CheckCircle } from 'lucide-react';

export default function LegalModal({ isOpen, onClose, initialTab = 'privacy' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-gray-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-600" />
            <h2 className="font-bold text-gray-900 text-base">AnkiDeckStudio Legal Documentation</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-gray-100 px-6 bg-white">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'privacy'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Lock className="w-4 h-4" />
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`py-3 px-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'terms'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            Terms of Use
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-700 leading-relaxed">
          {activeTab === 'privacy' ? (
            <>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Privacy Policy</h3>
                <p className="text-xs text-gray-400 mb-4">Last Updated: November 12, 2026</p>
                <p>
                  At <strong>AnkiDeckStudio</strong> (accessible via <code>https://ankideckstudio.pages.dev</code>), user privacy is our foundational architectural commitment. We have engineered our application so that your files, study decks, images, and flashcards remain strictly on your personal device.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <Database className="w-4 h-4 text-brand-600 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">1. 100% Client-Side Local Processing (Zero Server Uploads)</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      All .apkg and .colpkg archives are read, decompressed (via pure JavaScript Zstandard <code>fzstd</code>), and queried (via WebAssembly SQLite <code>sql.js</code>) entirely inside your web browser local RAM memory. No flashcard notes, cards, tags, medical anatomy images, audio clips, or deck structures are ever uploaded, transmitted, or logged to our servers or any cloud database.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">2. LocalStorage & Client State</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      We store a single local token (<code>ankideckstudio_pro</code>) inside your browser's standard <code>localStorage</code> to remember your Pro Pass activation status on your device. We do not store personally identifiable profiles, passwords, or browsing sessions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Cookie className="w-4 h-4 text-amber-600 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">3. Cookies, Analytics & Advertising Disclosures</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      We may use privacy-preserving, anonymous telemetry and third-party advertising partners (such as Google AdSense) to keep AnkiDeckStudio free for learners worldwide. Third-party vendors, including Google, may use cookies (such as the DoubleClick cookie) to serve relevant advertisements based on visits to this and other websites. You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-brand-600 underline">Google Ads Settings</a> or <a href="https://aboutads.info" target="_blank" rel="noopener noreferrer" className="text-brand-600 underline">aboutads.info</a>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CreditCard className="w-4 h-4 text-purple-600 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">4. Payments & Gumroad Merchant Processing</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Optional Pro Pass upgrades ($5 lifetime) and Buy Me a Coffee contributions ($3 tip jar) are processed securely through Gumroad Inc. Gumroad handles all payment details, credit card numbers, and billing tokens in full PCI-DSS Level 1 compliance. AnkiDeckStudio never sees, stores, or handles your payment credentials.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-semibold text-gray-900 text-xs mb-1">Contact & Inquiries</h4>
                <p className="text-xs text-gray-600">
                  If you have questions regarding this Privacy Policy or local data execution, please reach out via our GitHub repository or contact channels.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Terms of Use</h3>
                <p className="text-xs text-gray-400 mb-4">Last Updated: November 12, 2026</p>
                <p>
                  By accessing or using <strong>AnkiDeckStudio</strong> (<code>https://ankideckstudio.pages.dev</code>), you agree to be bound by these Terms of Use.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900">1. Educational & Fair Use Permitted</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    AnkiDeckStudio is provided as an open-access browser utility for medical students, language learners, educators, and spaced repetition researchers to inspect, compress, export, and format Anki flashcards. You agree to use the service only for lawful purposes.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900">2. Intellectual Property & Trademark Disclaimer</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    AnkiDeckStudio is an independent project and is <strong>not affiliated with, maintained by, or endorsed by Ankitects Pty Ltd (Anki / AnkiWeb)</strong>. The trademark &quot;Anki&quot; belongs to its respective owner. All deck contents, flashcards, images, medical diagrams, and personal study materials processed in your browser remain your exclusive intellectual property.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900">3. Disclaimer of Warranty & Limitation of Liability</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    The software is provided &quot;as is&quot;, without warranty of any kind, express or implied. While AnkiDeckStudio is designed with robust WebAssembly parsers, you are solely responsible for keeping backup copies of your original .apkg collections before modifying or repacking them.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900">4. Pro Pass License</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    The $5 Pro Pass grants a lifetime, non-exclusive license to unlock unlimited PDF study guide exports and unlimited media archive WebP repackaging on your personal devices. Pro Pass purchases are delivered via Gumroad license validation.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>AdSense & GDPR Compliant</span>
          </div>
          <button
            onClick={onClose}
            className="btn-primary text-xs py-1.5 px-4"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
