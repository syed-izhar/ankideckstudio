export const SITE_URL = 'https://ankideckstudio.pages.dev';
export const SITE_NAME = 'AnkiDeckStudio';

export const SEO_ROUTES = {
  '/': {
    title: 'Anki .APKG Viewer Online — Free Flashcard Inspector',
    description: 'Open and inspect any Anki .apkg or .colpkg file online without installing Anki. 100% private in-browser WebAssembly parser with image & cloze support.',
    canonical: `${SITE_URL}/`,
    path: '/',
    ogType: 'website',
    featureList: [
      '100% client-side WebAssembly SQLite parser (sql.js)',
      'Zstandard (.anki21b) decompression with fzstd',
      'Supports Anki 24+, 23.10+, and legacy Schema 11/18 archives',
      'Interactive Cloze deletion answer reveal toggle',
      'Inline image diagram rendering and HTML5 audio player',
      'Zero server uploads with instant local RAM execution'
    ],
    breadcrumbs: [
      { name: 'Home', item: `${SITE_URL}/` }
    ],
    faqTitle: 'Frequently Asked Questions: Online Anki .APKG Viewer & Inspector',
    faq: [
      {
        question: 'How do I open an .apkg file without installing Anki desktop?',
        answer: 'Drag and drop your .apkg or .colpkg file directly into AnkiDeckStudio. The WebAssembly SQLite engine (sql.js) extracts and parses the database locally in your browser memory, allowing you to search, filter, and flip cards immediately without installing any software.'
      },
      {
        question: 'Does AnkiDeckStudio support Anki 23.10+ and Anki 24+ Zstandard (.anki21b) files?',
        answer: 'Yes. AnkiDeckStudio uses a pure JavaScript Zstandard decompressor (fzstd) to decompress collection.anki21b databases and Zstd-compressed media manifests, as well as legacy Schema 11 collection.anki2 and Schema 18 collection.anki21 databases.'
      },
      {
        question: 'Are my flashcards or personal notes uploaded to a remote server?',
        answer: 'No. All decompression, database extraction, and media rendering happen 100% client-side inside your browser local RAM. Your study materials, private medical decks, and diagrams never leave your device.'
      },
      {
        question: 'Can I view images, anatomical diagrams, and listen to audio files in the viewer?',
        answer: 'Yes. Image files (PNG, JPG, SVG, WebP) are extracted into in-memory Blob URLs and rendered directly in card fields. Audio tags ([sound:file.mp3]) render interactive HTML5 mini-players.'
      },
      {
        question: 'How does AnkiDeckStudio handle Cloze deletions?',
        answer: 'Cloze deletions ({{c1::answer::hint}}) are formatted into interactive badges with a toggle button to reveal or conceal answers for active recall testing in study mode.'
      }
    ],
    summary: 'AnkiDeckStudio is a free, 100% client-side web application that opens, inspects, and previews Anki .apkg and .colpkg flashcard packages in your browser without requiring Anki desktop or server uploads. Powered by WebAssembly SQLite (sql.js) and pure JavaScript Zstandard decompression (fzstd).'
  },
  '/apkg-viewer': {
    title: 'Anki .APKG Viewer Online — Free Flashcard Inspector',
    description: 'Open and inspect any Anki .apkg or .colpkg file online without installing Anki. 100% private in-browser WebAssembly parser with image & cloze support.',
    canonical: `${SITE_URL}/apkg-viewer`,
    path: '/apkg-viewer',
    ogType: 'website',
    featureList: [
      '100% client-side WebAssembly SQLite parser (sql.js)',
      'Zstandard (.anki21b) decompression with fzstd',
      'Supports Anki 24+, 23.10+, and legacy Schema 11/18 archives',
      'Interactive Cloze deletion answer reveal toggle',
      'Inline image diagram rendering and HTML5 audio player',
      'Zero server uploads with instant local RAM execution'
    ],
    breadcrumbs: [
      { name: 'Home', item: `${SITE_URL}/` },
      { name: 'APKG Viewer', item: `${SITE_URL}/apkg-viewer` }
    ],
    faqTitle: 'Frequently Asked Questions: Online Anki .APKG Viewer & Inspector',
    faq: [
      {
        question: 'How do I open an .apkg file without installing Anki desktop?',
        answer: 'Drag and drop your .apkg or .colpkg file directly into AnkiDeckStudio. The WebAssembly SQLite engine (sql.js) extracts and parses the database locally in your browser memory, allowing you to search, filter, and flip cards immediately without installing any software.'
      },
      {
        question: 'Does AnkiDeckStudio support Anki 23.10+ and Anki 24+ Zstandard (.anki21b) files?',
        answer: 'Yes. AnkiDeckStudio uses a pure JavaScript Zstandard decompressor (fzstd) to decompress collection.anki21b databases and Zstd-compressed media manifests, as well as legacy Schema 11 collection.anki2 and Schema 18 collection.anki21 databases.'
      },
      {
        question: 'Are my flashcards or personal notes uploaded to a remote server?',
        answer: 'No. All decompression, database extraction, and media rendering happen 100% client-side inside your browser local RAM. Your study materials, private medical decks, and diagrams never leave your device.'
      },
      {
        question: 'Can I view images, anatomical diagrams, and listen to audio files in the viewer?',
        answer: 'Yes. Image files (PNG, JPG, SVG, WebP) are extracted into in-memory Blob URLs and rendered directly in card fields. Audio tags ([sound:file.mp3]) render interactive HTML5 mini-players.'
      },
      {
        question: 'How does AnkiDeckStudio handle Cloze deletions?',
        answer: 'Cloze deletions ({{c1::answer::hint}}) are formatted into interactive badges with a toggle button to reveal or conceal answers for active recall testing in study mode.'
      }
    ],
    summary: 'The online Anki .APKG Viewer enables students and educators to inspect flashcards, subdeck hierarchies, note fields, tags, and media attachments with zero installation. Works directly in modern web browsers.'
  },
  '/anki-deck-compressor': {
    title: 'Anki Deck Media Compressor — Convert Images to WebP',
    description: 'Compress Anki deck images (PNG, JPG to WebP) in your browser. Shrink .apkg file sizes by 70–85% for lightning-fast AnkiWeb syncing with zero quality loss.',
    canonical: `${SITE_URL}/anki-deck-compressor`,
    path: '/anki-deck-compressor',
    ogType: 'website',
    featureList: [
      'In-browser HTML5 Canvas to WebP image compressor',
      'Reduces .apkg file sizes by 70% to 85%',
      'Auto-updates SQLite note fields and media manifest in memory',
      'Configurable quality slider (60% to 92%) and max dimension resize',
      'Repacks 100% valid, importable .apkg archives with fflate',
      'Fixes slow AnkiWeb sync times and mobile storage limits'
    ],
    breadcrumbs: [
      { name: 'Home', item: `${SITE_URL}/` },
      { name: 'Deck Compressor', item: `${SITE_URL}/anki-deck-compressor` }
    ],
    faqTitle: 'Frequently Asked Questions: Anki Deck Media Compressor',
    faq: [
      {
        question: 'Why is my Anki sync taking forever or failing on AnkiWeb?',
        answer: 'Large image files (especially uncompressed PNG diagrams in medical decks like AnKing or Zanki) bloat deck archives to hundreds of megabytes or gigabytes, hitting AnkiWeb sync timeouts and consuming mobile storage.'
      },
      {
        question: 'How much file size reduction can I expect by converting media to WebP?',
        answer: 'Converting PNG, JPG, and BMP media files to WebP at 80% quality typically achieves between 70% and 85% file size reduction with zero perceptible degradation in anatomical diagrams or text clarity.'
      },
      {
        question: 'Will my compressed .apkg deck import normally into Anki Desktop and AnkiMobile?',
        answer: 'Yes. Anki has supported WebP images natively across desktop, iOS (AnkiMobile), and Android (AnkiDroid) since version 2.1.45. AnkiDeckStudio updates all HTML <img> tags inside SQLite and updates the media manifest before repacking.'
      },
      {
        question: 'How does in-browser image compression work without uploading files?',
        answer: 'AnkiDeckStudio decodes image blobs onto HTML5 <canvas> elements and re-encodes them to image/webp using browser hardware acceleration, ensuring your files remain strictly confidential.'
      },
      {
        question: 'Can I resize large 4K images to save even more space?',
        answer: 'Yes. You can configure the Max Dimension slider (1920px, 1280px, or 800px) to automatically downscale unnecessarily large high-resolution images while converting to WebP.'
      }
    ],
    summary: 'The Anki Deck Media Compressor slims heavy .apkg packages by converting PNG, JPG, and BMP images into modern WebP format. It updates internal SQLite references and exports a ready-to-import .apkg file directly in the browser.'
  },
  '/apkg-to-pdf': {
    title: 'Convert Anki .APKG to PDF — Printable Study Guide',
    description: 'Convert Anki .apkg decks to clean, printable two-column PDF study sheets with full diagrams, cloze worksheets, and customizable font size. 100% client-side.',
    canonical: `${SITE_URL}/apkg-to-pdf`,
    path: '/apkg-to-pdf',
    ogType: 'website',
    featureList: [
      'Crisp two-column academic study guide layout',
      'Cloze Worksheet Mode with blanked-out answers for active recall testing',
      'Embeds high-resolution anatomical diagrams and charts directly in PDF',
      'Configurable typography scale and compact vs. detailed view',
      'Subdeck filtering to print targeted exam topics',
      'Client-side print styling optimized for A4 and Letter paper'
    ],
    breadcrumbs: [
      { name: 'Home', item: `${SITE_URL}/` },
      { name: 'APKG to PDF', item: `${SITE_URL}/apkg-to-pdf` }
    ],
    faqTitle: 'Frequently Asked Questions: Convert Anki .APKG to Printable PDF',
    faq: [
      {
        question: 'How do I convert an Anki .apkg deck to a printable PDF with images?',
        answer: 'Load your .apkg file, configure your desired layout (detailed two-column or compact index), toggle whether to include diagrams, and click Print / Save as PDF to generate an academic study sheet using your browser print engine.'
      },
      {
        question: 'What is Cloze Worksheet Mode?',
        answer: 'Worksheet mode replaces Cloze deletion answers with blank lines ([___]), turning your digital flashcards into printable fill-in-the-blank practice tests for handwriting active recall.'
      },
      {
        question: 'Can I filter by specific subdecks or tags before printing to PDF?',
        answer: 'Yes. You can select specific subdecks (e.g., USMLE::Cardiology) so you only print relevant high-yield sections instead of an entire massive deck.'
      },
      {
        question: 'What paper sizes and page orientations are supported?',
        answer: 'The responsive print layout automatically optimizes for standard A4 and US Letter paper sizes in portrait or landscape orientation with clean page-break avoidance on card blocks.'
      },
      {
        question: 'How many cards can I convert to PDF for free?',
        answer: 'You can export up to 50 cards completely free of charge. Full unlimited deck conversion for decks containing thousands of cards is unlocked with the $5 Pro Pass.'
      }
    ],
    summary: 'AnkiDeckStudio converts Anki .apkg flashcard decks into formatted, printable PDF study guides. Features two-column layouts, full anatomical diagram preservation, and cloze worksheet options for offline revision.'
  },
  '/apkg-to-csv-quizlet': {
    title: 'Convert Anki to CSV, Excel & Quizlet Online (Free)',
    description: 'Export Anki .apkg flashcards to CSV, TSV, JSON, or Quizlet import format. Strip HTML, convert Cloze deletions to plain text, and bulk-edit in Excel.',
    canonical: `${SITE_URL}/apkg-to-csv-quizlet`,
    path: '/apkg-to-csv-quizlet',
    ogType: 'website',
    featureList: [
      'Instant 1-click export to CSV, TSV, JSON, and Quizlet import format',
      'HTML tag stripper toggle for clean spreadsheet cells',
      'Cloze deletion to plain-text converter',
      'Custom delimiter selector (Comma, Tab, Semicolon, Custom)',
      'Granular field selector to export specific card columns',
      '100% free with unlimited card exports'
    ],
    breadcrumbs: [
      { name: 'Home', item: `${SITE_URL}/` },
      { name: 'APKG to CSV & Quizlet', item: `${SITE_URL}/apkg-to-csv-quizlet` }
    ],
    faqTitle: 'Frequently Asked Questions: Anki .APKG to CSV, Excel & Quizlet Converter',
    faq: [
      {
        question: 'How do I import Anki cards into Quizlet?',
        answer: 'Export your cards using the Copy for Quizlet button, which formats fields with tab delimiters and newline separators. In Quizlet, click + Create → Import from Word, Excel, Google Docs and paste the clipboard contents.'
      },
      {
        question: 'How are HTML tags and Cloze syntax handled during CSV export?',
        answer: 'You can enable Strip HTML tags to remove <b>, <i>, <br>, and styling tags, and toggle Cloze to plain text to convert {{c1::answer}} into clean, readable text strings.'
      },
      {
        question: 'Can I open the exported CSV in Microsoft Excel or Google Sheets?',
        answer: 'Yes. You can choose standard Comma (CSV), Tab (TSV for direct Excel copy-pasting), or Semicolon delimiters to match your regional spreadsheet format.'
      },
      {
        question: 'Can I select which note fields are exported?',
        answer: 'Yes. AnkiDeckStudio automatically detects all field names across your note types, allowing you to select only the specific fields you need (e.g. Front and Back, or Text and Extra).'
      },
      {
        question: 'Is the CSV, JSON, and Quizlet exporter completely free?',
        answer: 'Yes. Exporting your Anki decks to CSV, TSV, JSON, and Quizlet is 100% free with unlimited card counts.'
      }
    ],
    summary: 'Convert Anki .apkg collections to CSV, Excel spreadsheets, structured JSON, or Quizlet flashcards. Features automatic HTML stripping, cloze transformation, and delimiter selection for seamless data migration.'
  }
};

export function getSeoForPath(pathname) {
  const clean = pathname ? pathname.replace(/\/$/, '') || '/' : '/';
  return SEO_ROUTES[clean] || SEO_ROUTES['/'];
}

export function generateJsonLd(seo) {
  const webAppSchema = {
    '@type': 'WebApplication',
    '@id': `${seo.canonical}#webapp`,
    name: seo.title,
    url: seo.canonical,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Any (Web Browser via WebAssembly)',
    browserRequirements: 'Requires JavaScript and WebAssembly support',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    featureList: seo.featureList,
    description: seo.description
  };

  const breadcrumbSchema = {
    '@type': 'BreadcrumbList',
    '@id': `${seo.canonical}#breadcrumbs`,
    itemListElement: seo.breadcrumbs.map((b, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: b.name,
      item: b.item
    }))
  };

  const faqSchema = {
    '@type': 'FAQPage',
    '@id': `${seo.canonical}#faq`,
    mainEntity: seo.faq.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer
      }
    }))
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [webAppSchema, breadcrumbSchema, faqSchema]
  };
}
