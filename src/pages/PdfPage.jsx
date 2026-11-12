import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDeck } from '../context/DeckContext';
import Dropzone from '../components/Dropzone';
import StatsBar from '../components/StatsBar';
import AdSlot from '../components/AdSlot';
import CoffeeSupport from '../components/CoffeeSupport';
import GeoComparisonTable from '../components/GeoComparisonTable';
import FaqSection from '../components/FaqSection';
import { SEO_ROUTES } from '../config/seoConfig';
import { renderCardHtml, clozeBlankText, clozePlainText, stripHtml } from '../services/apkgEngine';
import { FileText, Download, Settings, Eye, EyeOff, Crown, Printer, ChevronDown, ChevronUp } from 'lucide-react';

const FREE_CARD_LIMIT = 50;

function PdfCard({ card, mediaFiles, layout, showImages, clozeMode, index }) {
  const isCompact = layout === 'compact';

  const renderField = (html) => {
    if (!html) return '';
    let processed = html;
    if (clozeMode === 'blank') processed = clozeBlankText(html);
    else if (clozeMode === 'filled') processed = clozePlainText(html);
    else processed = renderCardHtml(html, showImages ? mediaFiles : {}, true);
    return processed;
  };

  const front = card.fields[0]?.value || '';
  const back = card.fields[1]?.value || front;

  if (isCompact) {
    return (
      <div className="border border-gray-200 rounded-lg p-3 break-inside-avoid mb-2">
        <div className="flex gap-2 items-start">
          <span className="text-xs font-mono text-gray-400 w-6 shrink-0 mt-0.5">{index}</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 anki-card-content"
              dangerouslySetInnerHTML={{ __html: clozeMode === 'raw' ? renderField(front) : `<span>${clozeMode === 'blank' ? clozeBlankText(front) : clozePlainText(front)}</span>` }} />
            <div className="text-xs text-gray-500 mt-1 anki-card-content"
              dangerouslySetInnerHTML={{ __html: clozeMode === 'raw' ? renderField(back) : `<span>${clozeMode === 'blank' ? clozeBlankText(back) : clozePlainText(back)}</span>` }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden break-inside-avoid mb-4">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-400">#{index}</span>
          <span className="badge-blue text-xs">{card.deckName.split('::').pop()}</span>
        </div>
        {card.tags.length > 0 && (
          <div className="flex gap-1">
            {card.tags.slice(0, 3).map(t => <span key={t} className="badge-purple">{t}</span>)}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 divide-x divide-gray-200">
        <div className="p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Front</p>
          <div className="text-sm anki-card-content"
            dangerouslySetInnerHTML={{
              __html: clozeMode === 'raw'
                ? renderField(front)
                : `<span>${clozeMode === 'blank' ? clozeBlankText(front) : clozePlainText(front)}</span>`
            }} />
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Back</p>
          <div className="text-sm text-gray-700 anki-card-content"
            dangerouslySetInnerHTML={{
              __html: clozeMode === 'raw'
                ? renderField(back)
                : `<span>${clozeMode === 'blank' ? clozeBlankText(back) : clozePlainText(back)}</span>`
            }} />
        </div>
      </div>
    </div>
  );
}

export default function PdfPage() {
  const { deckData, isProUnlocked, setShowProModal } = useDeck();
  const [layout, setLayout] = useState('detailed');
  const [showImages, setShowImages] = useState(true);
  const [clozeMode, setClozeMode] = useState('raw');
  const [fontSize, setFontSize] = useState(14);
  const [selectedDeck, setSelectedDeck] = useState('');
  const [showSettings, setShowSettings] = useState(true);
  const printRef = useRef(null);

  const cardsToShow = useMemo(() => {
    if (!deckData) return [];
    let cards = deckData.cards;
    if (selectedDeck) cards = cards.filter(c => c.deckName.startsWith(selectedDeck));
    return cards;
  }, [deckData, selectedDeck]);

  const freeCards = cardsToShow.slice(0, FREE_CARD_LIMIT);
  const needsPro = cardsToShow.length > FREE_CARD_LIMIT && !isProUnlocked;
  const displayCards = isProUnlocked ? cardsToShow : freeCards;

  const handlePrint = useCallback(() => {
    if (needsPro) { setShowProModal(true); return; }
    window.print();
  }, [needsPro, setShowProModal]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* No-print header */}
      <div className="no-print">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Convert .APKG to <span className="text-brand-600">Printable PDF</span> Study Guide
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Turn your Anki deck into a formatted two-column study sheet. First 50 cards free — unlock unlimited with Pro Pass.
          </p>
        </div>

        <Dropzone />
      </div>

      {deckData && (
        <>
          <div className="no-print">
            <StatsBar />

            {/* Settings */}
            <div className="bg-white border border-gray-200 rounded-xl mb-6 overflow-hidden">
              <button onClick={() => setShowSettings(!showSettings)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2 font-semibold text-gray-900">
                  <Settings className="w-4 h-4 text-brand-500" /> PDF Settings
                </div>
                {showSettings ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              {showSettings && (
                <div className="px-5 pb-5 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  {/* Layout */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
                    <div className="flex gap-2">
                      {[{ val: 'detailed', label: 'Detailed' }, { val: 'compact', label: 'Compact' }].map(opt => (
                        <button key={opt.val} onClick={() => setLayout(opt.val)}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${layout === opt.val ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cloze Mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cloze Answers</label>
                    <div className="flex flex-col gap-1">
                      {[{ val: 'raw', label: 'Show answers (highlighted)' }, { val: 'filled', label: 'Show as plain text' }, { val: 'blank', label: 'Blank (worksheet mode)' }].map(opt => (
                        <label key={opt.val} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="cloze" value={opt.val} checked={clozeMode === opt.val} onChange={() => setClozeMode(opt.val)} className="accent-brand-600" />
                          <span className="text-sm text-gray-700">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Font Size: {fontSize}px</label>
                      <input type="range" min="10" max="18" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full accent-brand-600" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={showImages} onChange={e => setShowImages(e.target.checked)} className="accent-brand-600" />
                      <span className="text-sm text-gray-700">Include images</span>
                    </label>
                    {deckData.allDecks.length > 1 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter Deck</label>
                        <select value={selectedDeck} onChange={e => setSelectedDeck(e.target.value)} className="input-field text-sm">
                          <option value="">All Decks</option>
                          {deckData.allDecks.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action bar */}
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4 mb-6">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-500" />
                <span className="text-sm font-medium text-gray-700">
                  Showing {displayCards.length} of {cardsToShow.length} cards
                </span>
                {needsPro && (
                  <span className="badge bg-amber-100 text-amber-800">
                    <Crown className="w-3 h-3 mr-1" /> Pro for full deck
                  </span>
                )}
              </div>
              <button onClick={handlePrint} className={needsPro ? 'btn-secondary' : 'btn-primary'}>
                {needsPro ? <Crown className="w-4 h-4" /> : <Printer className="w-4 h-4" />}
                {needsPro ? `Unlock Full Deck — $5 Pro` : 'Print / Save as PDF'}
              </button>
            </div>
          </div>

          {/* Printable content */}
          <div ref={printRef} style={{ fontSize: `${fontSize}px` }}>
            {/* Print-only header */}
            <div className="hidden print:block mb-6 pb-4 border-b-2 border-gray-900">
              <h1 className="text-2xl font-bold">{deckData.allDecks[0] || 'Anki Study Guide'}</h1>
              <p className="text-sm text-gray-600">{displayCards.length} cards • Generated by AnkiDeckStudio</p>
            </div>

            <div className={layout === 'compact' ? 'columns-2 gap-4' : 'grid grid-cols-1 gap-0'}>
              {displayCards.map((card, i) => (
                <PdfCard
                  key={card.id}
                  card={card}
                  mediaFiles={deckData.mediaFiles}
                  layout={layout}
                  showImages={showImages}
                  clozeMode={clozeMode}
                  index={i + 1}
                />
              ))}
            </div>

            {needsPro && (
              <div className="no-print mt-6 bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl p-8 text-center">
                <Crown className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <p className="text-lg font-bold text-amber-900">{cardsToShow.length - FREE_CARD_LIMIT} more cards require Pro Pass</p>
                <p className="text-amber-700 text-sm mt-1 mb-4">Unlock unlimited PDF export for all {cardsToShow.length} cards with a one-time $5 payment.</p>
                <button onClick={() => setShowProModal(true)} className="btn-primary bg-amber-500 hover:bg-amber-600 border-amber-500">
                  <Crown className="w-4 h-4" /> Get Pro Pass — $5 Lifetime
                </button>
              </div>
            )}
          </div>

          <div className="no-print">
            {!needsPro && (
              <CoffeeSupport
                variant="banner"
                title="Found this printable study sheet useful?"
                subtitle="AnkiDeckStudio is 100% free and student-friendly. If this saved you time preparing for exams, consider buying the dev a $3 coffee!"
              />
            )}
            <AdSlot format="leaderboard" className="mt-6" />
          </div>
        </>
      )}

      {/* Below-the-fold Semantic SEO & GEO Technical Documentation */}
      <article className="mt-16 no-print space-y-10 border-t border-gray-200/80 pt-12 text-gray-700 leading-relaxed max-w-4xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">How to convert an Anki .apkg deck to a printable PDF with images?</h2>
          <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
            Converting digital flashcards into tangible study sheets is ideal for pre-exam review, distraction-free handwritten annotation, and sharing with peers. AnkiDeckStudio renders both single-card and two-column worksheet formats, embedding full-resolution diagrams and anatomical illustrations alongside card prompts and answers. Open your browser print menu (Ctrl+P or Cmd+P) and choose <em>Save as PDF</em> to export an ink-friendly, beautifully typeset study document. If your deck file size is too bulky for quick handling, you can first <Link to="/anki-deck-compressor" className="text-brand-600 underline font-medium hover:text-brand-700">compress deck images to WebP</Link> to optimize embedded diagrams.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">What is Worksheet Mode and how does it optimize active recall?</h2>
          <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
            When you select <strong>Blank (worksheet mode)</strong>, AnkiDeckStudio strips out the cloze answers and replaces them with clean underline prompt blanks (e.g. <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>). This instantly converts your digital deck into an offline test or mock quiz, ideal for handwriting medical mnemonics, biochemical pathways, and vocabulary conjugations.
          </p>
        </div>

        {/* Generative Engine Optimization Comparison Table */}
        <GeoComparisonTable type="pdf" />

        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Are embedded images, SVG vectors, and diagrams included in the PDF export?</h2>
          <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
            Yes. AnkiDeckStudio extracts all embedded image media (PNG, JPG, SVG, WebP) directly from the archive into memory blobs, formatting them with balanced maximum heights to prevent awkward page splits across print breaks.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">How do I ensure clean pagination and prevent cards from splitting across pages?</h2>
          <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
            Every card container uses CSS <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">break-inside: avoid</code> and <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">page-break-inside: avoid</code> rules to ensure card fronts, backs, and diagrams remain intact on the same physical page without being bisected by printer margins. Need your cards in spreadsheet or digital flashcard formats instead? You can easily <Link to="/apkg-to-csv-quizlet" className="text-brand-600 underline font-medium hover:text-brand-700">convert your Anki deck to CSV or Quizlet</Link> with clean, unformatted plain text.
          </p>
        </div>

        <AdSlot format="rectangle" className="my-6" />

        {/* FAQ Section matching JSON-LD Schema */}
        <FaqSection
          faqs={SEO_ROUTES['/apkg-to-pdf'].faq}
          title={SEO_ROUTES['/apkg-to-pdf'].faqTitle || "Frequently Asked Questions: Convert Anki .APKG to Printable PDF"}
        />
      </article>
    </div>
  );
}
