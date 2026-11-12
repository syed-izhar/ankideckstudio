import React from 'react';
import { Check, X, Shield, Zap, HardDrive, Database, Image, Shrink, FileText, Table2, Sliders, Smartphone, Laptop, Scissors } from 'lucide-react';

const TABLE_DATA = {
  viewer: {
    title: 'Architecture Comparison: AnkiDeckStudio vs. Cloud File Converters',
    subtitle: 'Why client-side WebAssembly SQLite beats cloud-hosted upload tools for flashcard privacy, speed, and modern Anki 24+ support.',
    headers: {
      feature: 'Technical Feature',
      primary: 'AnkiDeckStudio (Client-Side WASM)',
      comp1: 'Cloud File Viewers (FileProInfo 150MB Cap)',
      comp2: 'Text-Only Viewers (Quizard / DocHub)'
    },
    rows: [
      {
        feature: 'File Size Limit',
        icon: HardDrive,
        primary: 'Unlimited / 2GB+ (Limited only by client RAM)',
        comp1: '150MB hard server cap',
        comp2: '25MB – 50MB upload limit'
      },
      {
        feature: 'Modern Schema Support',
        icon: Database,
        primary: 'Anki 24+ Zstd .anki21b, Schema 18 & Legacy Schema 11',
        comp1: 'Fails on .anki21b (shows "requires newer Anki" dummy note)',
        comp2: 'Fails or corrupts on multi-table SQLite schemas'
      },
      {
        feature: 'Image & Audio Support',
        icon: Image,
        primary: 'Full inline diagrams (PNG, JPG, WebP, SVG) & HTML5 audio',
        comp1: 'Broken image references or text-only dumps',
        comp2: 'Text-only (strips all anatomical diagrams and charts)'
      },
      {
        feature: 'Privacy & Data Security',
        icon: Shield,
        primary: '100% Client-Side Local RAM (Zero server uploads)',
        comp1: 'Uploaded to third-party cloud servers with unknown retention',
        comp2: 'Uploaded to remote conversion servers'
      },
      {
        feature: 'Execution Speed & Reliability',
        icon: Zap,
        primary: 'Instant WebAssembly (sql.js + fzstd) inside browser',
        comp1: 'Slow upload times and frequent server timeout errors',
        comp2: 'Queued cloud conversions with formatting loss'
      }
    ]
  },
  compressor: {
    title: 'Comparison: Browser WebP Compression vs. Desktop Anki & Manual Scripts',
    subtitle: 'How client-side canvas WebP conversion outperforms uncompressed archives and complex local Python/ImageMagick scripts.',
    headers: {
      feature: 'Compression Benchmark',
      primary: 'AnkiDeckStudio WebP Compressor',
      comp1: 'Uncompressed .APKG Decks',
      comp2: 'Desktop Add-ons & Manual Scripts'
    },
    rows: [
      {
        feature: 'Average Deck Size Reduction',
        icon: Shrink,
        primary: '70–85% smaller (PNG/JPG converted to WebP)',
        comp1: '0% reduction (inflated PNGs and 4K scans)',
        comp2: 'Variable (20–40% with lossy JPG)'
      },
      {
        feature: 'SQLite <img src> Auto-Rewriting',
        icon: Database,
        primary: 'Automatic (rewrites all note fields in SQLite RAM)',
        comp1: 'N/A (media files remain heavy)',
        comp2: 'Manual Python script required (risk of DB corruption)'
      },
      {
        feature: 'AnkiWeb / iOS Sync Speed',
        icon: Zap,
        primary: '4–6x faster initial & daily delta sync',
        comp1: 'Frequent sync timeouts and mobile storage exhaustion',
        comp2: 'Moderate improvement with manual repackaging'
      },
      {
        feature: 'Setup Required',
        icon: Laptop,
        primary: 'Zero install (runs directly in your web browser)',
        comp1: 'None (default bulky format)',
        comp2: 'Python, ImageMagick, or obsolete Qt5 add-ons'
      },
      {
        feature: 'Cross-Platform Compatibility',
        icon: Smartphone,
        primary: '100% compatible with Anki 2.1.45+, AnkiDroid & AnkiMobile',
        comp1: 'Universal but storage heavy',
        comp2: 'Prone to add-on incompatibility on Anki 24+'
      }
    ]
  },
  pdf: {
    title: 'Comparison: AnkiDeckStudio PDF Study Guide vs. Other PDF Exporters',
    subtitle: 'Why specialized client-side study guide rendering creates superior printable review sheets compared to generic converters.',
    headers: {
      feature: 'Evaluation Metric',
      primary: 'AnkiDeckStudio PDF Engine',
      comp1: 'Quizard / Text-Only Converters',
      comp2: 'DocHub / Generic Converters'
    },
    rows: [
      {
        feature: 'Embedded Medical Diagrams',
        icon: Image,
        primary: 'Full inline images, anatomy diagrams & SVGs',
        comp1: 'Text-only (all images completely stripped)',
        comp2: 'Distorted image scaling and broken aspect ratios'
      },
      {
        feature: 'Cloze Worksheet Mode',
        icon: Scissors,
        primary: 'Interactive fill-in-the-blank lines (_____) for active recall',
        comp1: 'Raw {{c1::answer}} brackets or answers exposed',
        comp2: 'Unformatted bracket text without worksheet styling'
      },
      {
        feature: 'Page-Break Control',
        icon: FileText,
        primary: 'CSS break-inside: avoid (prevents bisected cards)',
        comp1: 'Awkward page splits slicing cards across pages',
        comp2: 'Random page breaks cutting text and tables in half'
      },
      {
        feature: 'Unicode/CJK Language Support',
        icon: Database,
        primary: '100% native browser fonts (Kanji, Cyrillic, Arabic, Hebrew)',
        comp1: 'Missing glyph boxes (tofu symbols)',
        comp2: 'Font substitution errors with broken diacritics'
      },
      {
        feature: 'Layout Customization',
        icon: Sliders,
        primary: 'Compact 2-column, full card, adjustable font size',
        comp1: 'Rigid unformatted single-column wall of text',
        comp2: 'Manual drag-and-drop page formatting required'
      }
    ]
  },
  csv: {
    title: 'Comparison: AnkiDeckStudio Exporter vs. Native Anki Export & Add-ons',
    subtitle: 'Why in-browser field parsing makes exporting to Quizlet, Excel, and JSON smoother than native Anki export menus.',
    headers: {
      feature: 'Export Capability',
      primary: 'AnkiDeckStudio CSV/Quizlet Exporter',
      comp1: 'Desktop Anki Export',
      comp2: 'Broken Qt6 Add-ons (CrowdAnki, etc.)'
    },
    rows: [
      {
        feature: 'One-Click Quizlet Format',
        icon: Zap,
        primary: 'Auto tab-delimited clipboard copy (ready to paste)',
        comp1: 'Requires manual TSV save, open in editor, and re-copy',
        comp2: 'Frequent syntax errors and delimiter collision'
      },
      {
        feature: 'HTML & Cloze Stripping',
        icon: Scissors,
        primary: '1-click clean plain text (removes div, span, {{c1::}})',
        comp1: 'Exports raw messy HTML tags and cloze tokens',
        comp2: 'Inconsistent regex replacements breaking accents'
      },
      {
        feature: 'Multi-Format Output',
        icon: Table2,
        primary: 'CSV, Excel TSV, JSON array, and Quizlet tab format',
        comp1: 'Basic text file or heavy .apkg archive only',
        comp2: 'Custom format often unsupported by other tools'
      },
      {
        feature: 'No Desktop App Required',
        icon: Laptop,
        primary: 'Works on iPad, Chromebook, Android, and Desktop',
        comp1: 'Requires installing desktop Anki on Windows/Mac/Linux',
        comp2: 'Breaks on newer Anki versions (Qt6 / Python 3.11)'
      },
      {
        feature: 'Privacy & Local Execution',
        icon: Shield,
        primary: '100% Client-Side RAM (Zero telemetry or uploads)',
        comp1: 'Local desktop execution',
        comp2: 'Third-party add-on scripts running arbitrary Python'
      }
    ]
  }
};

export default function GeoComparisonTable({ type = 'viewer' }) {
  const config = TABLE_DATA[type] || TABLE_DATA.viewer;

  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <h3 className="text-lg font-bold text-gray-900">
          {config.title}
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          {config.subtitle}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-100/75 text-gray-700">
              <th className="px-5 py-3.5 font-semibold">{config.headers.feature}</th>
              <th className="px-5 py-3.5 font-bold text-brand-700 bg-brand-50/60">
                {config.headers.primary}
              </th>
              <th className="px-5 py-3.5 font-medium text-gray-600">
                {config.headers.comp1}
              </th>
              <th className="px-5 py-3.5 font-medium text-gray-600">
                {config.headers.comp2}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {config.rows.map((r, i) => {
              const Icon = r.icon;
              return (
                <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{r.feature}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-brand-900 bg-brand-50/40">
                    <div className="flex items-start gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{r.primary}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    <div className="flex items-start gap-1.5">
                      <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{r.comp1}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    <div className="flex items-start gap-1.5">
                      <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{r.comp2}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
