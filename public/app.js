import { translate, translateError } from "./i18n.js";
import {
  loadAllPresets,
  savePreset,
  deletePresetById,
  normalizePreset,
  EXAMPLE_PARTICIPANTS_TEAM
} from "./db.js";

const state = {
  lang: localStorage.getItem("wichteln_lang") || "de",
  languages: [
    { code: "de", label: "Deutsch" },
    { code: "en", label: "English" }
  ],
  presets: [],
  activePresetId: localStorage.getItem("wichteln_active_preset") || "",
  samples: [],
  dryRunMeta: null,
  activeSampleIdx: 0
};

const els = {
  langSelect: document.getElementById("langSelect"),
  presetSelect: document.getElementById("presetSelect"),
  presetNameInput: document.getElementById("presetNameInput"),
  newPresetBtn: document.getElementById("newPresetBtn"),
  duplicatePresetBtn: document.getElementById("duplicatePresetBtn"),
  exportJsonBtn: document.getElementById("exportJsonBtn"),
  importJsonInput: document.getElementById("importJsonInput"),
  deletePresetBtn: document.getElementById("deletePresetBtn"),
  participantCountBadge: document.getElementById("participantCountBadge"),
  loadExampleBtn: document.getElementById("loadExampleBtn"),
  clearParticipantsBtn: document.getElementById("clearParticipantsBtn"),
  toggleBulkBtn: document.getElementById("toggleBulkBtn"),
  bulkAddDrawer: document.getElementById("bulkAddDrawer"),
  bulkAddTextarea: document.getElementById("bulkAddTextarea"),
  applyBulkBtn: document.getElementById("applyBulkBtn"),
  cancelBulkBtn: document.getElementById("cancelBulkBtn"),
  addParticipantBtn: document.getElementById("addParticipantBtn"),
  participantsTbody: document.getElementById("participantsTbody"),
  giverGroupSizeInput: document.getElementById("giverGroupSizeInput"),
  sampleCountInput: document.getElementById("sampleCountInput"),
  ruleDuplicateCoGivers: document.getElementById("ruleDuplicateCoGivers"),
  ruleDirectReciprocity: document.getElementById("ruleDirectReciprocity"),
  statusBanner: document.getElementById("statusBanner"),
  runDryRunBtn: document.getElementById("runDryRunBtn"),
  dryRunResults: document.getElementById("dryRunResults"),
  passcodeInput: document.getElementById("passcodeInput"),
  sendRealEmailsBtn: document.getElementById("sendRealEmailsBtn")
};

function t(key, vars) {
  return translate(state.lang, key, vars);
}

function getActivePreset() {
  return state.presets.find((p) => p.id === state.activePresetId) || state.presets[0];
}

function showStatus(type, message) {
  els.statusBanner.hidden = false;
  els.statusBanner.className = `status-banner ${type}`;
  els.statusBanner.textContent = message;
}

function clearStatus() {
  els.statusBanner.hidden = true;
  els.statusBanner.textContent = "";
}

function applyTranslations() {
  document.documentElement.lang = state.lang;
  for (const node of document.querySelectorAll("[data-i18n]")) {
    const key = node.getAttribute("data-i18n");
    node.textContent = t(key);
  }
  for (const node of document.querySelectorAll("[data-i18n-title]")) {
    const key = node.getAttribute("data-i18n-title");
    node.title = t(key);
  }
  renderActivePreset();
  renderDryRunResults();
}

function renderLanguageSelect() {
  els.langSelect.replaceChildren();
  for (const lang of state.languages) {
    const opt = document.createElement("option");
    opt.value = lang.code;
    opt.textContent = `${lang.label} (${lang.code.toUpperCase()})`;
    if (lang.code === state.lang) opt.selected = true;
    els.langSelect.appendChild(opt);
  }
}

function renderPresetSelect() {
  els.presetSelect.replaceChildren();
  for (const preset of state.presets) {
    const opt = document.createElement("option");
    opt.value = preset.id;
    opt.textContent = `${preset.name} (${preset.participants.length})`;
    if (preset.id === state.activePresetId) opt.selected = true;
    els.presetSelect.appendChild(opt);
  }
  els.deletePresetBtn.disabled = state.presets.length <= 1;
}

