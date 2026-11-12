import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDeck } from '../context/DeckContext';
import Dropzone from '../components/Dropzone';
import StatsBar from '../components/StatsBar';
import AdSlot from '../components/AdSlot';
import CoffeeSupport from '../components/CoffeeSupport';
import GeoComparisonTable from '../components/GeoComparisonTable';
import FaqSection from '../components/FaqSection';
import { SEO_ROUTES } from '../config/seoConfig';
import { clozePlainText, stripHtml } from '../services/apkgEngine';
import {
  Table2, Download, Copy, Check, Settings, ChevronDown, ChevronUp,
  FileJson, FileSpreadsheet, FileText, Braces
} from 'lucide-react';

function escapeField(str, delimiter) {
  if (!str) return '';
  const needsQuote = str.includes(delimiter) || str.includes('"') || str.includes('\n');
  if (needsQuote) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function buildRows(cards, options) {
  const { delimiter, stripTags, clozeToPlain, includeDeck, includeTags, selectedFields } = options;

  return cards.map(card => {
    const fields = card.fields.map(f => {
      let val = f.value;
      if (clozeToPlain) val = clozePlainText(val);
      if (stripTags) val = stripHtml(val);
      return val.replace(/\r?\n/g, ' ').trim();
    });

    const row = [];
    if (selectedFields.length === 0) {
      row.push(...fields);
    } else {
      for (const name of selectedFields) {
        const f = card.fields.find(f2 => f2.name === name);
        row.push(f ? (clozeToPlain ? (stripTags ? stripHtml(clozePlainText(f.value)) : clozePlainText(f.value)) : (stripTags ? stripHtml(f.value) : f.value)).replace(/\r?\n/g, ' ').trim() : '');
      }
    }
    if (includeDeck) row.push(card.deckName);
    if (includeTags) row.push(card.tags.join(' '));
    return row.map(v => escapeField(v, delimiter));
  });
}

function buildCsv(cards, options) {
  const rows = buildRows(cards, options);
  const header = [];
  const sampleCard = cards[0];
  if (sampleCard) {
    const fields = options.selectedFields.length > 0
      ? options.selectedFields
      : sampleCard.fields.map(f => f.name);
    header.push(...fields.map(n => escapeField(n, options.delimiter)));
  }
  if (options.includeDeck) header.push('Deck');
  if (options.includeTags) header.push('Tags');
  return [header.join(options.delimiter), ...rows.map(r => r.join(options.delimiter))].join('\n');
}

function buildJson(cards, options) {
  return JSON.stringify(cards.map(card => {
    const obj = { id: card.id, deck: card.deckName, tags: card.tags };
    for (const f of card.fields) {
      let val = f.value;
      if (options.clozeToPlain) val = clozePlainText(val);
      if (options.stripTags) val = stripHtml(val);
      obj[f.name] = val.trim();
    }
    return obj;
  }), null, 2);
}

function buildQuizlet(cards, options) {
  // Quizlet format: term TAB definition NEWLINE
  return cards.map(card => {
    const front = card.fields[0]?.value || '';
    const back = card.fields[1]?.value || front;
    const f = options.stripTags ? stripHtml(options.clozeToPlain ? clozePlainText(front) : front) : (options.clozeToPlain ? clozePlainText(front) : front);
    const b = options.stripTags ? stripHtml(options.clozeToPlain ? clozePlainText(back) : back) : (options.clozeToPlain ? clozePlainText(back) : back);
    return `${f.trim()}\t${b.trim()}`;
  }).join('\n');
}

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

export default function CsvPage() {
  const { deckData, fileName } = useDeck();
  const [delimiter, setDelimiter] = useState(',');
  const [customDelimiter, setCustomDelimiter] = useState('|');
  const [stripTagsHtml, setStripTagsHtml] = useState(true);
  const [clozeToPlain, setClozeToPlain] = useState(true);
  const [includeDeck, setIncludeDeck] = useState(true);
  const [includeTags, setIncludeTags] = useState(true);
  const [selectedDeck, setSelectedDeck] = useState('');
  const [selectedFields, setSelectedFields] = useState([]);
  const [showSettings, setShowSettings] = useState(true);
  const [copied, setCopied] = useState(false);

  const resolvedDelimiter = delimiter === 'custom' ? customDelimiter : delimiter === 'tab' ? '\t' : delimiter;

  const options = {
    delimiter: resolvedDelimiter,
    stripTags: stripTagsHtml,
    clozeToPlain,
    includeDeck,
    includeTags,
    selectedFields
  };

  const filteredCards = useMemo(() => {
    if (!deckData) return [];
    if (selectedDeck) return deckData.cards.filter(c => c.deckName.startsWith(selectedDeck));
    return deckData.cards;
  }, [deckData, selectedDeck]);

  const previewRows = useMemo(() => {
    if (filteredCards.length === 0) return [];
    return buildRows(filteredCards.slice(0, 5), options);
  }, [filteredCards, options]);

  const previewHeaders = useMemo(() => {
    if (!deckData || filteredCards.length === 0) return [];
    const sampleCard = filteredCards[0];
    const fields = selectedFields.length > 0
      ? selectedFields
      : sampleCard.fields.map(f => f.name);
    const h = [...fields];
    if (includeDeck) h.push('Deck');
    if (includeTags) h.push('Tags');
    return h;
  }, [deckData, filteredCards, selectedFields, includeDeck, includeTags]);

  // All available field names across all note types
  const allFieldNames = useMemo(() => {
    if (!deckData) return [];
    const names = new Set();
    for (const card of deckData.cards) {
      for (const f of card.fields) names.add(f.name);
    }
    return [...names];
  }, [deckData]);

  const toggleField = (name) => {
    setSelectedFields(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleCopyQuizlet = () => {
    const content = buildQuizlet(filteredCards, options);
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const baseName = fileName.replace(/\.(apkg|colpkg)$/i, '');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Convert .APKG to <span className="text-brand-600">CSV, Excel, JSON &amp; Quizlet</span>
        </h1>
        <p className="text-gray-600 mt-2 max-w-2xl">
          Export your Anki deck to CSV, TSV, JSON, or Quizlet import format — 100% free. All downloads are instant and work offline.
        </p>
      </div>

      <Dropzone />

      {deckData && (
        <>
          <StatsBar />

          {/* Settings */}
          <div className="bg-white border border-gray-200 rounded-xl mb-6 overflow-hidden">
            <button onClick={() => setShowSettings(!showSettings)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <Settings className="w-4 h-4 text-brand-500" /> Export Settings
              </div>
              {showSettings ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {showSettings && (
              <div className="px-5 pb-5 border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Delimiter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delimiter</label>
                  <div className="space-y-1">
                    {[{ val: ',', label: 'Comma (CSV)' }, { val: 'tab', label: 'Tab (TSV / Excel)' }, { val: ';', label: 'Semicolon' }, { val: 'custom', label: 'Custom' }].map(opt => (
                      <label key={opt.val} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="delim" value={opt.val} checked={delimiter === opt.val} onChange={() => setDelimiter(opt.val)} className="accent-brand-600" />
                        <span className="text-sm text-gray-700">{opt.label}</span>
                      </label>
                    ))}
                    {delimiter === 'custom' && (
                      <input type="text" value={customDelimiter} onChange={e => setCustomDelimiter(e.target.value)} className="input-field w-24 mt-1" maxLength={3} />
                    )}
                  </div>
                </div>

                {/* Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                  <div className="space-y-2">
                    {[
                      { val: stripTagsHtml, setter: setStripTagsHtml, label: 'Strip HTML tags' },
                      { val: clozeToPlain, setter: setClozeToPlain, label: 'Cloze to plain text' },
                      { val: includeDeck, setter: setIncludeDeck, label: 'Include Deck column' },
                      { val: includeTags, setter: setIncludeTags, label: 'Include Tags column' },
                    ].map(opt => (
                      <label key={opt.label} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={opt.val} onChange={e => opt.setter(e.target.checked)} className="accent-brand-600" />
                        <span className="text-sm text-gray-700">{opt.label}</span>
                      </label>
                    ))}
                  </div>

                  {deckData.allDecks.length > 1 && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Filter Deck</label>
                      <select value={selectedDeck} onChange={e => setSelectedDeck(e.target.value)} className="input-field text-sm">
                        <option value="">All Decks</option>
                        {deckData.allDecks.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                {/* Field selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fields to Export <span className="text-xs text-gray-400">(default: all)</span>
                  </label>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {allFieldNames.map(name => (
                      <label key={name} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={selectedFields.includes(name)} onChange={() => toggleField(name)} className="accent-brand-600" />
                        <span className="text-sm text-gray-700 truncate">{name}</span>
                      </label>
                    ))}
                  </div>
                  {selectedFields.length > 0 && (
                    <button onClick={() => setSelectedFields([])} className="text-xs text-brand-600 hover:underline mt-1">Clear selection (use all)</button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Export Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <button
              onClick={() => downloadFile(buildCsv(filteredCards, options), `${baseName}.csv`, 'text/csv')}
              className="btn-primary flex-col py-4 h-auto"
            >
              <FileSpreadsheet className="w-6 h-6 mb-1" />
              <span>.CSV</span>
              <span className="text-xs font-normal opacity-80">Excel / Google Sheets</span>
            </button>
            <button
              onClick={() => downloadFile(buildCsv(filteredCards, { ...options, delimiter: '\t' }), `${baseName}.tsv`, 'text/tab-separated-values')}
              className="btn-secondary flex-col py-4 h-auto"
            >
              <FileText className="w-6 h-6 mb-1 text-gray-600" />
              <span>.TSV</span>
              <span className="text-xs font-normal opacity-70">Tab-separated</span>
            </button>
            <button
              onClick={() => downloadFile(buildJson(filteredCards, options), `${baseName}.json`, 'application/json')}
              className="btn-secondary flex-col py-4 h-auto"
            >
              <Braces className="w-6 h-6 mb-1 text-gray-600" />
              <span>.JSON</span>
              <span className="text-xs font-normal opacity-70">Structured data</span>
            </button>
            <button
              onClick={handleCopyQuizlet}
              className="btn-success flex-col py-4 h-auto"
            >
              {copied ? <Check className="w-6 h-6 mb-1" /> : <Copy className="w-6 h-6 mb-1" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
              <span className="text-xs font-normal opacity-80">Quizlet import format</span>
            </button>
          </div>

          {/* Preview Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
              <Table2 className="w-4 h-4 text-gray-500" />
              <span className="font-semibold text-sm text-gray-700">Preview (first 5 rows of {filteredCards.length.toLocaleString()})</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {previewHeaders.map((h, i) => (
                      <th key={i} className="text-left px-3 py-2 font-semibold text-gray-600 max-w-[200px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      {row.map((cell, j) => (
                        <td key={j} className="px-3 py-2 text-gray-700 max-w-[200px] truncate">{cell.replace(/^"|"$/g, '').replace(/""/g, '"')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <CoffeeSupport
            variant="banner"
            title="Enjoying this free CSV & Quizlet converter?"
            subtitle="AnkiDeckStudio is 100% free and client-side. If it saved you hours of manual card transcription, consider tossing $3 in the tip jar!"
          />

          <AdSlot format="leaderboard" className="mt-6" />
        </>
      )}

      {/* Below-the-fold Semantic SEO & GEO Technical Documentation */}
      <article className="mt-16 space-y-10 border-t border-gray-200/80 pt-12 text-gray-700 leading-relaxed max-w-4xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">How to convert an Anki .apkg deck to CSV, Excel, or Google Sheets?</h2>
          <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
            Exporting your flashcards to comma-separated values (CSV) or tab-delimited text unlocks your data for advanced sorting in Microsoft Excel, Google Sheets, Notion databases, and Obsidian tables. AnkiDeckStudio parses every note field and model schema, allowing you to select exact field headers, sanitize HTML markup, and export clean structured tables ready for immediate spreadsheet analysis or batch editing. You can first <Link to="/apkg-viewer" className="text-brand-600 underline font-medium hover:text-brand-700">preview cards in the Anki APKG Viewer</Link> to inspect note types and tags before exporting.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">How do I import an Anki deck directly into Quizlet without errors?</h2>
          <ol className="mt-3 list-decimal pl-6 space-y-2 text-sm md:text-base text-gray-600 leading-relaxed">
            <li>Click <strong>Copy (Quizlet import format)</strong> above to load your cards into the clipboard in Tab-delimited term/definition format with Cloze brackets cleanly converted to plaintext.</li>
            <li>In Quizlet, navigate to <strong>+ Create</strong> &rarr; <strong>Import from Word, Excel, Google Docs</strong>.</li>
            <li>Paste your clipboard contents directly into the dialog box. Quizlet will automatically recognize the Tab separator and line breaks.</li>
            <li>Click <strong>Import</strong> to create your Quizlet study set instantly.</li>
          </ol>
        </div>

        {/* Generative Engine Optimization Comparison Table */}
        <GeoComparisonTable type="csv" />

        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">How does AnkiDeckStudio handle complex Cloze deletions during export?</h2>
          <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
            By default, Anki formats cloze cards with internal syntax like <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">&#123;&#123;c1::cardiovascular::system&#125;&#125;</code>. AnkiDeckStudio's Cloze parser automatically strips these tokens down to clean plaintext (&quot;cardiovascular&quot;) or preserves optional hints, ensuring spreadsheet rows and Quizlet terms don't contain messy regex code.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Can developers export JSON data for custom spaced repetition algorithms or REST APIs?</h2>
          <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
            Yes. The <strong>.JSON</strong> export generates a typed, formatted array of card objects containing note IDs, deck taxonomies, field mappings, and tag arrays. This is ideal for importing into custom mobile apps, AI fine-tuning pipelines, or Python data science workflows. If you need physical study notes instead of spreadsheets, you can also <Link to="/apkg-to-pdf" className="text-brand-600 underline font-medium hover:text-brand-700">export to a printable PDF study guide</Link> with full diagrams and cloze worksheets.
          </p>
        </div>

        <AdSlot format="rectangle" className="my-6" />

        {/* FAQ Section matching JSON-LD Schema */}
        <FaqSection
          faqs={SEO_ROUTES['/apkg-to-csv-quizlet'].faq}
          title={SEO_ROUTES['/apkg-to-csv-quizlet'].faqTitle || "Frequently Asked Questions: Anki .APKG to CSV, Excel & Quizlet Converter"}
        />
      </article>
    </div>
  );
}
