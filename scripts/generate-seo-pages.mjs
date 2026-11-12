import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SEO_ROUTES, generateJsonLd, SITE_URL } from '../src/config/seoConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');

if (!fs.existsSync(DIST_DIR)) {
  console.error('Error: dist directory does not exist. Run vite build first.');
  process.exit(1);
}

const baseHtmlPath = path.join(DIST_DIR, 'index.html');
const baseHtml = fs.readFileSync(baseHtmlPath, 'utf-8');

const COMPARISON_TABLES = {
  viewer: `
    <h3>Architecture Comparison: AnkiDeckStudio vs. Cloud File Converters</h3>
    <table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%; margin: 12px 0;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th>Technical Feature</th>
          <th>AnkiDeckStudio (Client-Side WASM)</th>
          <th>Cloud File Viewers (FileProInfo 150MB Cap)</th>
          <th>Text-Only Viewers (Quizard / DocHub)</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>File Size Limit</td><td>Unlimited / 2GB+ (Limited only by client RAM)</td><td>150MB hard server cap</td><td>25MB – 50MB upload limit</td></tr>
        <tr><td>Modern Schema Support</td><td>Anki 24+ Zstd .anki21b, Schema 18 & Legacy Schema 11</td><td>Fails on .anki21b</td><td>Fails or corrupts on multi-table SQLite schemas</td></tr>
        <tr><td>Image & Audio Support</td><td>Full inline diagrams (PNG, JPG, WebP, SVG) & HTML5 audio</td><td>Broken image references or text dumps</td><td>Text-only (strips all diagrams)</td></tr>
        <tr><td>Privacy & Data Security</td><td>100% Client-Side Local RAM (Zero server uploads)</td><td>Uploaded to third-party cloud servers</td><td>Uploaded to remote conversion servers</td></tr>
      </tbody>
    </table>`,
  compressor: `
    <h3>Comparison: Browser WebP Compression vs. Desktop Anki & Manual Scripts</h3>
    <table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%; margin: 12px 0;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th>Compression Benchmark</th>
          <th>AnkiDeckStudio WebP Compressor</th>
          <th>Uncompressed .APKG Decks</th>
          <th>Desktop Add-ons & Manual Scripts</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Average Deck Size Reduction</td><td>70–85% smaller (PNG/JPG converted to WebP)</td><td>0% reduction (inflated PNGs)</td><td>Variable (20–40% with lossy JPG)</td></tr>
        <tr><td>SQLite &lt;img src&gt; Auto-Rewriting</td><td>Automatic (rewrites all note fields in SQLite RAM)</td><td>N/A</td><td>Manual Python script required (risk of DB corruption)</td></tr>
        <tr><td>AnkiWeb / iOS Sync Speed</td><td>4–6x faster initial & daily delta sync</td><td>Frequent sync timeouts and mobile storage exhaustion</td><td>Moderate improvement with manual repackaging</td></tr>
        <tr><td>Setup Required</td><td>Zero install (runs directly in your web browser)</td><td>None (default bulky format)</td><td>Python, ImageMagick, or obsolete Qt5 add-ons</td></tr>
      </tbody>
    </table>`,
  pdf: `
    <h3>Comparison: AnkiDeckStudio PDF Study Guide vs. Other PDF Exporters</h3>
    <table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%; margin: 12px 0;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th>Evaluation Metric</th>
          <th>AnkiDeckStudio PDF Engine</th>
          <th>Quizard / Text-Only Converters</th>
          <th>DocHub / Generic Converters</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Embedded Medical Diagrams</td><td>Full inline images, anatomy diagrams & SVGs</td><td>Text-only (all images completely stripped)</td><td>Distorted image scaling and broken aspect ratios</td></tr>
        <tr><td>Cloze Worksheet Mode</td><td>Interactive fill-in-the-blank lines (_____) for active recall</td><td>Raw {{c1::answer}} brackets or answers exposed</td><td>Unformatted bracket text without worksheet styling</td></tr>
        <tr><td>Page-Break Control</td><td>CSS break-inside: avoid (prevents bisected cards)</td><td>Awkward page splits slicing cards across pages</td><td>Random page breaks cutting text and tables in half</td></tr>
        <tr><td>Unicode/CJK Language Support</td><td>100% native browser fonts (Kanji, Cyrillic, Arabic, Hebrew)</td><td>Missing glyph boxes (tofu symbols)</td><td>Font substitution errors with broken diacritics</td></tr>
      </tbody>
    </table>`,
  csv: `
    <h3>Comparison: AnkiDeckStudio Exporter vs. Native Anki Export & Add-ons</h3>
    <table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%; margin: 12px 0;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th>Export Capability</th>
          <th>AnkiDeckStudio CSV/Quizlet Exporter</th>
          <th>Desktop Anki Export</th>
          <th>Broken Qt6 Add-ons (CrowdAnki, etc.)</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>One-Click Quizlet Format</td><td>Auto tab-delimited clipboard copy (ready to paste)</td><td>Requires manual TSV save, open in editor, and re-copy</td><td>Frequent syntax errors and delimiter collision</td></tr>
        <tr><td>HTML & Cloze Stripping</td><td>1-click clean plain text (removes div, span, {{c1::}})</td><td>Exports raw messy HTML tags and cloze tokens</td><td>Inconsistent regex replacements breaking accents</td></tr>
        <tr><td>Multi-Format Output</td><td>CSV, Excel TSV, JSON array, and Quizlet tab format</td><td>Basic text file or heavy .apkg archive only</td><td>Custom format often unsupported by other tools</td></tr>
        <tr><td>No Desktop App Required</td><td>Works on iPad, Chromebook, Android, and Desktop</td><td>Requires installing desktop Anki on Windows/Mac/Linux</td><td>Breaks on newer Anki versions (Qt6 / Python 3.11)</td></tr>
      </tbody>
    </table>`
};

