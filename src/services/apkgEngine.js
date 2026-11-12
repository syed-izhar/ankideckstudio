import initSqlJs from 'sql.js';
import { unzipSync, zipSync, strFromU8, strToU8 } from 'fflate';
import { decompress as zstdDecompress } from 'fzstd';

let SQL = null;

async function ensureSqlJs() {
  if (SQL) return SQL;
  SQL = await initSqlJs({
    locateFile: (file) => {
      if (typeof window !== 'undefined') {
        try {
          return new URL(`/sql-wasm.wasm`, window.location.origin).href;
        } catch (e) {
          // fallback
        }
      }
      return `https://cdn.jsdelivr.net/npm/sql.js@1.12.0/dist/${file}`;
    }
  });
  return SQL;
}

const ZSTD_MAGIC = [0x28, 0xB5, 0x2F, 0xFD];

function isZstdCompressed(data) {
  if (!data || data.length < 4) return false;
  return data[0] === ZSTD_MAGIC[0] && data[1] === ZSTD_MAGIC[1] &&
         data[2] === ZSTD_MAGIC[2] && data[3] === ZSTD_MAGIC[3];
}

function safeDecompress(data) {
  if (isZstdCompressed(data)) {
    return zstdDecompress(data);
  }
  return data;
}

function parseMediaManifest(mediaBytes) {
  let data = mediaBytes;
  if (isZstdCompressed(data)) {
    data = zstdDecompress(data);
  }
  
  // Try JSON parse first
  try {
    const jsonStr = strFromU8(new Uint8Array(data.buffer || data));
    const parsed = JSON.parse(jsonStr);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed;
    }
  } catch (e) {
    // Not JSON, try binary protobuf/UTF-8 scanner
  }

  // Binary protobuf scanner for media manifest
  const manifest = {};
  const bytes = new Uint8Array(data.buffer || data);
  let idx = 0;
  let entryIndex = 0;
  
  while (idx < bytes.length) {
    // Look for string-like sequences
    const start = idx;
    while (idx < bytes.length && bytes[idx] >= 0x20 && bytes[idx] < 0x7F) {
      idx++;
    }
    if (idx > start) {
      const str = new TextDecoder().decode(bytes.slice(start, idx));
      // If it looks like a filename (has extension)
      if (str.includes('.') && str.length > 2 && str.length < 256) {
        manifest[String(entryIndex)] = str;
        entryIndex++;
      }
    }
    idx++;
  }
  
  return manifest;
}

function extractDecksAndModels(db) {
  const decks = {};
  const models = {};
  
  // Try Schema 18 first (modern Anki)
  try {
    const deckRows = db.exec('SELECT id, name FROM decks');
    if (deckRows.length > 0) {
      for (const row of deckRows[0].values) {
        const name = String(row[1]).replace(/\x1f/g, '::');
        decks[String(row[0])] = { name };
      }
    }
  } catch (e) {
    // Schema 18 tables don't exist, try legacy
    try {
      const colRows = db.exec('SELECT decks FROM col');
      if (colRows.length > 0 && colRows[0].values.length > 0) {
        const decksJson = JSON.parse(colRows[0].values[0][0]);
        for (const [id, deck] of Object.entries(decksJson)) {
          decks[id] = { name: deck.name };
        }
      }
    } catch (e2) {
      decks['1'] = { name: 'Default' };
    }
  }

  try {
    const ntRows = db.exec('SELECT id, name FROM notetypes');
    if (ntRows.length > 0) {
      for (const row of ntRows[0].values) {
        models[String(row[0])] = { name: String(row[1]), flds: [] };
      }
    }
    // Try to get fields
    try {
      const fieldRows = db.exec('SELECT ntid, name, ord FROM fields ORDER BY ntid, ord');
      if (fieldRows.length > 0) {
        for (const row of fieldRows[0].values) {
          const ntid = String(row[0]);
          if (models[ntid]) {
            models[ntid].flds.push({ name: String(row[1]), ord: row[2] });
          }
        }
      }
    } catch (e) { /* no fields table */ }
  } catch (e) {
    // Legacy Schema 11
    try {
      const colRows = db.exec('SELECT models FROM col');
      if (colRows.length > 0 && colRows[0].values.length > 0) {
        const modelsJson = JSON.parse(colRows[0].values[0][0]);
        for (const [id, model] of Object.entries(modelsJson)) {
          models[id] = {
            name: model.name,
            flds: (model.flds || []).map((f, i) => ({ name: f.name, ord: f.ord ?? i }))
          };
        }
      }
    } catch (e2) {
      // no models
    }
  }

  return { decks, models };
}

