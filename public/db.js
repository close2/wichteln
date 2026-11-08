// Native IndexedDB persistence for participant rounds/presets and constraint rules.

const DB_NAME = "wichteln_app_db";
const DB_VERSION = 5;
const STORE_PRESETS = "presets";

const DEFAULT_RULES = {
  giverGroupSize: 2,
  preventDuplicateCoGiverPairs: true,
  preventDirectReciprocity: false,
  sampleCount: 3
};

export const EXAMPLE_PARTICIPANTS_TEAM = [
  { id: "p-anna", email: "anna@example.org", name: "Anna", excludeReceivers: ["p-ben"], excludeCoGivers: [] },
  { id: "p-ben", email: "ben@example.org", name: "Ben", excludeReceivers: ["p-anna"], excludeCoGivers: [] },
  { id: "p-clara", email: "clara@example.org", name: "Clara", excludeReceivers: [], excludeCoGivers: ["p-david"] },
  { id: "p-david", email: "david@example.org", name: "David", excludeReceivers: ["p-elena"], excludeCoGivers: ["p-clara"] },
  { id: "p-elena", email: "elena@example.org", name: "Elena", excludeReceivers: ["p-david"], excludeCoGivers: [] },
  { id: "p-felix", email: "felix@example.org", name: "Felix", excludeReceivers: ["p-greta"], excludeCoGivers: [] },
  { id: "p-greta", email: "greta@example.org", name: "Greta", excludeReceivers: ["p-felix"], excludeCoGivers: [] },
  { id: "p-hugo", email: "hugo@example.org", name: "Hugo", excludeReceivers: [], excludeCoGivers: [] },
  { id: "p-iris", email: "iris@example.org", name: "Iris", excludeReceivers: [], excludeCoGivers: [] }
];

export const SEED_PRESETS = [
  {
    id: "preset-friends-couples",
    name: "Engerl-Bengerl (Beispiel mit 9 Personen)",
    rules: { ...DEFAULT_RULES, giverGroupSize: 2 },
    participants: structuredClone(EXAMPLE_PARTICIPANTS_TEAM)
  },
  {
    id: "preset-classic-wichteln",
    name: "Klassisches Wichteln (Beispiel mit 5 Personen)",
    rules: { ...DEFAULT_RULES, giverGroupSize: 1 },
    participants: [
      { id: "cw-1", email: "alice@example.org", name: "Alice", excludeReceivers: ["cw-2"], excludeCoGivers: [] },
      { id: "cw-2", email: "bob@example.org", name: "Bob", excludeReceivers: ["cw-1"], excludeCoGivers: [] },
      { id: "cw-3", email: "carol@example.org", name: "Carol", excludeReceivers: [], excludeCoGivers: [] },
      { id: "cw-4", email: "dave@example.org", name: "Dave", excludeReceivers: [], excludeCoGivers: [] },
      { id: "cw-5", email: "eve@example.org", name: "Eve", excludeReceivers: [], excludeCoGivers: [] }
    ]
  }
];

export function normalizePreset(preset) {
  const participants = Array.isArray(preset.participants) ? preset.participants : [];
  participants.forEach((p, idx) => {
    if (!p.id) {
      p.id = `p-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`;
    }
    if (!Array.isArray(p.excludeReceivers)) {
      p.excludeReceivers = Array.isArray(p.excludes) ? [...p.excludes] : [];
    }
    if (!Array.isArray(p.excludeCoGivers)) {
      p.excludeCoGivers = [];
    }
    delete p.excludes;
    delete p.groups;
    delete p.receiverGroups;
    delete p.coGiverGroups;
  });
  return preset;
}

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (event) => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_PRESETS)) {
        db.createObjectStore(STORE_PRESETS, { keyPath: "id" });
      } else if (event.oldVersion < 5) {
        req.transaction.objectStore(STORE_PRESETS).clear();
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
