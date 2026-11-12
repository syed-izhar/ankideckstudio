import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDeck } from '../context/DeckContext';
import Dropzone from '../components/Dropzone';
import StatsBar from '../components/StatsBar';
import AdSlot from '../components/AdSlot';
import CoffeeSupport from '../components/CoffeeSupport';
import GeoComparisonTable from '../components/GeoComparisonTable';
import FaqSection from '../components/FaqSection';
import { SEO_ROUTES } from '../config/seoConfig';
import { renderCardHtml, stripHtml } from '../services/apkgEngine';
import {
  Search, Filter, ChevronLeft, ChevronRight, Eye, EyeOff,
  Tag, FolderTree, RotateCcw, ChevronDown, ChevronUp, X, BookOpen
} from 'lucide-react';

const CARDS_PER_PAGE = 100;

function FlashcardModal({ card, mediaFiles, showCloze, onClose }) {
  const [flipped, setFlipped] = useState(false);
  if (!card) return null;
  const front = card.fields[0]?.value || '';
  const back = card.fields.slice(1).map(f => f.value).join('<hr/>') || '';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-500" />
            <span className="font-semibold text-sm text-gray-700">Flashcard Study Mode</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-8 min-h-[250px] flex items-center justify-center cursor-pointer select-none" onClick={() => setFlipped(!flipped)}>
          <div className="text-center anki-card-content w-full" dangerouslySetInnerHTML={{ __html: renderCardHtml(flipped ? back : front, mediaFiles, showCloze) }} />
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <span className="text-xs text-gray-500 truncate max-w-[200px]">{card.deckName}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{flipped ? 'Back' : 'Front'} — Click to flip</span>
            <button onClick={() => setFlipped(!flipped)} className="btn-secondary text-xs py-1.5 px-3">
              <RotateCcw className="w-3.5 h-3.5" /> Flip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ViewerPage() {
  const { deckData } = useDeck();
  const [search, setSearch] = useState('');
  const [selectedDeck, setSelectedDeck] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showCloze, setShowCloze] = useState(true);
  const [page, setPage] = useState(1);
  const [expandedCard, setExpandedCard] = useState(null);
  const [studyCard, setStudyCard] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { setPage(1); }, [search, selectedDeck, selectedTag]);

  const filteredCards = useMemo(() => {
    if (!deckData) return [];
    return deckData.cards.filter(card => {
      if (selectedDeck && !card.deckName.startsWith(selectedDeck)) return false;
      if (selectedTag && !card.tags.includes(selectedTag)) return false;
      if (search) {
        const q = search.toLowerCase();
        const fieldText = card.fields.map(f => stripHtml(f.value)).join(' ').toLowerCase();
        if (!fieldText.includes(q) && !card.deckName.toLowerCase().includes(q) && !card.tags.some(t => t.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [deckData, search, selectedDeck, selectedTag]);

  const totalPages = Math.ceil(filteredCards.length / CARDS_PER_PAGE);
  const pageCards = filteredCards.slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE);

  const deckTree = useMemo(() => {
    if (!deckData) return [];
    const counts = {};
    for (const card of deckData.cards) counts[card.deckName] = (counts[card.deckName] || 0) + 1;
    return deckData.allDecks.map(name => ({ name, count: counts[name] || 0 }));
  }, [deckData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Anki .APKG Viewer &amp; Inspector <span className="text-brand-600">Online</span>
        </h1>
        <p className="text-gray-600 mt-2 max-w-2xl">
          Open any <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">.apkg</code> or <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">.colpkg</code> file in your browser — zero uploads, full Zstd support.
        </p>
      </div>

      <Dropzone />

      {deckData && (
        <>
          <StatsBar />

          {/* Controls */}
          <div className="bg-white border border-gray-200 rounded-xl p-3 mb-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search cards, decks, tags..." className="input-field pl-9" />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setShowFilters(!showFilters)} className={`btn-secondary text-xs py-2 ${showFilters ? 'bg-brand-50 border-brand-300 text-brand-700' : ''}`}>
                <Filter className="w-3.5 h-3.5" /> Filters
                {(selectedDeck || selectedTag) && <span className="ml-1 w-5 h-5 bg-brand-600 text-white rounded-full text-[10px] flex items-center justify-center">{(selectedDeck ? 1 : 0) + (selectedTag ? 1 : 0)}</span>}
              </button>
              <button onClick={() => setShowCloze(!showCloze)} className="btn-secondary text-xs py-2">
                {showCloze ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {showCloze ? 'Cloze Visible' : 'Cloze Hidden'}
              </button>
              <span className="text-xs text-gray-500">{filteredCards.length.toLocaleString()} / {deckData.totalCards.toLocaleString()} cards</span>
            </div>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <FolderTree className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Decks</span>
                  {selectedDeck && <button onClick={() => setSelectedDeck('')} className="text-xs text-brand-600 hover:underline ml-auto">Clear</button>}
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {deckTree.map(({ name, count }) => (
                    <button key={name} onClick={() => setSelectedDeck(selectedDeck === name ? '' : name)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-sm flex items-center justify-between transition-colors ${selectedDeck === name ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                      <span className="truncate">{name.split('::').map((part, i) => <span key={i}>{i > 0 && <span className="text-gray-400 mx-1">›</span>}{part}</span>)}</span>
                      <span className="text-xs text-gray-400 ml-2 shrink-0">{count}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Tags</span>
                  {selectedTag && <button onClick={() => setSelectedTag('')} className="text-xs text-brand-600 hover:underline ml-auto">Clear</button>}
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                  {deckData.allTags.map(tag => (
                    <button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                      className={`badge cursor-pointer transition-colors ${selectedTag === tag ? 'bg-brand-100 text-brand-800 ring-1 ring-brand-400' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Card Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 w-12">#</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Front / Field 1</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Back / Field 2</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 w-40 hidden md:table-cell">Deck</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 w-32 hidden xl:table-cell">Tags</th>
                    <th className="px-4 py-3 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {pageCards.map((card, idx) => {
                    const isExpanded = expandedCard === card.id;
                    const frontHtml = renderCardHtml(card.fields[0]?.value || '', deckData.mediaFiles, showCloze);
                    const backHtml = renderCardHtml(card.fields[1]?.value || '', deckData.mediaFiles, showCloze);
                    return (
                      <React.Fragment key={card.id}>
                        <tr className={`border-b border-gray-100 hover:bg-gray-50/50 ${isExpanded ? 'bg-blue-50/30' : ''}`}>
                          <td className="px-4 py-3 text-gray-400 font-mono text-xs">{(page - 1) * CARDS_PER_PAGE + idx + 1}</td>
                          <td className="px-4 py-3"><div className="anki-card-content line-clamp-3 text-sm" dangerouslySetInnerHTML={{ __html: frontHtml }} /></td>
                          <td className="px-4 py-3 hidden lg:table-cell"><div className="anki-card-content line-clamp-3 text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: backHtml }} /></td>
                          <td className="px-4 py-3 hidden md:table-cell"><span className="badge-blue truncate max-w-[140px] block">{card.deckName.split('::').pop()}</span></td>
                          <td className="px-4 py-3 hidden xl:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {card.tags.slice(0, 2).map(t => <span key={t} className="badge-purple">{t}</span>)}
                              {card.tags.length > 2 && <span className="badge-amber">+{card.tags.length - 2}</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button onClick={() => setExpandedCard(isExpanded ? null : card.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100" title="Expand">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                              <button onClick={() => setStudyCard(card)} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-700 hover:bg-brand-50" title="Study Mode">
                                <BookOpen className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-blue-50/20">
                            <td colSpan="6" className="px-4 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {card.fields.map((field, fi) => (
                                  <div key={fi} className="bg-white rounded-xl border border-gray-200 p-4">
                                    <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">{field.name}</div>
                                    <div className="anki-card-content text-sm" dangerouslySetInnerHTML={{ __html: renderCardHtml(field.value, deckData.mediaFiles, showCloze) }} />
                                  </div>
                                ))}
                              </div>
                              <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                                <span><strong>Deck:</strong> {card.deckName}</span>
                                <span><strong>Type:</strong> {card.modelName}</span>
                                <span><strong>Interval:</strong> {card.ivl}d</span>
                                <span><strong>Note ID:</strong> <code>{card.noteId}</code></span>
                                {card.tags.length > 0 && <span><strong>Tags:</strong> {card.tags.join(', ')}</span>}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="btn-secondary text-xs py-1.5">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span className="text-sm text-gray-600">Page <strong>{page}</strong> of <strong>{totalPages}</strong></span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn-secondary text-xs py-1.5">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <CoffeeSupport
            variant="banner"
            title="Loving this free Anki .APKG Inspector?"
            subtitle="Search, filter, and study unlimited flashcards right in your browser. If this tool helps your exam prep, consider supporting with a $3 coffee!"
          />

          <AdSlot format="leaderboard" className="mt-6" />
          {studyCard && <FlashcardModal card={studyCard} mediaFiles={deckData.mediaFiles} showCloze={showCloze} onClose={() => setStudyCard(null)} />}
        </>
      )}

      {/* Semantic SEO & GEO Content */}
      <article className="mt-16 space-y-8 text-gray-700 leading-relaxed border-t border-gray-200 pt-12">
        <header>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            How to open an .apkg file online without installing Anki?
          </h2>
          <p className="mt-3 text-base text-gray-600 leading-relaxed">
            Opening an Anki package (.apkg or .colpkg) traditionally required downloading and installing Anki desktop software on Windows, macOS, or Linux. <strong>AnkiDeckStudio</strong> solves this by running an entire SQLite relational database engine compiled to WebAssembly (<strong>sql.js</strong>) directly inside your web browser. Drag and drop any .apkg file above to inspect notes, reveal Cloze deletions, filter subdecks, and preview anatomical diagrams with zero installation and zero cloud latency. If your loaded collection contains heavy high-resolution images, you can instantly <Link to="/anki-deck-compressor" className="text-brand-600 underline font-medium hover:text-brand-700">shrink oversized decks with our Anki Deck Media Compressor</Link> to reduce file sizes by 70–85%.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Why do modern Anki exports fail on generic online file viewers?
          </h2>
          <p>
            Beginning with Anki 23.10 and Anki 24+, Anki exports utilize Zstandard-compressed SQLite databases named <code>collection.anki21b</code> instead of legacy uncompressed databases. To maintain backward compatibility while preventing corruption in legacy software, modern exports include a dummy <code>collection.anki2</code> file that contains only a single placeholder note stating: <em>&quot;This file requires a newer version of Anki.&quot;</em>
          </p>
          <p>
            Generic online viewers (such as FileProInfo or Quizard) inspect only the dummy <code>collection.anki2</code> file and fail to show your actual cards. AnkiDeckStudio implements a strict 3-tier inspection hierarchy:
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li><strong>Primary (Modern Zstd):</strong> Inspects <code>collection.anki21b</code> and decompresses the raw bytes using pure-JavaScript <code>fzstd</code> before mounting into WebAssembly SQLite.</li>
            <li><strong>Secondary (Anki 2.1.50+):</strong> Inspects uncompressed Schema 18 <code>collection.anki21</code> databases.</li>
            <li><strong>Fallback (Legacy Schema 11):</strong> Loads <code>collection.anki2</code> only if neither modern variant exists in the ZIP archive.</li>
          </ol>
        </section>

        {/* GEO Comparison Table */}
        <GeoComparisonTable type="viewer" />

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            100% Client-Side Privacy: Why medical and legal students trust AnkiDeckStudio
          </h2>
          <p>
            Medical students studying for USMLE Step 1 and Step 2 CK (using massive shared decks like AnKing, Zanki, and Lightyear) and law students preparing for the Bar exam often handle proprietary questions and personal clinical notes. AnkiDeckStudio executes <strong>100% within your browser local memory (RAM)</strong>. No network request containing your cards, notes, images, or audio is ever dispatched to our servers or third parties. After reviewing your cards, you can <Link to="/apkg-to-pdf" className="text-brand-600 underline font-medium hover:text-brand-700">print a two-column PDF study sheet</Link> for tactile exam revision, or <Link to="/apkg-to-csv-quizlet" className="text-brand-600 underline font-medium hover:text-brand-700">export cards to CSV, Excel, and Quizlet</Link> with clean, stripped Cloze text.
          </p>
        </section>

        <AdSlot format="rectangle" />

        {/* Visible FAQ Section matching Schema */}
        <FaqSection
          faqs={SEO_ROUTES['/apkg-viewer'].faq}
          title={SEO_ROUTES['/apkg-viewer'].faqTitle || "Frequently Asked Questions: Online Anki .APKG Viewer & Inspector"}
        />
      </article>
    </div>
  );
}