function getSchemaVersion(db) {
  try {
    const r = db.exec("SELECT val FROM config WHERE key='schema'");
    if (r.length > 0) return parseInt(r[0].values[0][0], 10);
  } catch (e) { /* not schema 18 */ }
  try {
    const r = db.exec('SELECT scm FROM col');
    if (r.length > 0) return 11;
  } catch (e) { /* unknown */ }
  return 0;
}

export async function parseApkg(fileBuffer, onProgress) {
  const sqlJs = await ensureSqlJs();
  
  if (onProgress) onProgress('Extracting ZIP archive...');
  
  const zipData = new Uint8Array(fileBuffer);
  const entries = unzipSync(zipData);
  
  // Determine the right DB file (CRITICAL priority order)
  let dbBytes = null;
  let dbSource = '';
  
  if (entries['collection.anki21b']) {
    if (onProgress) onProgress('Decompressing Zstd database (anki21b)...');
    const compressed = entries['collection.anki21b'];
    dbBytes = zstdDecompress(new Uint8Array(compressed));
    dbSource = 'collection.anki21b';
  } else if (entries['collection.anki21']) {
    dbBytes = entries['collection.anki21'];
    dbSource = 'collection.anki21';
  } else if (entries['collection.anki2']) {
    dbBytes = entries['collection.anki2'];
    dbSource = 'collection.anki2';
  } else {
    throw new Error('No valid Anki database found in archive. Expected collection.anki21b, collection.anki21, or collection.anki2');
  }

  if (onProgress) onProgress('Opening SQLite database...');
  
  const db = new sqlJs.Database(new Uint8Array(dbBytes.buffer || dbBytes));
  const schemaVersion = getSchemaVersion(db);
  
  if (onProgress) onProgress('Extracting notes and cards...');
  
  // Extract notes
  const notesResult = db.exec('SELECT id, mid, tags, flds, sfld FROM notes');
  const notes = [];
  if (notesResult.length > 0) {
    for (const row of notesResult[0].values) {
      notes.push({
        id: row[0],
        mid: String(row[1]),
        tags: String(row[2] || '').trim().split(/\s+/).filter(Boolean),
        flds: String(row[3]).split(String.fromCharCode(31)),
        sfld: String(row[4] || '')
      });
    }
  }

  // Extract cards
  const cardsResult = db.exec('SELECT id, nid, did, ord, queue, type, ivl FROM cards');
  const cards = [];
  if (cardsResult.length > 0) {
    for (const row of cardsResult[0].values) {
      cards.push({
        id: row[0],
        nid: row[1],
        did: String(row[2]),
        ord: row[3],
        queue: row[4],
        type: row[5],
        ivl: row[6]
      });
    }
  }

  // Extract decks and models
  const { decks, models } = extractDecksAndModels(db);
  
  if (onProgress) onProgress('Processing media files...');
  
  // Parse media manifest
  let mediaManifest = {};
  if (entries['media']) {
    mediaManifest = parseMediaManifest(entries['media']);
  }

  // Extract media files into blobs
  const mediaFiles = {};
  const mediaBlobs = {};
  let totalMediaSize = 0;
  
  for (const [numKey, fileName] of Object.entries(mediaManifest)) {
    if (entries[numKey]) {
      let fileData = entries[numKey];
      // Check if individual media file is Zstd compressed
      if (isZstdCompressed(fileData)) {
        fileData = zstdDecompress(new Uint8Array(fileData));
      }
      const uint8 = new Uint8Array(fileData.buffer || fileData);
      totalMediaSize += uint8.length;
      
      // Determine MIME type
      const ext = fileName.split('.').pop().toLowerCase();
      const mimeMap = {
        'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
        'gif': 'image/gif', 'svg': 'image/svg+xml', 'webp': 'image/webp',
        'bmp': 'image/bmp', 'ico': 'image/x-icon',
        'mp3': 'audio/mpeg', 'ogg': 'audio/ogg', 'wav': 'audio/wav',
        'flac': 'audio/flac', 'm4a': 'audio/mp4', 'aac': 'audio/aac',
        'mp4': 'video/mp4', 'webm': 'video/webm', 'mkv': 'video/x-matroska',
      };
      const mime = mimeMap[ext] || 'application/octet-stream';
      
      const blob = new Blob([uint8], { type: mime });
      const url = URL.createObjectURL(blob);
      
      mediaFiles[fileName] = { blob, url, size: uint8.length, mime, ext, numKey };
      mediaBlobs[fileName] = uint8;
    }
  }

  db.close();

  // Build enriched card list joining notes
  const noteMap = {};
  for (const note of notes) {
    noteMap[note.id] = note;
  }

  const enrichedCards = cards.map(card => {
    const note = noteMap[card.nid];
    if (!note) return null;
    const deckName = decks[card.did]?.name || 'Unknown Deck';
    const model = models[note.mid];
    const modelName = model?.name || 'Unknown Type';
    const fieldNames = model?.flds?.map(f => f.name) || [];
    
    return {
      ...card,
      deckName,
      modelName,
      tags: note.tags,
      fields: note.flds.map((val, i) => ({
        name: fieldNames[i] || `Field ${i + 1}`,
        value: val
      })),
      sfld: note.sfld,
      noteId: note.id,
      mid: note.mid
    };
  }).filter(Boolean);

  // Collect all unique tags
  const allTags = [...new Set(notes.flatMap(n => n.tags))].sort();
  
  // Collect all unique deck names
  const allDecks = [...new Set(Object.values(decks).map(d => d.name))].sort();

  const result = {
    dbSource,
    schemaVersion,
    totalNotes: notes.length,
    totalCards: cards.length,
    totalMedia: Object.keys(mediaFiles).length,
    totalMediaSize,
    cards: enrichedCards,
    notes,
    decks,
    models,
    mediaFiles,
    mediaBlobs,
    mediaManifest,
    allTags,
    allDecks,
    zipEntries: entries
  };

  if (onProgress) onProgress('Done!');
  return result;
}

