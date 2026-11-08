// Native IndexedDB persistence for participant groups/presets and constraint rules.
// Pre-seeded with the historical groups from wichteln.toit and engerlbengerl.

const DB_NAME = "wichteln_app_db";
const DB_VERSION = 1;
const STORE_PRESETS = "presets";

const DEFAULT_RULES = {
  giverGroupSize: 2,
  preventSameGroupGiverReceiver: true,
  preventSameGroupCoGivers: true,
  preventDuplicateCoGiverPairs: true,
  preventDirectReciprocity: true,
  sampleCount: 3
};

export const SEED_PRESETS = [
  {
    id: "preset-friends-couples",
    name: "Engerl-Bengerl (Beispiel mit Paaren)",
    rules: { ...DEFAULT_RULES, giverGroupSize: 2 },
    participants: [
      { id: "p-anna", email: "anna@example.org", name: "Anna", excludes: ["p-ben"] },
      { id: "p-ben", email: "ben@example.org", name: "Ben", excludes: ["p-anna"] },
      { id: "p-clara", email: "clara@example.org", name: "Clara", excludes: [] },
      { id: "p-david", email: "david@example.org", name: "David", excludes: ["p-elena"] },
      { id: "p-elena", email: "elena@example.org", name: "Elena", excludes: ["p-david"] },
      { id: "p-felix", email: "felix@example.org", name: "Felix", excludes: ["p-greta"] },
      { id: "p-greta", email: "greta@example.org", name: "Greta", excludes: ["p-felix"] },
      { id: "p-hugo", email: "hugo@example.org", name: "Hugo", excludes: [] },
      { id: "p-iris", email: "iris@example.org", name: "Iris", excludes: [] }
    ]
  },
  {
    id: "preset-classic-wichteln",
    name: "Klassisches Wichteln (1:1)",
    rules: { ...DEFAULT_RULES, giverGroupSize: 1 },
    participants: [
      { id: "cw-1", email: "alice@example.org", name: "Alice", excludes: ["cw-2"] },
      { id: "cw-2", email: "bob@example.org", name: "Bob", excludes: ["cw-1"] },
      { id: "cw-3", email: "carol@example.org", name: "Carol", excludes: [] },
      { id: "cw-4", email: "dave@example.org", name: "Dave", excludes: [] },
      { id: "cw-5", email: "eve@example.org", name: "Eve", excludes: [] }
    ]
  }
];

export function normalizePreset(preset) {
  const participants = Array.isArray(preset.participants) ? preset.participants : [];
  participants.forEach((p, idx) => {
    if (!p.id) {
      p.id = `p-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`;
    }
    if (!Array.isArray(p.excludes)) {
      p.excludes = [];
    }
  });

  // Migrate any legacy symmetric `groups` tags into `excludes` references
  for (let i = 0; i < participants.length; i++) {
    const pi = participants[i];
    if (Array.isArray(pi.groups) && pi.groups.length > 0) {
      for (let j = 0; j < participants.length; j++) {
        if (i === j) continue;
        const pj = participants[j];
        if (Array.isArray(pj.groups) && pi.groups.some((g) => pj.groups.includes(g))) {
          if (!pi.excludes.includes(pj.id)) pi.excludes.push(pj.id);
          if (!pj.excludes.includes(pi.id)) pj.excludes.push(pi.id);
        }
      }
    }
    delete pi.groups;
  }

  return preset;
}

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_PRESETS)) {
        db.createObjectStore(STORE_PRESETS, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadAllPresets() {
  const db = await openDb();
  const existing = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PRESETS, "readonly");
    const req = tx.objectStore(STORE_PRESETS).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });

  if (existing.length > 0) {
    return existing.map(normalizePreset);
  }

  // Seed initial presets on first visit
  const tx = db.transaction(STORE_PRESETS, "readwrite");
  const store = tx.objectStore(STORE_PRESETS);
  for (const preset of SEED_PRESETS) {
    store.put(preset);
  }
  await new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  return structuredClone(SEED_PRESETS);
}

export async function savePreset(preset) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PRESETS, "readwrite");
    tx.objectStore(STORE_PRESETS).put(preset);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deletePresetById(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PRESETS, "readwrite");
    tx.objectStore(STORE_PRESETS).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
