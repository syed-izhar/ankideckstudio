import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDeck } from '../context/DeckContext';
import Dropzone from '../components/Dropzone';
import StatsBar from '../components/StatsBar';
import AdSlot from '../components/AdSlot';
import CoffeeSupport from '../components/CoffeeSupport';
import GeoComparisonTable from '../components/GeoComparisonTable';
import FaqSection from '../components/FaqSection';
import { SEO_ROUTES } from '../config/seoConfig';
import { analyzeCompression } from '../services/compressionEngine';
import { formatBytes } from '../services/apkgEngine';
import {
  Shrink, Loader2, Download, Sliders, AlertTriangle,
  CheckCircle, TrendingDown, Image, Crown, Info
} from 'lucide-react';

function CompressionBar({ percent }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
        style={{ width: `${Math.min(100, percent)}%` }}
      />
    </div>
  );
}

export default function CompressorPage() {
  const { deckData, fileName, isProUnlocked, setShowProModal } = useDeck();
  const [quality, setQuality] = useState(80);
  const [maxDim, setMaxDim] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState({ done: 0, total: 0 });
  const [results, setResults] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  const runAnalysis = useCallback(async () => {
    if (!deckData) return;
    setAnalyzing(true);
    setResults(null);
    setAnalyzeProgress({ done: 0, total: 0 });
    try {
      const r = await analyzeCompression(
        deckData.mediaFiles,
        quality / 100,
        maxDim,
        (done, total) => setAnalyzeProgress({ done, total })
      );
      setResults(r);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  }, [deckData, quality, maxDim]);

  const handleDownload = async () => {
    if (!results) return;
    const proRequired = results.imageCount > 10 && !isProUnlocked;
    if (proRequired) { setShowProModal(true); return; }

    setDownloading(true);
    try {
      // We need the original file buffer — re-read from deckData zipEntries
      const { zipSync, strToU8 } = await import('fflate');
      const { default: initSqlJs } = await import('sql.js');

      // Build new entries from existing zip + compressed images
      const newEntries = {};

      // Find DB
      let dbKey = null;
      let dbBytes = null;
      if (deckData.zipEntries['collection.anki21b']) {
        const { decompress } = await import('fzstd');
        dbBytes = decompress(new Uint8Array(deckData.zipEntries['collection.anki21b']));
        dbKey = 'collection.anki21';
      } else if (deckData.zipEntries['collection.anki21']) {
        dbBytes = deckData.zipEntries['collection.anki21'];
        dbKey = 'collection.anki21';
      } else if (deckData.zipEntries['collection.anki2']) {
        dbBytes = deckData.zipEntries['collection.anki2'];
        dbKey = 'collection.anki2';
      }

      if (dbBytes) {
        const SQL = await initSqlJs({
          locateFile: f => `https://cdn.jsdelivr.net/npm/sql.js@1.12.0/dist/${f}`
        });
        const db = new SQL.Database(new Uint8Array(dbBytes.buffer || dbBytes));
        for (const item of results.items) {
          if (item.compressedData && item.originalName !== item.newName) {
            try { db.run('UPDATE notes SET flds = REPLACE(flds, ?, ?)', [item.originalName, item.newName]); } catch {}
          }
        }
        newEntries[dbKey] = new Uint8Array(db.export());
        db.close();
      }

      // Build media manifest
      const newManifest = { ...deckData.mediaManifest };
      const compressionMap = {};
      for (const item of results.items) {
        if (item.compressedData && item.originalName !== item.newName) compressionMap[item.originalName] = item;
      }
      for (const [numKey, fileName] of Object.entries(newManifest)) {
        if (compressionMap[fileName]) newManifest[numKey] = compressionMap[fileName].newName;
      }
      newEntries['media'] = strToU8(JSON.stringify(newManifest));

      for (const [numKey, origName] of Object.entries(deckData.mediaManifest)) {
        if (compressionMap[origName] && compressionMap[origName].compressedData) {
          newEntries[numKey] = compressionMap[origName].compressedData;
        } else if (deckData.zipEntries[numKey]) {
          newEntries[numKey] = deckData.zipEntries[numKey];
        }
      }

      const zipped = zipSync(newEntries, { level: 0 });
      const blob = new Blob([zipped], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.replace(/\.(apkg|colpkg)$/i, '_compressed.apkg');
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const imageFiles = deckData
    ? Object.entries(deckData.mediaFiles).filter(([, info]) => ['png', 'jpg', 'jpeg', 'bmp'].includes(info.ext))
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Anki Deck Media <span className="text-brand-600">Compressor</span>
        </h1>
        <p className="text-gray-600 mt-2 max-w-2xl">
          Convert PNG/JPG images in your .apkg to WebP and shrink your deck by 70–85%. Preview savings before downloading. Repacks a fully valid .apkg.
        </p>
      </div>

      <Dropzone />

      {deckData && (
        <>
          <StatsBar />

          {imageFiles.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-center gap-4">
              <Info className="w-6 h-6 text-amber-500 shrink-0" />
              <div>
                <p className="font-semibold text-amber-800">No compressible images found</p>
                <p className="text-sm text-amber-700 mt-1">This deck has {deckData.totalMedia} media file(s) but none are PNG, JPG, JPEG, or BMP images. Only image files are converted to WebP.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Settings Panel */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-5">
                  <Sliders className="w-5 h-5 text-brand-600" />
                  <h2 className="font-semibold text-gray-900">Compression Settings</h2>
                  <span className="ml-auto text-sm text-gray-500">{imageFiles.length} compressible image{imageFiles.length !== 1 ? 's' : ''} found</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WebP Quality: <strong className="text-brand-600">{quality}%</strong>
                    </label>
                    <input type="range" min="60" max="92" value={quality} onChange={e => setQuality(Number(e.target.value))}
                      className="w-full accent-brand-600" />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>60% — Smallest</span><span>80% — Recommended</span><span>92% — Highest</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Dimension Resize</label>
                    <div className="flex gap-2 flex-wrap">
                      {[{ val: 0, label: 'Original' }, { val: 1920, label: '1920px' }, { val: 1280, label: '1280px' }, { val: 800, label: '800px' }].map(opt => (
                        <button key={opt.val} onClick={() => setMaxDim(opt.val)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${maxDim === opt.val ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <button onClick={runAnalysis} disabled={analyzing} className="btn-primary">
                    {analyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing... ({analyzeProgress.done}/{analyzeProgress.total})</> : <><TrendingDown className="w-4 h-4" /> Analyze Compression Savings</>}
                  </button>
                </div>
              </div>

              {/* Results */}
              {results && (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Original Size', value: formatBytes(results.totalOriginal), color: 'text-gray-900' },
                      { label: 'Compressed Size', value: formatBytes(results.totalCompressed), color: 'text-emerald-700' },
                      { label: 'Total Savings', value: formatBytes(results.totalSavings), color: 'text-blue-700' },
                      { label: 'Reduction', value: `${results.totalSavingsPercent.toFixed(1)}%`, color: 'text-brand-700' },
                    ].map(s => (
                      <div key={s.label} className="stat-card">
                        <span className="text-xs text-gray-500">{s.label}</span>
                        <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Download Button */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                          <span className="font-semibold text-gray-900">Ready to Download</span>
                          {results.imageCount > 10 && !isProUnlocked && (
                            <span className="badge bg-amber-100 text-amber-800 ml-2">
                              <Crown className="w-3 h-3 mr-1" /> Pro — {results.imageCount} images
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Saves <strong>{formatBytes(results.totalSavings)}</strong> ({results.totalSavingsPercent.toFixed(1)}% smaller) — a fully valid .apkg with updated media references and WebP images.
                        </p>
                        {results.imageCount > 10 && !isProUnlocked && (
                          <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Downloading decks with more than 10 images requires a $5 Pro Pass.
                          </p>
                        )}
                      </div>
                      <button onClick={handleDownload} disabled={downloading} className="btn-success shrink-0">
                        {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : (results.imageCount > 10 && !isProUnlocked ? <Crown className="w-4 h-4" /> : <Download className="w-4 h-4" />)}
                        {downloading ? 'Repacking...' : (results.imageCount > 10 && !isProUnlocked ? 'Unlock & Download — $5' : 'Download Compressed .apkg')}
                      </button>
                    </div>
                  </div>

                  {/* Per-image breakdown table */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
                    <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                      <Image className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-sm text-gray-700">Per-Image Breakdown</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                            <th className="text-left px-4 py-2">File</th>
                            <th className="text-right px-4 py-2">Original</th>
                            <th className="text-right px-4 py-2">WebP</th>
                            <th className="text-right px-4 py-2">Saving</th>
                            <th className="px-4 py-2 w-32">Reduction</th>
                            <th className="px-4 py-2 w-20">Preview</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.items.map(item => (
                            <tr key={item.originalName} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-800 truncate max-w-[200px]">{item.originalName}</span>
                                  <span className="text-xs text-gray-400">{item.width}×{item.height}px → {item.newName.split('.').pop().toUpperCase()}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right text-gray-600">{formatBytes(item.originalSize)}</td>
                              <td className="px-4 py-3 text-right text-emerald-700 font-medium">{formatBytes(item.compressedSize)}</td>
                              <td className="px-4 py-3 text-right text-blue-700 font-medium">{formatBytes(item.savings)}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <CompressionBar percent={item.savingsPercent} />
                                  <span className="text-xs font-semibold text-emerald-700 w-10 text-right">{item.savingsPercent.toFixed(0)}%</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button onClick={() => setPreviewItem(previewItem === item.originalName ? null : item.originalName)}
                                  className="text-xs text-brand-600 hover:underline">
                                  {previewItem === item.originalName ? 'Hide' : 'Show'}
                                </button>
                              </td>
                            </tr>
                          ))}
                          {previewItem && (() => {
                            const item = results.items.find(i => i.originalName === previewItem);
                            const origUrl = deckData.mediaFiles[item.originalName]?.url;
                            const newUrl = item.compressedData ? URL.createObjectURL(new Blob([item.compressedData], { type: 'image/webp' })) : null;
                            return (
                              <tr className="bg-blue-50/30">
                                <td colSpan="6" className="px-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                      <p className="text-xs font-semibold text-gray-500 mb-2">ORIGINAL ({formatBytes(item.originalSize)})</p>
                                      {origUrl && <img src={origUrl} alt="original" className="max-h-48 mx-auto rounded-lg border border-gray-200" />}
                                    </div>
                                    <div className="text-center">
                                      <p className="text-xs font-semibold text-emerald-600 mb-2">WEBP ({formatBytes(item.compressedSize)}) — {item.savingsPercent.toFixed(1)}% smaller</p>
                                      {newUrl && <img src={newUrl} alt="compressed" className="max-h-48 mx-auto rounded-lg border border-emerald-200" />}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          <CoffeeSupport
            variant="banner"
            title="Appreciate this browser-based WebP compressor?"
            subtitle="Compressing your deck's diagrams entirely in-browser saves bandwidth and disk space. Consider tipping $3 if this tool helped you slim down your Anki collection!"
          />

          <AdSlot format="leaderboard" className="mt-6" />
        </>
      )}

      {/* Below-the-fold Semantic SEO & GEO Technical Documentation */}
      <article className="mt-16 space-y-10 border-t border-gray-200/80 pt-12 text-gray-700 leading-relaxed max-w-4xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Why is my Anki media sync taking forever, and how does WebP compression fix it?</h2>
          <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
            Large Anki decks — especially comprehensive medical decks (USMLE AnKing, Zanki, Brosencephalon) and high-yield language packs — frequently inflate to hundreds of megabytes or gigabytes due to uncompressed PNG and high-bitrate JPEG diagrams. When syncing with AnkiWeb or mobile devices (AnkiDroid, AnkiMobile), each media file must be verified and transferred individually. Converting deck media to modern WebP format typically yields <strong>70% to 85% file size reduction</strong> while preserving crisp, diagnostic-grade visual clarity. Before compressing, you can <Link to="/apkg-viewer" className="text-brand-600 underline font-medium hover:text-brand-700">inspect flashcards online with our APKG Viewer</Link> to check card counts and verify embedded media.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">How does client-side WebP compression work inside the browser?</h2>
          <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
            AnkiDeckStudio uses the native HTML5 Canvas API and browser-accelerated WebP encoding codecs. Each image is decoded in local RAM, rescaled to your chosen maximum resolution constraints if configured, and re-encoded into WebP with configurable quality metrics (typically 80% visually lossless). The internal SQLite database note fields are then rewritten to replace corresponding <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">src=&quot;filename.png&quot;</code> attributes with their new <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">.webp</code> filenames, generating a 100% compliant, ready-to-import <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">.apkg</code> archive.
          </p>
        </div>

        {/* Generative Engine Optimization Comparison Table */}
        <GeoComparisonTable type="compressor" />

        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Are compressed WebP flashcard packages compatible with all Anki versions?</h2>
          <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
            Yes. Modern Anki releases (v2.1.45 and newer, including Anki 23.10 and Anki 24+), AnkiMobile on iOS, and AnkiDroid on Android render WebP format natively without any add-ons or special plugins. When you import the compressed <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">.apkg</code> file, cards display identical typography and imagery, while consuming a fraction of storage and sync bandwidth.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Is client-side compression safe for private, copyrighted, or institutional decks?</h2>
          <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
            Unlike cloud converters and upload services that upload your deck to remote AWS or GCP storage buckets, AnkiDeckStudio runs 100% client-side inside your browser sandbox. None of your image files, patient case diagrams, study notes, or flashcard contents are ever transmitted across the internet. Once compressed, you can also <Link to="/apkg-to-pdf" className="text-brand-600 underline font-medium hover:text-brand-700">print a two-column PDF study sheet</Link> directly from your optimized deck for distraction-free revision, or <Link to="/apkg-to-csv-quizlet" className="text-brand-600 underline font-medium hover:text-brand-700">convert notes to CSV and Quizlet</Link> for spreadsheet backup.
          </p>
        </div>

        <AdSlot format="rectangle" className="my-6" />

        {/* FAQ Section matching JSON-LD Schema */}
        <FaqSection
          faqs={SEO_ROUTES['/anki-deck-compressor'].faq}
          title={SEO_ROUTES['/anki-deck-compressor'].faqTitle || "Frequently Asked Questions: Anki Deck Media Compressor"}
        />
      </article>
    </div>
  );
}