export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function renderCloze(html, showAnswers = true) {
  if (!html) return '';
  // Match {{c1::answer::hint}} or {{c1::answer}}
  return html.replace(/\{\{c(\d+)::([^}]*?)(?:::([^}]*?))?\}\}/g, (match, num, answer, hint) => {
    if (showAnswers) {
      return `<span class="cloze-badge" data-cloze="${num}" title="${hint || ''}">${answer}</span>`;
    } else {
      return `<span class="cloze-badge-hidden" data-cloze="${num}" title="${hint || ''}">[${hint || '...'}]</span>`;
    }
  });
}

export function renderCardHtml(html, mediaFiles, showCloze = true) {
  if (!html) return '';
  
  let rendered = renderCloze(html, showCloze);
  
  // Replace <img src="filename"> with blob URLs
  rendered = rendered.replace(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi, (match, src) => {
    const media = mediaFiles[src];
    if (media) {
      return `<img src="${media.url}" alt="${src}" style="max-width:100%;height:auto;border-radius:8px;margin:4px 0" />`;
    }
    return match;
  });

  // Replace [sound:filename] with audio players
  rendered = rendered.replace(/\[sound:([^\]]+)\]/g, (match, filename) => {
    const media = mediaFiles[filename];
    if (media) {
      return `<span class="audio-mini-player"><audio controls preload="none" src="${media.url}"></audio> ${filename}</span>`;
    }
    return `<span class="text-gray-400 text-xs">[🔊 ${filename}]</span>`;
  });

  return rendered;
}

export function stripHtml(html) {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

export function clozePlainText(html) {
  if (!html) return '';
  let text = html.replace(/\{\{c(\d+)::([^}]*?)(?:::([^}]*?))?\}\}/g, (m, n, answer) => answer);
  return stripHtml(text);
}

export function clozeBlankText(html) {
  if (!html) return '';
  let text = html.replace(/\{\{c(\d+)::([^}]*?)(?:::([^}]*?))?\}\}/g, (m, n, answer, hint) => `[${hint || '___'}]`);
  return stripHtml(text);
}

export { ensureSqlJs, isZstdCompressed };
