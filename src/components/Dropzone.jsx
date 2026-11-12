import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileArchive, Loader2, AlertCircle, Beaker } from 'lucide-react';
import { useDeck } from '../context/DeckContext';

export default function Dropzone() {
  const { loadFile, loadSample, loading, error, progress, deckData, clearDeck } = useDeck();
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && (file.name.endsWith('.apkg') || file.name.endsWith('.colpkg'))) {
      loadFile(file);
    }
  }, [loadFile]);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    e.target.value = '';
  }, [loadFile]);

  if (deckData) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={`dropzone ${isDragOver ? 'dropzone-active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !loading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".apkg,.colpkg"
          onChange={handleFileInput}
          className="hidden"
        />

        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
            <div>
              <p className="text-lg font-semibold text-gray-700">Processing your deck...</p>
              <p className="text-sm text-gray-500 mt-1">{progress}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center">
              <Upload className="w-8 h-8 text-brand-500" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700">
                Drop your <code className="bg-gray-100 px-1.5 py-0.5 rounded text-brand-600">.apkg</code> or <code className="bg-gray-100 px-1.5 py-0.5 rounded text-brand-600">.colpkg</code> file here
              </p>
              <p className="text-sm text-gray-500 mt-1">or click to browse • Supports all Anki versions (Schema 11 & 18, Zstd compressed)</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <FileArchive className="w-3.5 h-3.5" />
              <span>100% client-side • Your files never leave your browser</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Failed to open deck</p>
            <p className="text-sm text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={(e) => { e.stopPropagation(); loadSample(); }}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Beaker className="w-5 h-5" />
          No file handy? Load Sample USMLE Medical & Language Deck (30 Cards + Diagrams)
        </button>
        <p className="text-xs text-gray-400 mt-2">Generates a real .apkg with USMLE Cardiology, Pharmacology, Neurology cloze cards + Japanese/Spanish vocab</p>
      </div>
    </div>
  );
}
