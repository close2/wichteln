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
  });

  // Migrate any legacy group-tag exclusions into direct participant IDs
  for (let i = 0; i < participants.length; i++) {
    const pi = participants[i];
    const recTags = [
      ...(Array.isArray(pi.groups) ? pi.groups : []),
      ...(Array.isArray(pi.receiverGroups) ? pi.receiverGroups : [])
    ];
    const cogTags = Array.isArray(pi.coGiverGroups) ? pi.coGiverGroups : [];

    for (let j = 0; j < participants.length; j++) {
      if (i === j) continue;
      const pj = participants[j];
      const pjRecTags = [
        ...(Array.isArray(pj.groups) ? pj.groups : []),
        ...(Array.isArray(pj.receiverGroups) ? pj.receiverGroups : [])
      ];
      const pjCogTags = Array.isArray(pj.coGiverGroups) ? pj.coGiverGroups : [];

      if (recTags.some((t) => pjRecTags.includes(t)) && !pi.excludeReceivers.includes(pj.id)) {
        pi.excludeReceivers.push(pj.id);
      }
      if (cogTags.some((t) => pjCogTags.includes(t)) && !pi.excludeCoGivers.includes(pj.id)) {
        pi.excludeCoGivers.push(pj.id);
      }
    }
  }

  for (const p of participants) {
    delete p.excludes;
    delete p.groups;
    delete p.receiverGroups;
    delete p.coGiverGroups;
  }
  return preset;
}

function openDb() {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error("IndexedDB open timed out"));
      }
    }, 1000);

    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (event) => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_PRESETS)) {
          db.createObjectStore(STORE_PRESETS, { keyPath: "id" });
        } else if (event.oldVersion < 5) {
          req.transaction.objectStore(STORE_PRESETS).clear();
        }
      };
      req.onblocked = () => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          reject(new Error("IndexedDB upgrade blocked by another connection"));
        }
      };
      req.onsuccess = () => {
        const db = req.result;
        db.onversionchange = () => {
          db.close();
        };
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(db);
        } else {
          db.close();
        }
      };
      req.onerror = () => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          reject(req.error);
        }
      };
    } catch (err) {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(err);
      }
    }
  });
}

function sortPresets(presets) {
  const order = new Map(SEED_PRESETS.map((p, idx) => [p.id, idx]));
  return [...presets].sort((a, b) => {
    const oa = order.has(a.id) ? order.get(a.id) : 100;
    const ob = order.has(b.id) ? order.get(b.id) : 100;
    if (oa !== ob) return oa - ob;
    return String(a.id).localeCompare(String(b.id));
  });
}

export async function loadAllPresets() {
  let db = null;
  try {
    db = await openDb();
    const existing = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PRESETS, "readonly");
      const req = tx.objectStore(STORE_PRESETS).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    if (existing.length > 0) {
      return sortPresets(existing.map(normalizePreset));
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
    return structuredClone(SEED_PRESETS).map(normalizePreset);
  } catch {
    return structuredClone(SEED_PRESETS).map(normalizePreset);
  } finally {
    if (db) db.close();
  }
}

export async function savePreset(preset) {
  let db = null;
  try {
    db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PRESETS, "readwrite");
      tx.objectStore(STORE_PRESETS).put(preset);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore storage errors in fallback/private mode
  } finally {
    if (db) db.close();
  }
}

export async function deletePresetById(id) {
  let db = null;
  try {
    db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PRESETS, "readwrite");
      tx.objectStore(STORE_PRESETS).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore storage errors in fallback/private mode
  } finally {
    if (db) db.close();
  }
}