function getTableTypeForRoute(path) {
  if (path.includes('compressor')) return 'compressor';
  if (path.includes('pdf')) return 'pdf';
  if (path.includes('csv')) return 'csv';
  return 'viewer';
}

function renderNoscriptContent(seo, routeKey) {
  const faqHtml = seo.faq.map(f => `
      <dt style="font-weight: bold; margin-top: 12px;">${f.question}</dt>
      <dd style="margin-left: 0; color: #4b5563;">${f.answer}</dd>
  `).join('');

  const featuresHtml = seo.featureList.map(feat => `<li>${feat}</li>`).join('');
  const tableType = getTableTypeForRoute(routeKey || seo.path || '');
  const comparisonHtml = COMPARISON_TABLES[tableType] || COMPARISON_TABLES.viewer;

  return `
    <noscript>
      <header>
        <h1>${seo.title}</h1>
        <p>${seo.description}</p>
      </header>
      <section>
        <p>${seo.summary}</p>
        <h2>Key Capabilities</h2>
        <ul>${featuresHtml}</ul>
      </section>
      <section>
        ${comparisonHtml}
      </section>
      <section>
        <h2>${seo.faqTitle || 'Frequently Asked Questions'}</h2>
        <dl>${faqHtml}</dl>
      </section>
      <footer>
        <p>100% Client-Side WebAssembly SQLite Anki Toolkit — Zero Remote Server Uploads.</p>
        <p><a href="${seo.canonical}">${seo.title}</a></p>
      </footer>
    </noscript>
  `;
}

function generatePageHtml(routeKey, seo) {
  let html = baseHtml;
  const jsonLd = generateJsonLd(seo);
  const jsonLdScript = `\n    <script id="seo-jsonld" type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
  const ogImage = `${SITE_URL}/og-image.png`;

  // Replace Title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${seo.title}</title>`);

  // Replace or inject meta description
  if (html.includes('<meta name="description"')) {
    html = html.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${seo.description}" />`);
  } else {
    html = html.replace('</head>', `    <meta name="description" content="${seo.description}" />\n  </head>`);
  }

  // Canonical link
  const canonicalTag = `<link rel="canonical" href="${seo.canonical}" />`;
  if (html.includes('<link rel="canonical"')) {
    html = html.replace(/<link rel="canonical" href=".*?" \/>/i, canonicalTag);
  } else {
    html = html.replace('</head>', `    ${canonicalTag}\n  </head>`);
  }

  // Ensure favicon & apple-touch-icon links exist
  if (!html.includes('favicon-192.png')) {
    html = html.replace('</head>', `    <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png" />\n  </head>`);
  }
  if (!html.includes('apple-touch-icon.png')) {
    html = html.replace('</head>', `    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />\n  </head>`);
  }

  // Open Graph & Twitter meta tags
  const socialMeta = `
    <!-- Open Graph & Social Cards -->
    <meta property="og:title" content="${seo.title}" />
    <meta property="og:description" content="${seo.description}" />
    <meta property="og:url" content="${seo.canonical}" />
    <meta property="og:type" content="${seo.ogType || 'website'}" />
    <meta property="og:site_name" content="AnkiDeckStudio" />
    <meta property="og:image" content="${ogImage}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${seo.title}" />
    <meta name="twitter:description" content="${seo.description}" />
    <meta name="twitter:image" content="${ogImage}" />${jsonLdScript}
  </head>`;

  html = html.replace('</head>', socialMeta);

  // Inject noscript content into #root for non-JS crawlers
  const noscript = renderNoscriptContent(seo, routeKey);
  html = html.replace('<div id="root"></div>', `<div id="root">${noscript}</div>`);

  return html;
}

console.log('Generating pre-rendered static route HTML files for SEO and AI crawlers...');

// Update root dist/index.html
const rootSeo = SEO_ROUTES['/'];
const rootHtml = generatePageHtml('/', rootSeo);
fs.writeFileSync(baseHtmlPath, rootHtml, 'utf-8');
console.log('✓ Updated dist/index.html (route: /)');

// Generate subroute HTML files
const subRoutes = ['/apkg-viewer', '/anki-deck-compressor', '/apkg-to-pdf', '/apkg-to-csv-quizlet'];

for (const route of subRoutes) {
  const seo = SEO_ROUTES[route];
  if (!seo) continue;

  const routeDir = path.join(DIST_DIR, route.replace(/^\//, ''));
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }

  const pageHtml = generatePageHtml(route, seo);
  const targetFile = path.join(routeDir, 'index.html');
  fs.writeFileSync(targetFile, pageHtml, 'utf-8');
  console.log(`✓ Generated ${path.relative(DIST_DIR, targetFile)} (route: ${route})`);
}

console.log('All static SEO and AI crawler pages generated successfully!');