function parseCommaGroups(value) {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function renderActivePreset() {
  const preset = getActivePreset();
  if (!preset) return;

  els.presetNameInput.value = preset.name;
  els.participantCountBadge.textContent = String(preset.participants.length);

  els.giverGroupSizeInput.value = String(preset.rules.giverGroupSize ?? 2);
  els.sampleCountInput.value = String(preset.rules.sampleCount ?? 3);
  els.ruleDuplicateCoGivers.checked = preset.rules.preventDuplicateCoGiverPairs !== false;
  els.ruleDirectReciprocity.checked = preset.rules.preventDirectReciprocity === true;

  els.participantsTbody.replaceChildren();
  preset.participants.forEach((participant, idx) => {
    if (!Array.isArray(participant.receiverGroups)) participant.receiverGroups = [];
    if (!Array.isArray(participant.coGiverGroups)) participant.coGiverGroups = [];

    const tr = document.createElement("tr");

    // Column 1: Email
    const tdEmail = document.createElement("td");
    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.placeholder = "name@example.org";
    emailInput.value = participant.email || "";
    emailInput.addEventListener("change", async () => {
      participant.email = emailInput.value.trim();
      await persistActivePreset();
    });
    tdEmail.appendChild(emailInput);

    // Column 2: Optional Name
    const tdName = document.createElement("td");
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Optional";
    nameInput.maxLength = 40;
    nameInput.value = participant.name || "";
    nameInput.addEventListener("change", async () => {
      participant.name = nameInput.value.trim();
      await persistActivePreset();
    });
    tdName.appendChild(nameInput);

    // Column 3: Receiver Groups ("Beschenken sich nicht")
    const tdRecGroups = document.createElement("td");
    const recGroupsInput = document.createElement("input");
    recGroupsInput.type = "text";
    recGroupsInput.placeholder = t("placeholderReceiverGroups");
    recGroupsInput.title = t("tooltipColReceiverGroups");
    recGroupsInput.value = participant.receiverGroups.join(", ");
    recGroupsInput.addEventListener("change", async () => {
      participant.receiverGroups = parseCommaGroups(recGroupsInput.value);
      await persistActivePreset();
    });
    tdRecGroups.appendChild(recGroupsInput);

    // Column 4: Co-Giver Groups ("Kein Schenk-Team")
    const tdCoGroups = document.createElement("td");
    const coGroupsInput = document.createElement("input");
    coGroupsInput.type = "text";
    coGroupsInput.placeholder = t("placeholderCoGiverGroups");
    coGroupsInput.title = t("tooltipColCoGiverGroups");
    coGroupsInput.value = participant.coGiverGroups.join(", ");
    coGroupsInput.addEventListener("change", async () => {
      participant.coGiverGroups = parseCommaGroups(coGroupsInput.value);
      await persistActivePreset();
    });
    tdCoGroups.appendChild(coGroupsInput);

    // Column 5: Remove row
    const tdRemove = document.createElement("td");
    tdRemove.className = "col-actions";
    const removeRowBtn = document.createElement("button");
    removeRowBtn.type = "button";
    removeRowBtn.className = "btn btn-danger btn-sm";
    removeRowBtn.textContent = "✕";
    removeRowBtn.addEventListener("click", async () => {
      preset.participants.splice(idx, 1);
      await persistActivePreset();
      renderPresetSelect();
      renderActivePreset();
    });
    tdRemove.appendChild(removeRowBtn);

    tr.append(tdEmail, tdName, tdRecGroups, tdCoGroups, tdRemove);
    els.participantsTbody.appendChild(tr);
  });
}

async function persistActivePreset() {
  const preset = getActivePreset();
  if (!preset) return;
  await savePreset(preset);
}

function renderDryRunResults() {
  els.dryRunResults.replaceChildren();
  if (!state.samples || state.samples.length === 0) {
    const p = document.createElement("p");
    p.className = "empty-state";
    p.textContent = t("dryRunEmpty");
    els.dryRunResults.appendChild(p);
    return;
  }

  if (state.dryRunMeta) {
    const warnings = [];
    if (state.dryRunMeta.onlyOneSolutionExists) {
      warnings.push(t("warnOnlyOneSolution"));
    } else {
      if (
        state.dryRunMeta.exhaustedAllSolutions &&
        state.dryRunMeta.uniqueSampleCount < state.dryRunMeta.requestedSampleCount
      ) {
        warnings.push(
          t("warnFewSolutions", {
            unique: state.dryRunMeta.uniqueSampleCount,
            requested: state.dryRunMeta.requestedSampleCount
          })
        );
      }
      if (Array.isArray(state.dryRunMeta.forcedReceivers) && state.dryRunMeta.forcedReceivers.length > 0) {
        warnings.push(
          t("warnForcedReceivers", {
            receivers: state.dryRunMeta.forcedReceivers.join(", ")
          })
        );
      }
    }

    if (warnings.length > 0) {
      const warnBox = document.createElement("div");
      warnBox.className = "warning-box";
      for (const w of warnings) {
        const div = document.createElement("div");
        div.textContent = w;
        warnBox.appendChild(div);
      }
      els.dryRunResults.appendChild(warnBox);
    }
  }

  if (state.samples.length > 1) {
    const tabs = document.createElement("div");
    tabs.className = "sample-tabs";
    state.samples.forEach((_, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = idx === state.activeSampleIdx ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm";
      btn.textContent = t("sampleTabLabel", { n: idx + 1 });
      btn.addEventListener("click", () => {
        state.activeSampleIdx = idx;
        renderDryRunResults();
      });
      tabs.appendChild(btn);
    });
    els.dryRunResults.appendChild(tabs);
  }

  const sample = state.samples[state.activeSampleIdx] || state.samples[0];
  const card = document.createElement("div");
  card.className = "sample-card";

  const table = document.createElement("table");
  table.className = "mapping-table";
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  const thReceiver = document.createElement("th");
  thReceiver.textContent = t("tableColReceiver");
  const thGivers = document.createElement("th");
  thGivers.textContent = t("tableColGivers");
  headRow.append(thReceiver, thGivers);
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (const row of sample.byReceiver) {
    const tr = document.createElement("tr");
    const tdR = document.createElement("td");
    tdR.textContent = row.receiver;
    const tdG = document.createElement("td");
    for (const giverLabel of row.givers) {
      const pill = document.createElement("span");
      pill.className = "tag-pill";
      pill.textContent = giverLabel;
      tdG.appendChild(pill);
    }
    tr.append(tdR, tdG);
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  card.appendChild(table);

  // Collapsible email previews
  const detailsWrap = document.createElement("details");
  detailsWrap.className = "mail-previews";
  const summary = document.createElement("summary");
  summary.textContent = t("mailPreviewSummary", { count: sample.byGiver.length });
  detailsWrap.appendChild(summary);

  for (const giverMail of sample.byGiver) {
    const item = document.createElement("div");
    item.className = "mail-preview-item";
    const title = document.createElement("strong");
    title.style.fontSize = "0.8rem";
    title.textContent = `${giverMail.giver} — ${giverMail.subject}`;
    const pre = document.createElement("pre");
    pre.className = "mail-preview-body";
    pre.textContent = giverMail.body;
    item.append(title, pre);
    detailsWrap.appendChild(item);
  }

  card.appendChild(detailsWrap);
  els.dryRunResults.appendChild(card);
}

async function callDrawApi(dryRun) {
  clearStatus();
  const preset = getActivePreset();
  if (!preset) return;

  const payload = {
    dryRun,
    passcode: dryRun ? "" : els.passcodeInput.value,
    lang: state.lang,
    rules: preset.rules,
    participants: preset.participants
  };

  const btn = dryRun ? els.runDryRunBtn : els.sendRealEmailsBtn;
  btn.disabled = true;
  try {
    const res = await fetch("/api/draw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      showStatus("error", translateError(state.lang, data.errorCode || "ERR_BAD_JSON", data.detail));
      return;
    }

    if (dryRun) {
      state.samples = data.samples || [];
      state.dryRunMeta = {
        requestedSampleCount: data.requestedSampleCount ?? preset.rules.sampleCount,
        uniqueSampleCount: data.uniqueSampleCount ?? state.samples.length,
        exhaustedAllSolutions: Boolean(data.exhaustedAllSolutions),
        onlyOneSolutionExists: Boolean(data.onlyOneSolutionExists),
        forcedReceivers: data.forcedReceivers || []
      };
      state.activeSampleIdx = 0;
      renderDryRunResults();
      showStatus("success", t("statusDryRunOk", { count: state.samples.length }));
    } else {
      showStatus("success", t("statusLiveSendOk", { count: data.sentCount }));
    }
  } catch (err) {
    showStatus("error", translateError(state.lang, "ERR_NETWORK", err.message));
  } finally {
    btn.disabled = false;
  }
}

function parseBulkEntries(rawText) {
  const entries = [];
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    const parts = line.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length > 1 && parts.every((p) => p.includes("@"))) {
      for (const email of parts) {
        entries.push({ email, name: "", receiverGroups: [], coGiverGroups: [] });
      }
    } else {
      const email = parts[0] || "";
      const name = parts[1] || "";
      const receiverGroups = (parts[2] || "")
        .split("|")
        .map((g) => g.trim())
        .filter(Boolean);
      const coGiverGroups = (parts[3] || "")
        .split("|")
        .map((g) => g.trim())
        .filter(Boolean);
      entries.push({ email, name, receiverGroups, coGiverGroups });
    }
  }
  return entries;
}

