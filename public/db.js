// Local browser persistence (IndexedDB + sessionStorage) for saved rounds.
// Always starts fresh with an empty participant list in a new session.

const DB_NAME = "wichteln_app_db";
const DB_VERSION = 6;
const STORE_PRESETS = "presets";
const LEGACY_SEED_IDS = new Set(["preset-friends-couples", "preset-classic-wichteln"]);

export const DEFAULT_RULES = {
  giverGroupSize: 1,
  preventDuplicateCoGiverPairs: true,
  preventDirectReciprocity: true,
  sampleCount: 3,
  enableRecovery: true
};

export const EXAMPLE_PARTICIPANTS_CLASSIC = [
  { id: "cw-1", email: "anna@example.org", name: "Anna", excludeReceivers: ["cw-2"], excludeCoGivers: [] },
  { id: "cw-2", email: "ben@example.org", name: "Ben", excludeReceivers: ["cw-1"], excludeCoGivers: [] },
  { id: "cw-3", email: "clara@example.org", name: "Clara", excludeReceivers: [], excludeCoGivers: [] },
  { id: "cw-4", email: "david@example.org", name: "David", excludeReceivers: [], excludeCoGivers: [] },
  { id: "cw-5", email: "elena@example.org", name: "Elena", excludeReceivers: [], excludeCoGivers: [] }
];

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

export function createEmptyDraft() {
  return {
    id: "",
    name: "",
    lastRecoverySeed: "",
    rules: { ...DEFAULT_RULES },
    participants: []
  };
}

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

  const rawRules = preset.rules || {};
  preset.rules = {
    giverGroupSize: Math.max(1, Math.min(5, Number.parseInt(rawRules.giverGroupSize, 10) || 1)),
    preventDuplicateCoGiverPairs: rawRules.preventDuplicateCoGiverPairs !== false,
    preventDirectReciprocity: Boolean(rawRules.preventDirectReciprocity),
    sampleCount: Math.max(1, Math.min(10, Number.parseInt(rawRules.sampleCount, 10) || 3)),
    enableRecovery: rawRules.enableRecovery !== false
  };
  preset.lastRecoverySeed = typeof preset.lastRecoverySeed === "string" ? preset.lastRecoverySeed : "";
  preset.participants = participants;
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
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_PRESETS)) {
          db.createObjectStore(STORE_PRESETS, { keyPath: "id" });
        } else {
          const store = req.transaction.objectStore(STORE_PRESETS);
          for (const legacyId of LEGACY_SEED_IDS) {
            store.delete(legacyId);
          }
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

    return existing
      .filter((p) => p && p.id && !LEGACY_SEED_IDS.has(p.id))
      .map(normalizePreset)
      .sort((a, b) => String(a.name || a.id).localeCompare(String(b.name || b.id)));
  } catch {
    return [];
  } finally {
    if (db) db.close();
  }
}

export async function savePreset(preset) {
  if (!preset || !preset.id) return;
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
    // Ignore storage errors in private/restricted mode
  } finally {
    if (db) db.close();
  }
}

export async function deletePresetById(id) {
  if (!id) return;
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
    // Ignore storage errors in private/restricted mode
  } finally {
    if (db) db.close();
  }
}
