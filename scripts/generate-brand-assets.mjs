import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import zlib from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// Find Chrome binary
function getChromePath() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.CHROME_BIN,
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium'
  ].filter(Boolean);

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

// Pure Node.js PNG encoder fallback (zero external dependencies)
function createPngBuffer(width, height, getPixelRgba) {
  const scanlineWidth = 1 + width * 4;
  const rawData = Buffer.alloc(height * scanlineWidth);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineWidth;
    rawData[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = getPixelRgba(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });

  const makeChunk = (type, data) => {
    const chunk = Buffer.alloc(12 + data.length);
    chunk.writeUInt32BE(data.length, 0);
    chunk.write(type, 4, 4, 'ascii');
    data.copy(chunk, 8);
    const crc = zlib.crc32(chunk.subarray(4, 8 + data.length));
    chunk.writeUInt32BE(crc >>> 0, 8 + data.length);
    return chunk;
  };

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

// Render HTML template via Chrome headless screenshot
function renderHtmlToPngWithChrome(chromePath, htmlContent, width, height, outputPath) {
  const tempHtml = path.join(PUBLIC_DIR, `temp-${Date.now()}-${width}x${height}.html`);
  fs.writeFileSync(tempHtml, htmlContent, 'utf-8');

  try {
    const fileUrl = 'file:///' + tempHtml.replace(/\\/g, '/');
    const args = [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--allow-file-access-from-files',
      `--screenshot=${outputPath}`,
      `--window-size=${width},${height}`,
      `--default-background-color=00000000`,
      fileUrl
    ];

    const res = spawnSync(chromePath, args, { encoding: 'utf-8', timeout: 15000 });
    if (res.error) throw res.error;

    if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
      throw new Error(`Chrome failed to generate screenshot at ${outputPath}`);
    }
  } finally {
    if (fs.existsSync(tempHtml)) {
      fs.unlinkSync(tempHtml);
    }
  }
}

// HTML Templates for Assets
function getFaviconHtml(size, radius) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: ${size}px;
    height: ${size}px;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
</style>
</head>
<body>
  <svg width="${size}" height="${size}" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Rounded background -->
    <rect width="192" height="192" rx="${radius}" fill="#2563EB"/>
    <rect width="192" height="192" rx="${radius}" fill="url(#blue_grad)"/>
    <!-- Back Tilted Card -->
    <rect x="52" y="36" width="88" height="120" rx="14" fill="#1D4ED8" transform="rotate(7 96 96)"/>
    <!-- Front Card with subtle shadow -->
    <rect x="46" y="36" width="100" height="120" rx="14" fill="#FFFFFF"/>
    <!-- Anki Star / Flashcard Emblem -->
    <path d="M96 54L102 72H121L106 83L111 101L96 90L81 101L86 83L71 72H90L96 54Z" fill="#2563EB"/>
    <!-- Flashcard content lines -->
    <rect x="62" y="112" width="68" height="8" rx="4" fill="#CBD5E1"/>
    <rect x="70" y="126" width="52" height="8" rx="4" fill="#3B82F6"/>
    <defs>
      <linearGradient id="blue_grad" x1="0" y1="0" x2="192" y2="192" gradientUnits="userSpaceOnUse">
        <stop stop-color="#3B82F6" stop-opacity="0.4"/>
        <stop offset="1" stop-color="#1E40AF" stop-opacity="0.7"/>
      </linearGradient>
    </defs>
  </svg>
</body>
</html>`;
}

function getOgImageHtml() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px;
    height: 630px;
    background: #0B0F19;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #F8FAFC;
    padding: 56px 64px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }
  .bg-glow {
    position: absolute;
    top: -150px;
    right: -100px;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(37, 99, 235, 0.35) 0%, rgba(15, 23, 42, 0) 70%);
    pointer-events: none;
  }
  .bg-glow-bottom {
    position: absolute;
    bottom: -150px;
    left: -100px;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(15, 23, 42, 0) 70%);
    pointer-events: none;
  }
  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 10;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .brand-icon {
    width: 52px;
    height: 52px;
    background: #2563EB;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);
  }
  .brand-name {
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: #FFFFFF;
  }
  .brand-name span {
    color: #60A5FA;
  }
  .privacy-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(30, 41, 59, 0.85);
    border: 1px solid rgba(59, 130, 246, 0.4);
    padding: 8px 18px;
    border-radius: 9999px;
    font-size: 14px;
    font-weight: 600;
    color: #93C5FD;
  }
  .hero-section {
    z-index: 10;
    margin: 24px 0;
  }
  .hero-title {
    font-size: 48px;
    line-height: 1.15;
    font-weight: 800;
    letter-spacing: -1px;
    max-width: 1050px;
    margin-bottom: 14px;
    background: linear-gradient(135deg, #FFFFFF 30%, #BAE6FD 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .hero-sub {
    font-size: 20px;
    color: #94A3B8;
    line-height: 1.45;
    max-width: 950px;
  }
  .features-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    z-index: 10;
  }
  .feature-card {
    background: rgba(30, 41, 59, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 16px 18px;
    backdrop-filter: blur(8px);
  }
  .feature-title {
    font-size: 15px;
    font-weight: 700;
    color: #F1F5F9;
    margin-bottom: 4px;
  }
  .feature-desc {
    font-size: 12px;
    color: #94A3B8;
    line-height: 1.35;
  }
  .footer-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 18px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 14px;
    color: #64748B;
    z-index: 10;
  }
  .footer-row strong {
    color: #93C5FD;
  }
</style>
</head>
<body>
  <div class="bg-glow"></div>
  <div class="bg-glow-bottom"></div>

  <div class="header-row">
    <div class="brand">
      <div class="brand-icon">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="4" width="14" height="16" rx="2.5" fill="#FFFFFF"/>
          <path d="M12 7L13.2 9.5H16L13.8 11L14.6 13.5L12 12.1L9.4 13.5L10.2 11L8 9.5H10.8L12 7Z" fill="#2563EB"/>
        </svg>
      </div>
      <div class="brand-name">AnkiDeck<span>Studio</span></div>
    </div>
    <div class="privacy-pill">
      <span>🔒</span> 100% Client-Side WebAssembly • Zero Uploads
    </div>
  </div>

  <div class="hero-section">
    <h1 class="hero-title">Free Browser .APKG Viewer, WebP Media Compressor &amp; PDF Study Guide Converter</h1>
    <p class="hero-sub">The complete all-in-one private toolkit for medical students, language learners, and educators using Anki flashcards. Open any .apkg file instantly in your browser.</p>
  </div>

  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-title">🔍 APKG Viewer</div>
      <div class="feature-desc">Full Zstd .anki21b, schema 11/18, cloze toggle &amp; instant search</div>
    </div>
    <div class="feature-card">
      <div class="feature-title">🗜️ WebP Compressor</div>
      <div class="feature-desc">70–85% deck size reduction for lightning mobile sync</div>
    </div>
    <div class="feature-card">
      <div class="feature-title">📄 Printable PDF</div>
      <div class="feature-desc">Two-column study guides &amp; active recall worksheets</div>
    </div>
    <div class="feature-card">
      <div class="feature-title">📊 CSV &amp; Quizlet</div>
      <div class="feature-desc">Clean structured export &amp; one-click Quizlet import format</div>
    </div>
  </div>

  <div class="footer-row">
    <div>Powered by <strong>WebAssembly SQLite (sql.js)</strong> &amp; <strong>fzstd</strong></div>
    <div><strong>ankideckstudio.pages.dev</strong> • Free &amp; Open-Access</div>
  </div>
</body>
</html>`;
}

