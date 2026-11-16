import initSqlJs from 'sql.js';
import { zipSync, strToU8 } from 'fflate';

function generateDiagramPNG(title, type, width = 600, height = 400) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  
  const configs = {
    heart: {
      colors: ['#fee2e2', '#fecaca'],
      mainColor: '#dc2626',
      accentColor: '#ef4444',
      shapes: 'heart'
    },
    brain: {
      colors: ['#ede9fe', '#ddd6fe'],
      mainColor: '#7c3aed',
      accentColor: '#8b5cf6',
      shapes: 'brain'
    },
    kidney: {
      colors: ['#fef3c7', '#fde68a'],
      mainColor: '#d97706',
      accentColor: '#f59e0b',
      shapes: 'kidney'
    },
    lung: {
      colors: ['#dbeafe', '#bfdbfe'],
      mainColor: '#2563eb',
      accentColor: '#3b82f6',
      shapes: 'lung'
    },
    cell: {
      colors: ['#d1fae5', '#a7f3d0'],
      mainColor: '#059669',
      accentColor: '#10b981',
      shapes: 'cell'
    },
    ecg: {
      colors: ['#fce7f3', '#fbcfe8'],
      mainColor: '#db2777',
      accentColor: '#ec4899',
      shapes: 'ecg'
    }
  };

  const config = configs[type] || configs.heart;
  gradient.addColorStop(0, config.colors[0]);
  gradient.addColorStop(1, config.colors[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Grid
  ctx.strokeStyle = 'rgba(0,0,0,0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 30) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let y = 0; y < height; y += 30) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }

  // Draw anatomical shape
  ctx.lineWidth = 3;
  ctx.strokeStyle = config.mainColor;
  ctx.fillStyle = config.accentColor + '40';

  if (type === 'heart') {
    ctx.beginPath();
    ctx.moveTo(300, 320);
    ctx.bezierCurveTo(300, 280, 200, 200, 200, 160);
    ctx.bezierCurveTo(200, 100, 260, 80, 300, 120);
    ctx.bezierCurveTo(340, 80, 400, 100, 400, 160);
    ctx.bezierCurveTo(400, 200, 300, 280, 300, 320);
    ctx.fill(); ctx.stroke();
    // Chambers
    ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(300, 120); ctx.lineTo(300, 320); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(220, 200); ctx.lineTo(380, 200); ctx.stroke();
    ctx.setLineDash([]);
    // Labels
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = config.mainColor;
    ctx.textAlign = 'center';
    ctx.fillText('LA', 260, 170);
    ctx.fillText('RA', 340, 170);
    ctx.fillText('LV', 260, 260);
    ctx.fillText('RV', 340, 260);
    // Vessels
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(260, 120); ctx.quadraticCurveTo(240, 70, 200, 60); ctx.stroke();
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath(); ctx.moveTo(340, 120); ctx.quadraticCurveTo(360, 70, 400, 60); ctx.stroke();
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('Pulmonary', 190, 55);
    ctx.fillStyle = '#ef4444';
    ctx.fillText('Aorta', 410, 55);
  } else if (type === 'brain') {
    ctx.beginPath();
    ctx.ellipse(300, 200, 150, 120, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(300, 80); ctx.lineTo(300, 320); ctx.stroke();
    // Lobes
    ctx.beginPath();
    ctx.moveTo(200, 160); ctx.quadraticCurveTo(250, 140, 300, 160); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(300, 160); ctx.quadraticCurveTo(350, 190, 300, 240); ctx.stroke();
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = config.mainColor;
    ctx.textAlign = 'center';
    ctx.fillText('Frontal', 230, 160);
    ctx.fillText('Parietal', 350, 160);
    ctx.fillText('Temporal', 230, 240);
    ctx.fillText('Occipital', 350, 240);
    ctx.fillText('Cerebellum', 300, 310);
  } else if (type === 'kidney') {
    ctx.beginPath();
    ctx.ellipse(300, 200, 80, 130, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(290, 200, 30, 50, 0, 0, Math.PI * 2);
    ctx.fillStyle = config.colors[0];
    ctx.fill(); ctx.stroke();
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = config.mainColor;
    ctx.textAlign = 'center';
    ctx.fillText('Cortex', 360, 150);
    ctx.fillText('Medulla', 360, 200);
    ctx.fillText('Pelvis', 290, 205);
    ctx.fillText('Ureter', 300, 340);
    ctx.strokeStyle = config.mainColor;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(300, 330); ctx.lineTo(300, 380); ctx.stroke();
  } else if (type === 'lung') {
    // Left lung
    ctx.beginPath();
    ctx.ellipse(220, 200, 80, 130, -0.1, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    // Right lung
    ctx.beginPath();
    ctx.ellipse(380, 200, 80, 130, 0.1, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    // Trachea
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(300, 50); ctx.lineTo(300, 120); ctx.stroke();
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(300, 120); ctx.quadraticCurveTo(260, 140, 230, 160); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(300, 120); ctx.quadraticCurveTo(340, 140, 370, 160); ctx.stroke();
    // Bronchi lines
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(230, 170 + i * 30); ctx.lineTo(200 - i * 5, 190 + i * 30);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(370, 170 + i * 30); ctx.lineTo(400 + i * 5, 190 + i * 30);
      ctx.stroke();
    }
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = config.mainColor;
    ctx.textAlign = 'center';
    ctx.fillText('Trachea', 300, 45);
    ctx.fillText('Left Lung', 220, 200);
    ctx.fillText('Right Lung', 380, 200);
  } else if (type === 'cell') {
    ctx.beginPath();
    ctx.ellipse(300, 200, 140, 110, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    // Nucleus
    ctx.beginPath();
    ctx.ellipse(280, 190, 50, 40, 0, 0, Math.PI * 2);
    ctx.fillStyle = config.mainColor + '50';
    ctx.fill(); ctx.stroke();
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = config.mainColor;
    ctx.textAlign = 'center';
    ctx.fillText('Nucleus', 280, 195);
    ctx.fillText('Mitochondria', 380, 170);
    ctx.fillText('ER', 370, 240);
    ctx.fillText('Golgi', 200, 260);
    // Organelles
    ctx.fillStyle = config.accentColor;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.ellipse(360 + Math.cos(i) * 20, 160 + Math.sin(i) * 15, 12, 6, i * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'ecg') {
    ctx.lineWidth = 3;
    ctx.strokeStyle = config.mainColor;
    ctx.beginPath();
    ctx.moveTo(50, 200);
    // P wave
    ctx.lineTo(100, 200);
    ctx.quadraticCurveTo(120, 170, 140, 200);
    // PR segment
    ctx.lineTo(170, 200);
    // QRS complex
    ctx.lineTo(180, 210);
    ctx.lineTo(190, 80);
    ctx.lineTo(200, 230);
    ctx.lineTo(210, 200);
    // ST segment
    ctx.lineTo(250, 200);
    // T wave
    ctx.quadraticCurveTo(280, 150, 310, 200);
    ctx.lineTo(350, 200);
    // Second beat
    ctx.lineTo(400, 200);
    ctx.quadraticCurveTo(420, 170, 440, 200);
    ctx.lineTo(470, 200);
    ctx.lineTo(480, 210);
    ctx.lineTo(490, 80);
    ctx.lineTo(500, 230);
    ctx.lineTo(510, 200);
    ctx.lineTo(550, 200);
    ctx.stroke();
    // Labels
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillStyle = config.mainColor;
    ctx.textAlign = 'center';
    ctx.fillText('P', 120, 162);
    ctx.fillText('Q', 180, 225);
    ctx.fillText('R', 190, 70);
    ctx.fillText('S', 200, 248);
    ctx.fillText('T', 280, 142);
    ctx.fillText('PR interval', 155, 280);
    ctx.fillText('QT interval', 250, 305);
    ctx.setLineDash([3,3]);
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(100, 270); ctx.lineTo(210, 270); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(170, 295); ctx.lineTo(310, 295); ctx.stroke();
    ctx.setLineDash([]);
  }

  // Title bar
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, height - 40, width, 40);
  ctx.font = 'bold 14px Inter, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, height - 15);

  return canvas;
}

function canvasToUint8Array(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      blob.arrayBuffer().then(buf => resolve(new Uint8Array(buf)));
    }, 'image/png');
  });
}

export const SAMPLE_DECK_METADATA = {
  dbSource: 'collection.anki21b',
  schema: 'ANKI21B (Zstd)',
  schemaBadge: 'ANKI21B (Zstd)',
  schemaName: 'Modern Anki Schema',
  version: 'Anki 24+ Zstandard'
};

export async function generateSampleDeck() {
  const SQL = await initSqlJs({
    locateFile: (file) => {
      try { return new URL(`/sql-wasm.wasm`, window.location.origin).href; } catch(e) {}
      return `https://cdn.jsdelivr.net/npm/sql.js@1.12.0/dist/${file}`;
    }
  });

  const db = new SQL.Database();
  
  // Create Anki schema (legacy Schema 11 for maximum compatibility)
  db.run(`CREATE TABLE col (
    id INTEGER PRIMARY KEY,
    crt INTEGER NOT NULL,
    mod INTEGER NOT NULL,
    scm INTEGER NOT NULL,
    ver INTEGER NOT NULL,
    dty INTEGER NOT NULL,
    usn INTEGER NOT NULL,
    ls INTEGER NOT NULL,
    conf TEXT NOT NULL,
    models TEXT NOT NULL,
    decks TEXT NOT NULL,
    dconf TEXT NOT NULL,
    tags TEXT NOT NULL
  )`);
  
  db.run(`CREATE TABLE notes (
    id INTEGER PRIMARY KEY,
    guid TEXT NOT NULL,
    mid INTEGER NOT NULL,
    mod INTEGER NOT NULL,
    usn INTEGER NOT NULL,
    tags TEXT NOT NULL,
    flds TEXT NOT NULL,
    sfld TEXT NOT NULL,
    csum INTEGER NOT NULL,
    flags INTEGER NOT NULL,
    data TEXT NOT NULL
  )`);
  
  db.run(`CREATE TABLE cards (
    id INTEGER PRIMARY KEY,
    nid INTEGER NOT NULL,
    did INTEGER NOT NULL,
    ord INTEGER NOT NULL,
    mod INTEGER NOT NULL,
    usn INTEGER NOT NULL,
    type INTEGER NOT NULL,
    queue INTEGER NOT NULL,
    due INTEGER NOT NULL,
    ivl INTEGER NOT NULL,
    factor INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    lapses INTEGER NOT NULL,
    left INTEGER NOT NULL,
    odue INTEGER NOT NULL,
    odid INTEGER NOT NULL,
    flags INTEGER NOT NULL,
    data TEXT NOT NULL
  )`);
  
  db.run(`CREATE TABLE revlog (
    id INTEGER PRIMARY KEY,
    cid INTEGER NOT NULL,
    usn INTEGER NOT NULL,
    ease INTEGER NOT NULL,
    ivl INTEGER NOT NULL,
    lastIvl INTEGER NOT NULL,
    factor INTEGER NOT NULL,
    time INTEGER NOT NULL,
    type INTEGER NOT NULL
  )`);
  
  db.run(`CREATE TABLE graves (usn INTEGER NOT NULL, oid INTEGER NOT NULL, type INTEGER NOT NULL)`);

  const now = Math.floor(Date.now() / 1000);
  const SEP = String.fromCharCode(31);
  
  // Define models (note types)
  const basicModelId = 1700000000000;
  const clozeModelId = 1700000000001;
  
  const models = {
    [basicModelId]: {
      id: basicModelId,
      name: "Basic (Medical)",
      type: 0,
      mod: now,
      usn: -1,
      sortf: 0,
      did: 1,
      tmpls: [{ name: "Card 1", qfmt: "{{Front}}", afmt: "{{FrontSide}}<hr id=answer>{{Back}}", ord: 0 }],
      flds: [
        { name: "Front", ord: 0, sticky: false, rtl: false, font: "Arial", size: 20, media: [] },
        { name: "Back", ord: 1, sticky: false, rtl: false, font: "Arial", size: 20, media: [] }
      ],
      css: ".card { font-family: arial; font-size: 20px; text-align: center; }",
      latexPre: "",
      latexPost: "",
      latexsvg: false,
      req: [[0, "any", [0]]]
    },
    [clozeModelId]: {
      id: clozeModelId,
      name: "Cloze (USMLE)",
      type: 1,
      mod: now,
      usn: -1,
      sortf: 0,
      did: 1,
      tmpls: [{ name: "Cloze", qfmt: "{{cloze:Text}}", afmt: "{{cloze:Text}}<br>{{Extra}}", ord: 0 }],
      flds: [
        { name: "Text", ord: 0, sticky: false, rtl: false, font: "Arial", size: 20, media: [] },
        { name: "Extra", ord: 1, sticky: false, rtl: false, font: "Arial", size: 20, media: [] }
      ],
      css: ".card { font-family: arial; font-size: 20px; text-align: center; } .cloze { font-weight: bold; color: blue; }",
      latexPre: "",
      latexPost: "",
      latexsvg: false,
      req: [[0, "any", [0]]]
    }
  };

  // Define decks
  const deckIds = {
    default: 1,
    usmle: 1700000001000,
    cardiology: 1700000001001,
    pharmacology: 1700000001002,
    neurology: 1700000001003,
    languages: 1700000002000,
    japanese: 1700000002001,
    spanish: 1700000002002
  };

  const decks = {};
  const deckConfigs = {
    [deckIds.default]: { name: "Default", id: deckIds.default },
    [deckIds.usmle]: { name: "USMLE", id: deckIds.usmle },
    [deckIds.cardiology]: { name: "USMLE::Cardiology", id: deckIds.cardiology },
    [deckIds.pharmacology]: { name: "USMLE::Pharmacology", id: deckIds.pharmacology },
    [deckIds.neurology]: { name: "USMLE::Neurology", id: deckIds.neurology },
    [deckIds.languages]: { name: "Languages", id: deckIds.languages },
    [deckIds.japanese]: { name: "Languages::Japanese", id: deckIds.japanese },
    [deckIds.spanish]: { name: "Languages::Spanish", id: deckIds.spanish }
  };

  for (const [id, cfg] of Object.entries(deckConfigs)) {
    decks[id] = {
      id: parseInt(id),
      name: cfg.name,
      mod: now,
      usn: -1,
      lrnToday: [0, 0],
      revToday: [0, 0],
      newToday: [0, 0],
      timeToday: [0, 0],
      collapsed: false,
      desc: "",
      dyn: 0,
      conf: 1,
      extendNew: 10,
      extendRev: 50
    };
  }

  const dconf = { "1": { id: 1, name: "Default", mod: 0, usn: 0, maxTaken: 60, autoplay: true, timer: 0, replayq: true, new: { delays: [1, 10], ints: [1, 4, 7], initialFactor: 2500, order: 1, perDay: 20 }, rev: { perDay: 200, ease4: 1.3, fuzz: 0.05, minSpace: 1, ivlFct: 1, maxIvl: 36500 }, lapse: { delays: [10], mult: 0, minInt: 1, leechFails: 8, leechAction: 0 } } };

  // Cards data - USMLE Cardiology (Cloze)
  const cardiologyCards = [
    { text: "The {{c1::mitral valve::anatomical structure}} is a {{c2::bicuspid}} valve located between the {{c3::left atrium}} and {{c4::left ventricle}}.", extra: "Also known as the bicuspid valve. <img src=\"heart_anatomy.png\">", tags: "cardiology anatomy valves" },
    { text: "{{c1::S1 heart sound}} is produced by closure of the {{c2::mitral and tricuspid (AV) valves}} at the beginning of {{c3::ventricular systole}}.", extra: "S1 = 'lub'. Best heard at the apex. <img src=\"ecg_waves.png\">", tags: "cardiology auscultation" },
    { text: "The {{c1::Frank-Starling mechanism}} states that the force of ventricular contraction is directly proportional to the {{c2::end-diastolic volume (preload)}}.", extra: "Increased preload → increased stroke volume (up to a point)", tags: "cardiology physiology" },
    { text: "{{c1::Troponin I}} is the most {{c2::specific}} cardiac biomarker for {{c3::acute myocardial infarction}}, rising within {{c4::3-4 hours}} of injury.", extra: "Remains elevated for 7-14 days", tags: "cardiology diagnosis MI" },
    { text: "In {{c1::atrial fibrillation}}, the ECG shows {{c2::irregularly irregular}} rhythm with absence of {{c3::P waves}} and {{c4::fibrillatory baseline}}.", extra: "Most common sustained cardiac arrhythmia <img src=\"ecg_waves.png\">", tags: "cardiology ECG arrhythmia" },
    { text: "{{c1::ACE inhibitors}} (e.g., {{c2::enalapril, lisinopril}}) reduce mortality in {{c3::heart failure}} by decreasing {{c4::afterload and preload}}.", extra: "Side effects: dry cough (bradykinin), hyperkalemia, angioedema", tags: "cardiology pharmacology HF" },
    { text: "{{c1::Aortic stenosis}} classically presents with the triad of {{c2::syncope}}, {{c3::angina}}, and {{c4::heart failure}}.", extra: "Crescendo-decrescendo systolic murmur, best heard at right upper sternal border", tags: "cardiology valvular" },
  ];

  // Pharmacology cards (Cloze)
  const pharmacologyCards = [
    { text: "{{c1::Warfarin}} inhibits {{c2::vitamin K epoxide reductase}}, preventing the synthesis of clotting factors {{c3::II, VII, IX, X}} and proteins {{c4::C and S}}.", extra: "Monitored by PT/INR. Antidote: Vitamin K, FFP", tags: "pharmacology anticoagulants" },
    { text: "{{c1::Metformin}} is the first-line treatment for {{c2::type 2 diabetes mellitus}}. It works by {{c3::decreasing hepatic glucose production}} and {{c4::increasing insulin sensitivity}}.", extra: "Does NOT cause hypoglycemia. Contraindicated in renal failure (lactic acidosis risk)", tags: "pharmacology endocrine diabetes" },
    { text: "{{c1::Beta-blockers}} ending in '-olol' (e.g., {{c2::metoprolol, atenolol}}) reduce heart rate and blood pressure by blocking {{c3::β1-adrenergic receptors}}.", extra: "Contraindicated in asthma (non-selective), decompensated HF, bradycardia", tags: "pharmacology cardiovascular" },
    { text: "The antidote for {{c1::acetaminophen (Tylenol)}} overdose is {{c2::N-acetylcysteine (NAC)}}, which replenishes {{c3::glutathione}} stores in the liver.", extra: "Rumack-Matthew nomogram guides treatment decisions", tags: "pharmacology toxicology" },
    { text: "{{c1::SSRIs}} (e.g., {{c2::fluoxetine, sertraline}}) are first-line treatment for {{c3::major depressive disorder}} and work by {{c4::blocking serotonin reuptake}} in the synapse.", extra: "Side effects: sexual dysfunction, serotonin syndrome, GI upset", tags: "pharmacology psychiatry" },
  ];

  // Neurology cards (Cloze)
  const neurologyCards = [
    { text: "{{c1::Broca's area}} (located in the {{c2::inferior frontal gyrus}}) is responsible for {{c3::speech production}}. Damage causes {{c4::non-fluent (expressive) aphasia}}.", extra: "<img src=\"brain_anatomy.png\"> Broca's = Broken speech (non-fluent)", tags: "neurology anatomy aphasia" },
    { text: "{{c1::Multiple sclerosis}} is characterized by {{c2::demyelination}} of CNS neurons, presenting with symptoms {{c3::separated in time and space}}.", extra: "MRI shows periventricular white matter lesions. CSF: oligoclonal bands", tags: "neurology autoimmune demyelination" },
    { text: "The {{c1::blood-brain barrier}} is formed by {{c2::tight junctions}} between {{c3::endothelial cells}} of brain capillaries, supported by {{c4::astrocyte foot processes}}.", extra: "Circumventricular organs (area postrema, OVLT) lack BBB", tags: "neurology anatomy physiology" },
    { text: "{{c1::Parkinson's disease}} results from loss of {{c2::dopaminergic neurons}} in the {{c3::substantia nigra pars compacta}}, leading to {{c4::resting tremor, rigidity, bradykinesia}}.", extra: "<img src=\"brain_anatomy.png\"> Treatment: Levodopa/Carbidopa", tags: "neurology movement-disorders" },
    { text: "{{c1::Status epilepticus}} is defined as continuous seizure activity lasting greater than {{c2::5 minutes}}. First-line treatment is {{c3::IV benzodiazepines}} (e.g., {{c4::lorazepam}}).", extra: "Medical emergency. If refractory: phenytoin/fosphenytoin, then propofol/midazolam", tags: "neurology seizures emergency" },
  ];

  // Language cards (Basic)
  const japaneseCards = [
    { front: "心臓 (しんぞう)", back: "<b>Heart</b><br>Organ that pumps blood through the circulatory system<br><i>Example: 心臓が速く打っている (My heart is beating fast)</i>", tags: "japanese medical-vocab" },
    { front: "こんにちは", back: "<b>Hello / Good afternoon</b><br>The most common Japanese greeting<br><i>Pronunciation: kon-ni-chi-wa</i>", tags: "japanese greetings" },
    { front: "ありがとうございます", back: "<b>Thank you very much</b><br>Polite form of gratitude<br><i>Casual: ありがとう (arigatou)</i>", tags: "japanese greetings" },
    { front: "薬 (くすり)", back: "<b>Medicine / Drug</b><br><i>Example: 薬を飲んでください (Please take your medicine)</i>", tags: "japanese medical-vocab" },
    { front: "病院 (びょういん)", back: "<b>Hospital</b><br><i>Example: 病院に行きます (I'm going to the hospital)</i>", tags: "japanese medical-vocab" },
  ];

  const spanishCards = [
    { front: "¿Dónde le duele?", back: "<b>Where does it hurt?</b><br>Essential medical Spanish phrase<br><i>Response: Me duele aquí (It hurts here)</i>", tags: "spanish medical" },
    { front: "Buenos días", back: "<b>Good morning</b><br>Formal greeting used until noon<br><i>Also: Buenas tardes (afternoon), Buenas noches (evening)</i>", tags: "spanish greetings" },
    { front: "La presión arterial", back: "<b>Blood pressure</b><br><i>Example: Su presión arterial es normal (Your blood pressure is normal)</i>", tags: "spanish medical-vocab" },
    { front: "El corazón", back: "<b>The heart</b><br><img src=\"heart_anatomy.png\"><br><i>Tiene un corazón fuerte (You have a strong heart)</i>", tags: "spanish medical-vocab anatomy" },
    { front: "Tomar el pulso", back: "<b>To take the pulse</b><br><i>Voy a tomar su pulso (I'm going to take your pulse)</i>", tags: "spanish medical-vocab" },
    { front: "La receta médica", back: "<b>The prescription</b><br><i>Necesita una receta (You need a prescription)</i>", tags: "spanish medical-vocab" },
    { front: "¿Es usted alérgico a algún medicamento?", back: "<b>Are you allergic to any medication?</b><br>Critical intake question<br><i>Soy alérgico a la penicilina (I'm allergic to penicillin)</i>", tags: "spanish medical intake" },
    { front: "Los pulmones", back: "<b>The lungs</b><br><img src=\"lung_diagram.png\"><br><i>Respire profundamente (Breathe deeply)</i>", tags: "spanish medical-vocab anatomy" },
  ];

  // Generate diagrams
  const diagrams = [
    { filename: 'heart_anatomy.png', title: 'Heart Anatomy - Chambers & Great Vessels', type: 'heart' },
    { filename: 'brain_anatomy.png', title: 'Brain Anatomy - Lobes & Regions', type: 'brain' },
    { filename: 'kidney_diagram.png', title: 'Kidney Cross-Section', type: 'kidney' },
    { filename: 'lung_diagram.png', title: 'Pulmonary System', type: 'lung' },
    { filename: 'cell_diagram.png', title: 'Eukaryotic Cell Structure', type: 'cell' },
    { filename: 'ecg_waves.png', title: 'ECG Waveform Components', type: 'ecg' },
  ];

  const mediaEntries = {};
  const mediaManifest = {};

  for (let i = 0; i < diagrams.length; i++) {
    const canvas = generateDiagramPNG(diagrams[i].title, diagrams[i].type);
    const pngData = await canvasToUint8Array(canvas);
    mediaEntries[String(i)] = pngData;
    mediaManifest[String(i)] = diagrams[i].filename;
  }

  // Insert notes and cards
  let noteId = 1700000010000;
  let cardId = 1700000020000;
  const insertNote = db.prepare("INSERT INTO notes VALUES (?,?,?,?,?,?,?,?,?,?,?)");
  const insertCard = db.prepare("INSERT INTO cards VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");

  function addClozeNote(data, deckId) {
    const nid = noteId++;
    const guid = `g${nid}`;
    const flds = data.text + SEP + data.extra;
    insertNote.run([nid, guid, clozeModelId, now, -1, ` ${data.tags} `, flds, data.text.substring(0, 50), 0, 0, '']);
    
    // Count cloze deletions
    const clozeNums = new Set();
    const regex = /\{\{c(\d+)::/g;
    let match;
    while ((match = regex.exec(data.text)) !== null) {
      clozeNums.add(parseInt(match[1]));
    }
    
    for (const ord of clozeNums) {
      const cid = cardId++;
      insertCard.run([cid, nid, deckId, ord - 1, now, -1, 0, 0, noteId, 0, 2500, 0, 0, 0, 0, 0, 0, '']);
    }
  }

  function addBasicNote(data, deckId) {
    const nid = noteId++;
    const guid = `g${nid}`;
    const flds = data.front + SEP + data.back;
    insertNote.run([nid, guid, basicModelId, now, -1, ` ${data.tags} `, flds, data.front, 0, 0, '']);
    const cid = cardId++;
    insertCard.run([cid, nid, deckId, 0, now, -1, 0, 0, noteId, 0, 2500, 0, 0, 0, 0, 0, 0, '']);
  }

  // Add all cards
  cardiologyCards.forEach(c => addClozeNote(c, deckIds.cardiology));
  pharmacologyCards.forEach(c => addClozeNote(c, deckIds.pharmacology));
  neurologyCards.forEach(c => addClozeNote(c, deckIds.neurology));
  japaneseCards.forEach(c => addBasicNote(c, deckIds.japanese));
  spanishCards.forEach(c => addBasicNote(c, deckIds.spanish));

  insertNote.free();
  insertCard.free();

  // Insert collection config
  db.run(`INSERT INTO col VALUES (1, ?, ?, ?, 11, 0, 0, 0, '{}', ?, ?, ?, '{}')`, [
    now, now, now,
    JSON.stringify(models),
    JSON.stringify(decks),
    JSON.stringify(dconf)
  ]);

  // Export database
  const dbExport = db.export();
  db.close();

  // Build ZIP
  const zipEntries = {
    'collection.anki2': new Uint8Array(dbExport),
    'media': strToU8(JSON.stringify(mediaManifest)),
    ...mediaEntries
  };

  const zipped = zipSync(zipEntries, { level: 6 });
  return new Blob([zipped], { type: 'application/octet-stream' });
}
