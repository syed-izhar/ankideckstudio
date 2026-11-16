import React from 'react';
import { useDeck } from '../context/DeckContext';
import { formatBytes } from '../services/apkgEngine';
import { Layers, StickyNote, Image, HardDrive, Database, X, Download } from 'lucide-react';

export default function StatsBar() {
  const { deckData, fileName, clearDeck } = useDeck();
  if (!deckData) return null;

  const schemaDisplay = deckData.schemaBadge || (
    deckData.isSample ? 'ANKI21B (Zstd)' :
    deckData.dbSource?.includes('anki21b') ? 'ANKI21B (Zstd)' :
    deckData.dbSource?.includes('anki21') ? 'ANKI21 (Schema 18)' :
    deckData.dbSource?.includes('anki2') ? 'Modern Anki Schema' :
    deckData.dbSource?.replace('collection.', '').toUpperCase() || 'ANKI21B (Zstd)'
  );

  const stats = [
    { icon: Layers, label: 'Cards', value: deckData.totalCards.toLocaleString(), color: 'text-blue-600 bg-blue-50' },
    { icon: StickyNote, label: 'Notes', value: deckData.totalNotes.toLocaleString(), color: 'text-purple-600 bg-purple-50' },
    { icon: Image, label: 'Media', value: deckData.totalMedia.toLocaleString(), color: 'text-emerald-600 bg-emerald-50' },
    { icon: HardDrive, label: 'Media Size', value: formatBytes(deckData.totalMediaSize), color: 'text-amber-600 bg-amber-50' },
    { icon: Database, label: 'Schema', value: schemaDisplay, color: 'text-gray-600 bg-gray-100' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <h3 className="font-semibold text-gray-900 text-sm">
            {fileName}
          </h3>
        </div>
        <button
          onClick={clearDeck}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50"
        >
          <X className="w-3.5 h-3.5" />
          Close Deck
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs text-gray-500">{label}</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
