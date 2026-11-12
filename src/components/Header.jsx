import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileArchive, Shrink, FileText, Table2, Menu, X, Sparkles } from 'lucide-react';
import { useDeck } from '../context/DeckContext';
import CoffeeSupport from './CoffeeSupport';

const navItems = [
  { path: '/', label: 'Viewer', icon: FileArchive, alt: '/apkg-viewer' },
  { path: '/anki-deck-compressor', label: 'Compressor', icon: Shrink },
  { path: '/apkg-to-pdf', label: 'PDF Export', icon: FileText },
  { path: '/apkg-to-csv-quizlet', label: 'CSV / Quizlet', icon: Table2 },
];

export default function Header() {
  const location = useLocation();
  const { deckData, fileName } = useDeck();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item) => {
    if (item.path === '/' && (location.pathname === '/' || location.pathname === '/apkg-viewer')) return true;
    return location.pathname === item.path;
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
              <FileArchive className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-gray-900 text-lg tracking-tight">AnkiDeck</span>
              <span className="font-extrabold text-brand-600 text-lg tracking-tight">Studio</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <CoffeeSupport variant="button" className="hidden sm:inline-flex" />

            {deckData && (
              <div className="hidden lg:flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                <span className="max-w-[180px] truncate font-medium">{fileName}</span>
                <span className="text-gray-400">•</span>
                <span>{deckData.totalCards.toLocaleString()} cards</span>
              </div>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden py-3 border-t border-gray-100">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    active
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-2 px-1">
              <CoffeeSupport variant="button" className="w-full justify-center py-2" />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
