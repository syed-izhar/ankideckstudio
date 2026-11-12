import { zipSync, strToU8 } from 'fflate';

function loadImage(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

function compressImage(img, quality = 0.8, maxDim = 0) {
  return new Promise((resolve) => {
    let w = img.naturalWidth;
    let h = img.naturalHeight;

    if (maxDim > 0 && (w > maxDim || h > maxDim)) {
      const ratio = Math.min(maxDim / w, maxDim / h);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
    }

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);

    canvas.toBlob((blob) => {
      if (blob) {
        blob.arrayBuffer().then(buf => {
          resolve({ data: new Uint8Array(buf), size: buf.byteLength });
        });
      } else {
        // Fallback: return original
        resolve(null);
      }
    }, 'image/webp', quality);
  });
}

export async function analyzeCompression(mediaFiles, quality = 0.8, maxDim = 0, onProgress) {
  const imageExtensions = ['png', 'jpg', 'jpeg', 'bmp'];
  const results = [];
  
  const imageEntries = Object.entries(mediaFiles).filter(([name, info]) =>
    imageExtensions.includes(info.ext)
  );

  let processed = 0;
  for (const [name, info] of imageEntries) {
    try {
      const img = await loadImage(info.blob);
      const compressed = await compressImage(img, quality, maxDim);
      URL.revokeObjectURL(img.src);

      const newName = name.replace(/\.(png|jpg|jpeg|bmp)$/i, '.webp');
      results.push({
        originalName: name,
        newName,
        originalSize: info.size,
        compressedSize: compressed ? compressed.size : info.size,
        savings: compressed ? info.size - compressed.size : 0,
        savingsPercent: compressed ? ((info.size - compressed.size) / info.size * 100) : 0,
        compressedData: compressed ? compressed.data : null,
        width: img.naturalWidth,
        height: img.naturalHeight,
        numKey: info.numKey
      });
    } catch (e) {
      results.push({
        originalName: name,
        newName: name,
        originalSize: info.size,
        compressedSize: info.size,
        savings: 0,
        savingsPercent: 0,
        compressedData: null,
        error: e.message,
        numKey: info.numKey
      });
    }
    processed++;
    if (onProgress) onProgress(processed, imageEntries.length);
  }

  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalCompressed = results.reduce((sum, r) => sum + r.compressedSize, 0);
  
  return {
    items: results,
    totalOriginal,
    totalCompressed,
    totalSavings: totalOriginal - totalCompressed,
    totalSavingsPercent: totalOriginal > 0 ? ((totalOriginal - totalCompressed) / totalOriginal * 100) : 0,
    imageCount: imageEntries.length
  };
}

export async function repackApkg(originalData, compressionResults, mediaManifest, mediaBlobs, onProgress) {
  if (onProgress) onProgress('Preparing compressed APKG...');
  
  const zipData = new Uint8Array(originalData);
  const { unzipSync } = await import('fflate');
  const entries = unzipSync(zipData);
  
  // Build new ZIP entries
  const newEntries = {};
  
  // Find and update the database
  let dbKey = null;
  let dbBytes = null;
  
  if (entries['collection.anki21b']) {
    // For anki21b we can't easily re-compress to zstd, so we convert to anki21
    const { decompress } = await import('fzstd');
    dbBytes = decompress(new Uint8Array(entries['collection.anki21b']));
    dbKey = 'collection.anki21';
  } else if (entries['collection.anki21']) {
    dbBytes = entries['collection.anki21'];
    dbKey = 'collection.anki21';
  } else if (entries['collection.anki2']) {
    dbBytes = entries['collection.anki2'];
    dbKey = 'collection.anki2';
  }

  if (dbBytes) {
    // Open DB and update field references
    const { default: initSqlJs } = await import('sql.js');
    const SQL = await initSqlJs({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/sql.js@1.12.0/dist/${file}`
    });
    const db = new SQL.Database(new Uint8Array(dbBytes.buffer || dbBytes));
    
    // Update image references in notes: .png/.jpg/.jpeg/.bmp -> .webp
    for (const result of compressionResults.items) {
      if (result.compressedData && result.originalName !== result.newName) {
        try {
          db.run("UPDATE notes SET flds = REPLACE(flds, ?, ?)", [result.originalName, result.newName]);
        } catch (e) { /* ignore */ }
      }
    }
    
    const exportedDb = db.export();
    db.close();
    newEntries[dbKey] = new Uint8Array(exportedDb);
  }

  // Update media manifest
  const newManifest = { ...mediaManifest };
  const compressionMap = {};
  for (const result of compressionResults.items) {
    if (result.compressedData && result.originalName !== result.newName) {
      compressionMap[result.originalName] = result;
    }
  }

  for (const [numKey, fileName] of Object.entries(newManifest)) {
    if (compressionMap[fileName]) {
      newManifest[numKey] = compressionMap[fileName].newName;
    }
  }
  
  newEntries['media'] = strToU8(JSON.stringify(newManifest));

  // Add media files
  for (const [numKey, fileName] of Object.entries(mediaManifest)) {
    if (compressionMap[fileName] && compressionMap[fileName].compressedData) {
      newEntries[numKey] = compressionMap[fileName].compressedData;
    } else if (entries[numKey]) {
      newEntries[numKey] = entries[numKey];
    }
  }

  if (onProgress) onProgress('Creating ZIP archive...');
  
  const zipped = zipSync(newEntries, { level: 0 });
  return new Blob([zipped], { type: 'application/octet-stream' });
}
