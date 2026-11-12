import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileArchive, Shield, Zap, Lock, FileText } from 'lucide-react';
import CoffeeSupport from './CoffeeSupport';
import LegalModal from './LegalModal';

export default function Footer() {
  const [legalTab, setLegalTab] = useState(null);

  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <FileArchive className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">AnkiDeckStudio</span>
            </div>
            <p className="text-sm leading-relaxed">
              Free, open-access Anki .APKG toolkit. View, compress, and convert your flashcard decks entirely in your browser.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5 text-xs">
                <Shield className="w-3.5 h-3.5 text-green-400" />
                <span>100% Private</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span>Client-Side</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800">
              <p className="text-xs text-gray-400 mb-2 font-medium">Support Independent Development:</p>
              <CoffeeSupport variant="button" />
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Tools</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/apkg-viewer" className="hover:text-white transition-colors">APKG Viewer</Link></li>
              <li><Link to="/anki-deck-compressor" className="hover:text-white transition-colors">Deck Compressor</Link></li>
              <li><Link to="/apkg-to-pdf" className="hover:text-white transition-colors">PDF Converter</Link></li>
              <li><Link to="/apkg-to-csv-quizlet" className="hover:text-white transition-colors">CSV & Quizlet Export</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="https://apps.ankiweb.net/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Anki Official Site</a></li>
              <li><a href="https://docs.ankiweb.net/getting-started.html" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Anki Documentation</a></li>
              <li><a href="https://ankiweb.net/shared/decks" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Shared Decks</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Privacy & Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => setLegalTab('privacy')}
                  className="flex items-center gap-1.5 text-gray-300 hover:text-white underline transition-colors text-xs"
                >
                  <Lock className="w-3.5 h-3.5 text-brand-400" />
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setLegalTab('terms')}
                  className="flex items-center gap-1.5 text-gray-300 hover:text-white underline transition-colors text-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-brand-400" />
                  Terms of Use
                </button>
              </li>
              <li className="text-xs text-gray-400 leading-relaxed pt-2 border-t border-gray-800">
                100% in-browser WebAssembly processing. No study cards, notes, or media are ever uploaded to any server. Gumroad PCI-DSS Level 1 compliant payments.
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs">© {new Date().getFullYear()} AnkiDeckStudio. Not affiliated with Anki or AnkiWeb.</p>
          <p className="text-xs">Built with React, sql.js (WebAssembly), fflate & fzstd. 100% client-side.</p>
        </div>
      </div>

      {legalTab && (
        <LegalModal
          isOpen={!!legalTab}
          initialTab={legalTab}
          onClose={() => setLegalTab(null)}
        />
      )}
    </footer>
  );
}