async function init() {
  try {
    const res = await fetch("/api/meta");
    if (res.ok) {
      const meta = await res.json();
      if (Array.isArray(meta.languages) && meta.languages.length > 0) {
        state.languages = meta.languages;
      }
    }
  } catch {
    // Fallback to built-in language list
  }

  state.presets = await loadAllPresets();
  if (!state.presets.some((p) => p.id === state.activePresetId)) {
    state.activePresetId = state.presets[0]?.id || "";
  }

  renderLanguageSelect();
  renderPresetSelect();
  applyTranslations();

  // Event listeners
  els.langSelect.addEventListener("change", () => {
    state.lang = els.langSelect.value;
    localStorage.setItem("wichteln_lang", state.lang);
    applyTranslations();
  });

  els.presetSelect.addEventListener("change", () => {
    state.activePresetId = els.presetSelect.value;
    localStorage.setItem("wichteln_active_preset", state.activePresetId);
    state.samples = [];
    state.dryRunMeta = null;
    renderActivePreset();
    renderDryRunResults();
    clearStatus();
  });

  els.presetNameInput.addEventListener("change", async () => {
    const preset = getActivePreset();
    if (!preset) return;
    preset.name = els.presetNameInput.value.trim() || t("newPresetDefaultName");
    await persistActivePreset();
    renderPresetSelect();
  });

  els.newPresetBtn.addEventListener("click", async () => {
    const newPreset = {
      id: `preset-${Date.now()}`,
      name: t("newPresetDefaultName"),
      rules: {
        giverGroupSize: 2,
        preventDuplicateCoGiverPairs: true,
        preventDirectReciprocity: false,
        sampleCount: 3
      },
      participants: [
        { email: "", name: "", receiverGroups: [], coGiverGroups: [] },
        { email: "", name: "", receiverGroups: [], coGiverGroups: [] },
        { email: "", name: "", receiverGroups: [], coGiverGroups: [] }
      ]
    };
    state.presets.push(newPreset);
    state.activePresetId = newPreset.id;
    localStorage.setItem("wichteln_active_preset", state.activePresetId);
    await savePreset(newPreset);
    renderPresetSelect();
    renderActivePreset();
  });

  els.duplicatePresetBtn.addEventListener("click", async () => {
    const current = getActivePreset();
    if (!current) return;
    const copy = structuredClone(current);
    copy.id = `preset-${Date.now()}`;
    copy.name = `${current.name}${t("copySuffix")}`;
    state.presets.push(copy);
    state.activePresetId = copy.id;
    localStorage.setItem("wichteln_active_preset", state.activePresetId);
    await savePreset(copy);
    renderPresetSelect();
    renderActivePreset();
  });

  els.deletePresetBtn.addEventListener("click", async () => {
    if (state.presets.length <= 1) return;
    const current = getActivePreset();
    if (!current || !confirm(t("confirmDeletePreset"))) return;
    await deletePresetById(current.id);
    state.presets = state.presets.filter((p) => p.id !== current.id);
    state.activePresetId = state.presets[0].id;
    localStorage.setItem("wichteln_active_preset", state.activePresetId);
    renderPresetSelect();
    renderActivePreset();
  });

  els.loadExampleBtn.addEventListener("click", async () => {
    const preset = getActivePreset();
    if (!preset) return;
    if (preset.participants.some((p) => p.email || p.name) && !confirm(t("confirmLoadExample"))) {
      return;
    }
    preset.participants = structuredClone(EXAMPLE_PARTICIPANTS_TEAM);
    await persistActivePreset();
    renderPresetSelect();
    renderActivePreset();
    clearStatus();
  });

  els.clearParticipantsBtn.addEventListener("click", async () => {
    const preset = getActivePreset();
    if (!preset || !confirm(t("confirmClearParticipants"))) return;
    preset.participants = [
      { email: "", name: "", receiverGroups: [], coGiverGroups: [] },
      { email: "", name: "", receiverGroups: [], coGiverGroups: [] },
      { email: "", name: "", receiverGroups: [], coGiverGroups: [] }
    ];
    state.samples = [];
    state.dryRunMeta = null;
    await persistActivePreset();
    renderPresetSelect();
    renderActivePreset();
    renderDryRunResults();
    clearStatus();
  });

  els.exportJsonBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state.presets, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wichteln-presets.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  els.importJsonInput.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      const list = Array.isArray(imported) ? imported : [imported];
      for (const item of list) {
        if (item && Array.isArray(item.participants)) {
          const preset = normalizePreset({
            id: item.id || `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: item.name || t("newPresetDefaultName"),
            rules: item.rules || { giverGroupSize: 2, sampleCount: 3 },
            participants: item.participants
          });
          await savePreset(preset);
        }
      }
      state.presets = await loadAllPresets();
      renderPresetSelect();
      renderActivePreset();
      showStatus("success", t("statusImportOk"));
    } catch (err) {
      showStatus("error", translateError(state.lang, "ERR_BAD_JSON", err.message));
    } finally {
      els.importJsonInput.value = "";
    }
  });

  els.addParticipantBtn.addEventListener("click", async () => {
    const preset = getActivePreset();
    if (!preset) return;
    preset.participants.push({
      email: "",
      name: "",
      receiverGroups: [],
      coGiverGroups: []
    });
    await persistActivePreset();
    renderPresetSelect();
    renderActivePreset();
  });

  els.toggleBulkBtn.addEventListener("click", () => {
    els.bulkAddDrawer.hidden = !els.bulkAddDrawer.hidden;
  });

  els.cancelBulkBtn.addEventListener("click", () => {
    els.bulkAddDrawer.hidden = true;
    els.bulkAddTextarea.value = "";
  });

  els.applyBulkBtn.addEventListener("click", async () => {
    const preset = getActivePreset();
    if (!preset) return;
    const entries = parseBulkEntries(els.bulkAddTextarea.value);
    if (entries.length > 0) {
      preset.participants.push(...entries);
      await persistActivePreset();
      renderPresetSelect();
      renderActivePreset();
    }
    els.bulkAddTextarea.value = "";
    els.bulkAddDrawer.hidden = true;
  });

  // Rule changes
  const syncRules = async () => {
    const preset = getActivePreset();
    if (!preset) return;
    preset.rules = {
      giverGroupSize: Math.max(1, Math.min(5, Number.parseInt(els.giverGroupSizeInput.value, 10) || 2)),
      sampleCount: Math.max(1, Math.min(10, Number.parseInt(els.sampleCountInput.value, 10) || 3)),
      preventDuplicateCoGiverPairs: els.ruleDuplicateCoGivers.checked,
      preventDirectReciprocity: els.ruleDirectReciprocity.checked
    };
    await persistActivePreset();
  };

  els.giverGroupSizeInput.addEventListener("change", syncRules);
  els.sampleCountInput.addEventListener("change", syncRules);
  els.ruleDuplicateCoGivers.addEventListener("change", syncRules);
  els.ruleDirectReciprocity.addEventListener("change", syncRules);

  els.runDryRunBtn.addEventListener("click", () => callDrawApi(true));
  els.sendRealEmailsBtn.addEventListener("click", () => {
    const preset = getActivePreset();
    if (!preset) return;
    if (!confirm(t("confirmLiveSend", { count: preset.participants.length }))) return;
    callDrawApi(false);
  });
}

init();