console.log('Generating production brand assets for SEO & Google Search SERP compliance...');

const chromePath = getChromePath();
console.log('Chrome binary status:', chromePath ? `Found at ${chromePath}` : 'Not found (using pure Node PNG fallback)');

const assets = [
  {
    name: 'favicon-192.png',
    width: 192,
    height: 192,
    getHtml: () => getFaviconHtml(192, 42),
    fallbackGenerator: () => createPngBuffer(192, 192, (x, y) => {
      // Rounded square blue background with white emblem
      const radius = 42;
      const isInside = (x < radius && y < radius && Math.hypot(x - radius, y - radius) > radius) ||
                       (x > 192 - radius && y < radius && Math.hypot(x - (192 - radius), y - radius) > radius) ||
                       (x < radius && y > 192 - radius && Math.hypot(x - radius, y - (192 - radius)) > radius) ||
                       (x > 192 - radius && y > 192 - radius && Math.hypot(x - (192 - radius), y - (192 - radius)) > radius);
      if (isInside) return [0, 0, 0, 0];
      // Inside white card area: [50..142] x [40..152]
      if (x >= 50 && x <= 142 && y >= 40 && y <= 152) return [255, 255, 255, 255];
      // Blue background
      return [37, 99, 235, 255];
    })
  },
  {
    name: 'apple-touch-icon.png',
    width: 180,
    height: 180,
    getHtml: () => getFaviconHtml(180, 38),
    fallbackGenerator: () => createPngBuffer(180, 180, (x, y) => {
      const radius = 38;
      const isInside = (x < radius && y < radius && Math.hypot(x - radius, y - radius) > radius) ||
                       (x > 180 - radius && y < radius && Math.hypot(x - (180 - radius), y - radius) > radius) ||
                       (x < radius && y > 180 - radius && Math.hypot(x - radius, y - (180 - radius)) > radius) ||
                       (x > 180 - radius && y > 180 - radius && Math.hypot(x - (180 - radius), y - (180 - radius)) > radius);
      if (isInside) return [0, 0, 0, 0];
      if (x >= 46 && x <= 134 && y >= 38 && y <= 144) return [255, 255, 255, 255];
      return [37, 99, 235, 255];
    })
  },
  {
    name: 'og-image.png',
    width: 1200,
    height: 630,
    getHtml: () => getOgImageHtml(),
    fallbackGenerator: () => createPngBuffer(1200, 630, (x, y) => {
      // Dark slate background with blue gradient
      const t = y / 630;
      const r = Math.round(11 + t * 15);
      const g = Math.round(15 + t * 25);
      const b = Math.round(25 + t * 45);
      return [r, g, b, 255];
    })
  }
];

for (const asset of assets) {
  const targetPath = path.join(PUBLIC_DIR, asset.name);
  let rendered = false;

  if (chromePath) {
    try {
      renderHtmlToPngWithChrome(chromePath, asset.getHtml(), asset.width, asset.height, targetPath);
      console.log(`✓ Generated ${asset.name} (${asset.width}x${asset.height}px, ${fs.statSync(targetPath).size} bytes) via Chrome engine`);
      rendered = true;
    } catch (err) {
      console.warn(`Warning: Chrome render failed for ${asset.name}:`, err.message);
    }
  }

  if (!rendered) {
    const buf = asset.fallbackGenerator();
    fs.writeFileSync(targetPath, buf);
    console.log(`✓ Generated ${asset.name} (${asset.width}x${asset.height}px, ${buf.length} bytes) via Node PNG engine`);
  }
}

console.log('Brand asset generation complete.');
