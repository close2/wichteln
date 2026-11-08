// Native IndexedDB persistence for participant rounds/presets and constraint rules.

const DB_NAME = "wichteln_app_db";
const DB_VERSION = 4;
const STORE_PRESETS = "presets";

const DEFAULT_RULES = {
  giverGroupSize: 2,
  preventDuplicateCoGiverPairs: true,
  preventDirectReciprocity: false,
  sampleCount: 3
};

export const EXAMPLE_PARTICIPANTS_TEAM = [
  { email: "anna@example.org", name: "Anna", receiverGroups: ["Paar1"], coGiverGroups: [] },
  { email: "ben@example.org", name: "Ben", receiverGroups: ["Paar1"], coGiverGroups: [] },
  { email: "clara@example.org", name: "Clara", receiverGroups: [], coGiverGroups: ["WG1"] },
  { email: "david@example.org", name: "David", receiverGroups: ["Paar2"], coGiverGroups: ["WG1"] },
  { email: "elena@example.org", name: "Elena", receiverGroups: ["Paar2"], coGiverGroups: [] },
  { email: "felix@example.org", name: "Felix", receiverGroups: ["Paar3"], coGiverGroups: [] },
  { email: "greta@example.org", name: "Greta", receiverGroups: ["Paar3"], coGiverGroups: [] },
  { email: "hugo@example.org", name: "Hugo", receiverGroups: [], coGiverGroups: [] },
  { email: "iris@example.org", name: "Iris", receiverGroups: [], coGiverGroups: [] }
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
      { email: "alice@example.org", name: "Alice", receiverGroups: ["Paar1"], coGiverGroups: [] },
      { email: "bob@example.org", name: "Bob", receiverGroups: ["Paar1"], coGiverGroups: [] },
      { email: "carol@example.org", name: "Carol", receiverGroups: [], coGiverGroups: [] },
      { email: "dave@example.org", name: "Dave", receiverGroups: [], coGiverGroups: [] },
      { email: "eve@example.org", name: "Eve", receiverGroups: [], coGiverGroups: [] }
    ]
  }
];

export function normalizePreset(preset) {
  const participants = Array.isArray(preset.participants) ? preset.participants : [];
  participants.forEach((p) => {
    if (!Array.isArray(p.receiverGroups)) {
      p.receiverGroups = Array.isArray(p.groups) ? [...p.groups] : [];
    }
    if (!Array.isArray(p.coGiverGroups)) {
      p.coGiverGroups = [];
    }
    delete p.groups;
    delete p.excludes;
    delete p.excludeReceivers;
    delete p.excludeCoGivers;
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
      } else if (event.oldVersion < 4) {
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
