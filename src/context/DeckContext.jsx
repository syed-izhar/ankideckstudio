import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { parseApkg } from '../services/apkgEngine';
import { generateSampleDeck } from '../services/sampleDeckGenerator';

const DeckContext = createContext(null);

export function DeckProvider({ children }) {
  const [deckData, setDeckData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');
  const [fileName, setFileName] = useState('');
  const [isProUnlocked, setIsProUnlocked] = useState(() => {
    try {
      return (
        localStorage.getItem('ankideckstudio_pro_unlocked') === 'true' ||
        localStorage.getItem('ankideckstudio_pro') === 'true'
      );
    } catch {
      return false;
    }
  });
  const [showProModal, setShowProModal] = useState(false);
  const fileInputRef = useRef(null);

  const loadFile = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    setProgress('Reading file...');
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const data = await parseApkg(buffer, setProgress);
      setDeckData(data);
      setProgress('');
    } catch (err) {
      console.error('Parse error:', err);
      setError(err.message || 'Failed to parse APKG file');
      setDeckData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSample = useCallback(async () => {
    setLoading(true);
    setError(null);
    setProgress('Generating sample USMLE deck...');
    setFileName('Sample_USMLE_Medical_Language_Deck.apkg');

    try {
      const blob = await generateSampleDeck();
      const buffer = await blob.arrayBuffer();
      const data = await parseApkg(buffer, setProgress);
      data.isSample = true;
      data.dbSource = 'collection.anki21b';
      data.schemaBadge = 'ANKI21B (Zstd)';
      setDeckData(data);
      setProgress('');
    } catch (err) {
      console.error('Sample generation error:', err);
      setError(err.message || 'Failed to generate sample deck');
      setDeckData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearDeck = useCallback(() => {
    if (deckData?.mediaFiles) {
      Object.values(deckData.mediaFiles).forEach(m => {
        try { URL.revokeObjectURL(m.url); } catch (e) { /* ignore */ }
      });
    }
    setDeckData(null);
    setFileName('');
    setError(null);
    setProgress('');
  }, [deckData]);

  const unlockPro = useCallback((key) => {
    setIsProUnlocked(true);
    try {
      localStorage.setItem('ankideckstudio_pro_unlocked', 'true');
      localStorage.setItem('ankideckstudio_pro', 'true');
    } catch {}
    setShowProModal(false);
  }, []);

  const value = {
    deckData,
    loading,
    error,
    progress,
    fileName,
    isProUnlocked,
    showProModal,
    fileInputRef,
    loadFile,
    loadSample,
    clearDeck,
    unlockPro,
    setShowProModal,
    setError
  };

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>;
}

export function useDeck() {
  const ctx = useContext(DeckContext);
  if (!ctx) throw new Error('useDeck must be used within DeckProvider');
  return ctx;
}
