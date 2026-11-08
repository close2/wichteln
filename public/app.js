import { I18N, translate, translateError } from "./i18n.js?v=1.2.2";
import {
  SEED_PRESETS,
  loadAllPresets,
  savePreset,
  deletePresetById,
  normalizePreset,
  EXAMPLE_PARTICIPANTS_TEAM
} from "./db.js?v=1.2.2";

const state = {
  lang: localStorage.getItem("wichteln_lang") || "de",
  languages: [
    { code: "de", label: "Deutsch" },
    { code: "en", label: "English" }
  ],
  presets: structuredClone(SEED_PRESETS).map(normalizePreset),
  activePresetId: localStorage.getItem("wichteln_active_preset") || SEED_PRESETS[0].id,
  twoWaySync: localStorage.getItem("wichteln_twoway_sync") !== "false",
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
  twoWaySyncCheckbox: document.getElementById("twoWaySyncCheckbox"),
  participantsTbody: document.getElementById("participantsTbody"),
  giverGroupSizeInput: document.getElementById("giverGroupSizeInput"),
  sampleCountInput: document.getElementById("sampleCountInput"),
  ruleDuplicateCoGivers: document.getElementById("ruleDuplicateCoGivers"),
  ruleDirectReciprocity: document.getElementById("ruleDirectReciprocity"),
  statusBanner: document.getElementById("statusBanner"),
  runDryRunBtn: document.getElementById("runDryRunBtn"),
  dryRunResults: document.getElementById("dryRunResults"),
  liveSendForm: document.getElementById("liveSendForm"),
  passcodeInput: document.getElementById("passcodeInput"),
  sendRealEmailsBtn: document.getElementById("sendRealEmailsBtn")
};

function t(key, vars) {
  return translate(state.lang, key, vars) ?? key;
}

function getActivePreset() {
  return state.presets.find((p) => p.id === state.activePresetId) || state.presets[0];
}

function participantLabel(p, fallbackIndex = 0) {
  if (p.name && p.email) return `${p.name} (${p.email})`;
  if (p.name) return p.name;
  if (p.email) return p.email;
  return `#${fallbackIndex + 1}`;
}

function participantShortLabel(p, fallbackIndex = 0) {
  if (p.name) return p.name;
  if (p.email) return p.email;
  return `#${fallbackIndex + 1}`;
}

function makeParticipantId() {
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function showStatus(type, message) {
  if (!els.statusBanner) return;
  els.statusBanner.hidden = false;
  els.statusBanner.className = `status-banner ${type}`;
  els.statusBanner.textContent = message;
  if (type === "error") {
    els.statusBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function clearStatus() {
  if (!els.statusBanner) return;
  els.statusBanner.hidden = true;
  els.statusBanner.textContent = "";
}

function syncSeedPresetDefaultNames() {
  const friendsNames = [I18N.de.presetFriendsName, I18N.en.presetFriendsName];
  const classicNames = [I18N.de.presetClassicName, I18N.en.presetClassicName];
  for (const preset of state.presets) {
    if (preset.id === "preset-friends-couples" && friendsNames.includes(preset.name)) {
      preset.name = t("presetFriendsName");
    } else if (preset.id === "preset-classic-wichteln" && classicNames.includes(preset.name)) {
      preset.name = t("presetClassicName");
    }
  }
}

function applyTranslations() {
  document.documentElement.lang = state.lang;
  for (const node of document.querySelectorAll("[data-i18n]")) {
    const key = node.getAttribute("data-i18n");
    const val = translate(state.lang, key);
    if (val !== null) {
      node.textContent = val;
    }
  }
  for (const node of document.querySelectorAll("[data-i18n-title]")) {
    const key = node.getAttribute("data-i18n-title");
    const val = translate(state.lang, key);
    if (val !== null) {
      node.removeAttribute("title");
      node.setAttribute("data-tooltip", val);
      node.setAttribute("aria-label", val);
    }
  }
  syncSeedPresetDefaultNames();
  renderPresetSelect();
  renderActivePreset();
  renderDryRunResults();
}

function renderLanguageSelect() {
  if (!els.langSelect) return;
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
  if (!els.presetSelect) return;
  els.presetSelect.replaceChildren();
  for (const preset of state.presets) {
    const opt = document.createElement("option");
    opt.value = preset.id;
    opt.textContent = `${preset.name} (${preset.participants.length})`;
    if (preset.id === state.activePresetId) opt.selected = true;
    els.presetSelect.appendChild(opt);
  }
  if (els.deletePresetBtn) {
    els.deletePresetBtn.disabled = state.presets.length <= 1;
  }
}

function buildExcludesCell(preset, participant, byId, fieldName, placeholderKey, allowOneWay) {
  const td = document.createElement("td");
  const wrap = document.createElement("div");
  wrap.className = "excludes-cell";

  const list = participant[fieldName];
  for (const targetId of list) {
    const targetEntry = byId.get(targetId);
    if (!targetEntry) continue;
    const targetP = targetEntry.p;
    const targetList = targetP[fieldName];
    const isMutual = Array.isArray(targetList) && targetList.includes(participant.id);

    const chip = document.createElement("span");
    chip.className = !allowOneWay || isMutual ? "exclude-chip" : "exclude-chip one-way";

    if (allowOneWay) {
      const dirBtn = document.createElement("button");
      dirBtn.type = "button";
      dirBtn.className = "exclude-dir-btn";
      dirBtn.textContent = isMutual ? "↔" : "→";
      dirBtn.title = isMutual ? t("dirTwoWayTitle") : t("dirOneWayTitle");
      dirBtn.addEventListener("click", async () => {
        if (!Array.isArray(targetP[fieldName])) targetP[fieldName] = [];
        if (isMutual) {
          targetP[fieldName] = targetP[fieldName].filter((id) => id !== participant.id);
        } else if (!targetP[fieldName].includes(participant.id)) {
          targetP[fieldName].push(participant.id);
        }
        renderActivePreset();
        await persistActivePreset();
      });
      chip.appendChild(dirBtn);
    } else {
      const symIcon = document.createElement("span");
      symIcon.className = "sym-icon";
      symIcon.textContent = "↔";
      chip.appendChild(symIcon);
    }

    const labelSpan = document.createElement("span");
    labelSpan.textContent = participantShortLabel(targetP, targetEntry.i);

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "exclude-remove-btn";
    removeBtn.textContent = "✕";
    removeBtn.addEventListener("click", async () => {
      participant[fieldName] = participant[fieldName].filter((id) => id !== targetId);
      if ((!allowOneWay || state.twoWaySync) && Array.isArray(targetP[fieldName])) {
        targetP[fieldName] = targetP[fieldName].filter((id) => id !== participant.id);
      }
      renderActivePreset();
      await persistActivePreset();
    });

    chip.append(labelSpan, removeBtn);
    wrap.appendChild(chip);
  }

  const availableOthers = preset.participants
    .map((other, otherIdx) => ({ other, otherIdx }))
    .filter(({ other }) => other.id !== participant.id && !list.includes(other.id));

  if (availableOthers.length > 0) {
    const picker = document.createElement("select");
    picker.className = "exclude-picker";
    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = t(placeholderKey);
    picker.appendChild(defaultOpt);

    for (const { other, otherIdx } of availableOthers) {
      const opt = document.createElement("option");
      opt.value = other.id;
      opt.textContent = participantLabel(other, otherIdx);
      picker.appendChild(opt);
    }

    picker.addEventListener("change", async () => {
      const chosenId = picker.value;
      if (!chosenId) return;
      if (!participant[fieldName].includes(chosenId)) {
        participant[fieldName].push(chosenId);
      }
      if (!allowOneWay || state.twoWaySync) {
        const otherEntry = byId.get(chosenId);
        if (otherEntry) {
          if (!Array.isArray(otherEntry.p[fieldName])) otherEntry.p[fieldName] = [];
          if (!otherEntry.p[fieldName].includes(participant.id)) {
            otherEntry.p[fieldName].push(participant.id);
          }
        }
      }
      renderActivePreset();
      await persistActivePreset();
    });

    wrap.appendChild(picker);
  }

  td.appendChild(wrap);
  return td;
}

function renderActivePreset() {
  const preset = getActivePreset();
  if (!preset) return;

  if (els.presetNameInput) els.presetNameInput.value = preset.name;
  if (els.participantCountBadge) els.participantCountBadge.textContent = String(preset.participants.length);
  if (els.twoWaySyncCheckbox) els.twoWaySyncCheckbox.checked = state.twoWaySync;

  if (els.giverGroupSizeInput) els.giverGroupSizeInput.value = String(preset.rules.giverGroupSize ?? 2);
  if (els.sampleCountInput) els.sampleCountInput.value = String(preset.rules.sampleCount ?? 3);
  if (els.ruleDuplicateCoGivers) els.ruleDuplicateCoGivers.checked = preset.rules.preventDuplicateCoGiverPairs !== false;
  if (els.ruleDirectReciprocity) els.ruleDirectReciprocity.checked = preset.rules.preventDirectReciprocity === true;

  if (!els.participantsTbody) return;
  const byId = new Map(preset.participants.map((p, i) => [p.id, { p, i }]));

  els.participantsTbody.replaceChildren();
  preset.participants.forEach((participant, idx) => {
    if (!Array.isArray(participant.excludeReceivers)) participant.excludeReceivers = [];
    if (!Array.isArray(participant.excludeCoGivers)) participant.excludeCoGivers = [];
    participant.excludeReceivers = participant.excludeReceivers.filter(
      (id) => id !== participant.id && byId.has(id)
    );
    participant.excludeCoGivers = participant.excludeCoGivers.filter(
      (id) => id !== participant.id && byId.has(id)
    );

    const tr = document.createElement("tr");

    // Column 1: Email
    const tdEmail = document.createElement("td");
    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.placeholder = "name@example.org";
    emailInput.value = participant.email || "";
    emailInput.addEventListener("input", () => {
      participant.email = emailInput.value.trim();
    });
    emailInput.addEventListener("change", async () => {
      participant.email = emailInput.value.trim();
      await persistActivePreset();
    });
    tdEmail.appendChild(emailInput);

    // Column 2: Optional Name
    const tdName = document.createElement("td");
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = t("namePlaceholder");
    nameInput.maxLength = 40;
    nameInput.value = participant.name || "";
    nameInput.addEventListener("input", () => {
      participant.name = nameInput.value.trim();
    });
    nameInput.addEventListener("change", async () => {
      participant.name = nameInput.value.trim();
      await persistActivePreset();
    });
    tdName.appendChild(nameInput);

    // Column 3: Direct Picker for Receiver Exclusions ("Schenkt nicht an", two-way ↔ or one-way →)
    const tdExcludeReceivers = buildExcludesCell(
      preset,
      participant,
      byId,
      "excludeReceivers",
      "addExcludeReceiverPlaceholder",
      true
    );

    // Column 4: Direct Picker for Co-Giver Exclusions ("Kein Schenk-Team mit", mutual ↔)
    const tdExcludeCoGivers = buildExcludesCell(
      preset,
      participant,
      byId,
      "excludeCoGivers",
      "addExcludeCoGiverPlaceholder",
      false
    );

    // Column 5: Remove row
    const tdRemove = document.createElement("td");
    tdRemove.className = "col-actions";
    const removeRowBtn = document.createElement("button");
    removeRowBtn.type = "button";
    removeRowBtn.className = "btn btn-danger btn-sm";
    removeRowBtn.textContent = "✕";
    removeRowBtn.addEventListener("click", async () => {
      const removedId = participant.id;
      preset.participants.splice(idx, 1);
      for (const other of preset.participants) {
        if (Array.isArray(other.excludeReceivers)) {
          other.excludeReceivers = other.excludeReceivers.filter((id) => id !== removedId);
        }
        if (Array.isArray(other.excludeCoGivers)) {
          other.excludeCoGivers = other.excludeCoGivers.filter((id) => id !== removedId);
        }
      }
      renderPresetSelect();
      renderActivePreset();
      await persistActivePreset();
    });
    tdRemove.appendChild(removeRowBtn);

    tr.append(tdEmail, tdName, tdExcludeReceivers, tdExcludeCoGivers, tdRemove);
    els.participantsTbody.appendChild(tr);
  });
}

async function persistActivePreset() {
  state.userModified = true;
  const preset = getActivePreset();
  if (!preset) return;
  await savePreset(preset);
}

function renderDryRunResults() {
  if (!els.dryRunResults) return;
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
    title.className = "mail-preview-title";
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
    passcode: dryRun ? "" : els.passcodeInput?.value || "",
    lang: state.lang,
    rules: preset.rules,
    participants: preset.participants
  };

  const btn = dryRun ? els.runDryRunBtn : els.sendRealEmailsBtn;
  if (btn) btn.disabled = true;
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
    if (btn) btn.disabled = false;
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
        entries.push({ id: makeParticipantId(), email, name: "", excludeReceivers: [], excludeCoGivers: [] });
      }
    } else {
      const email = parts[0] || "";
      const name = parts[1] || "";
      entries.push({ id: makeParticipantId(), email, name, excludeReceivers: [], excludeCoGivers: [] });
    }
  }
  return entries;
}

function bindEvents() {
  els.langSelect?.addEventListener("change", () => {
    state.lang = els.langSelect.value;
    localStorage.setItem("wichteln_lang", state.lang);
    applyTranslations();
  });

  els.twoWaySyncCheckbox?.addEventListener("change", () => {
    state.twoWaySync = els.twoWaySyncCheckbox.checked;
    localStorage.setItem("wichteln_twoway_sync", String(state.twoWaySync));
  });

  els.presetSelect?.addEventListener("change", () => {
    state.activePresetId = els.presetSelect.value;
    localStorage.setItem("wichteln_active_preset", state.activePresetId);
    state.samples = [];
    state.dryRunMeta = null;
    renderActivePreset();
    renderDryRunResults();
    clearStatus();
  });

  els.presetNameInput?.addEventListener("change", async () => {
    const preset = getActivePreset();
    if (!preset) return;
    preset.name = els.presetNameInput.value.trim() || t("newPresetDefaultName");
    renderPresetSelect();
    await persistActivePreset();
  });

  els.newPresetBtn?.addEventListener("click", async () => {
    state.userModified = true;
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
        { id: makeParticipantId(), email: "", name: "", excludeReceivers: [], excludeCoGivers: [] },
        { id: makeParticipantId(), email: "", name: "", excludeReceivers: [], excludeCoGivers: [] },
        { id: makeParticipantId(), email: "", name: "", excludeReceivers: [], excludeCoGivers: [] }
      ]
    };
    state.presets.push(newPreset);
    state.activePresetId = newPreset.id;
    localStorage.setItem("wichteln_active_preset", state.activePresetId);
    renderPresetSelect();
    renderActivePreset();
    await savePreset(newPreset);
  });

  els.duplicatePresetBtn?.addEventListener("click", async () => {
    state.userModified = true;
    const current = getActivePreset();
    if (!current) return;
    const copy = structuredClone(current);
    copy.id = `preset-${Date.now()}`;
    copy.name = `${current.name}${t("copySuffix")}`;
    state.presets.push(copy);
    state.activePresetId = copy.id;
    localStorage.setItem("wichteln_active_preset", state.activePresetId);
    renderPresetSelect();
    renderActivePreset();
    await savePreset(copy);
  });

  els.deletePresetBtn?.addEventListener("click", async () => {
    state.userModified = true;
    if (state.presets.length <= 1) return;
    const current = getActivePreset();
    if (!current) return;
    state.presets = state.presets.filter((p) => p.id !== current.id);
    state.activePresetId = state.presets[0].id;
    localStorage.setItem("wichteln_active_preset", state.activePresetId);
    renderPresetSelect();
    renderActivePreset();
    await deletePresetById(current.id);
  });

  els.loadExampleBtn?.addEventListener("click", async () => {
    const preset = getActivePreset();
    if (!preset) return;
    preset.participants = structuredClone(EXAMPLE_PARTICIPANTS_TEAM);
    state.samples = [];
    state.dryRunMeta = null;
    renderPresetSelect();
    renderActivePreset();
    renderDryRunResults();
    showStatus("success", t("statusLoadedExample"));
    await persistActivePreset();
  });

  els.clearParticipantsBtn?.addEventListener("click", async () => {
    const preset = getActivePreset();
    if (!preset) return;
    preset.participants = [
      { id: makeParticipantId(), email: "", name: "", excludeReceivers: [], excludeCoGivers: [] },
      { id: makeParticipantId(), email: "", name: "", excludeReceivers: [], excludeCoGivers: [] },
      { id: makeParticipantId(), email: "", name: "", excludeReceivers: [], excludeCoGivers: [] }
    ];
    state.samples = [];
    state.dryRunMeta = null;
    renderPresetSelect();
    renderActivePreset();
    renderDryRunResults();
    showStatus("success", t("statusClearedParticipants"));
    await persistActivePreset();
  });

  els.exportJsonBtn?.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state.presets, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wichteln-presets.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  els.importJsonInput?.addEventListener("change", async (e) => {
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

  els.addParticipantBtn?.addEventListener("click", async () => {
    const preset = getActivePreset();
    if (!preset) return;
    preset.participants.push({
      id: makeParticipantId(),
      email: "",
      name: "",
      excludeReceivers: [],
      excludeCoGivers: []
    });
    renderPresetSelect();
    renderActivePreset();
    await persistActivePreset();
  });

  els.toggleBulkBtn?.addEventListener("click", () => {
    if (!els.bulkAddDrawer) return;
    els.bulkAddDrawer.hidden = !els.bulkAddDrawer.hidden;
  });

  els.cancelBulkBtn?.addEventListener("click", () => {
    if (!els.bulkAddDrawer) return;
    els.bulkAddDrawer.hidden = true;
    if (els.bulkAddTextarea) els.bulkAddTextarea.value = "";
  });

  els.applyBulkBtn?.addEventListener("click", async () => {
    const preset = getActivePreset();
    if (!preset || !els.bulkAddTextarea) return;
    const entries = parseBulkEntries(els.bulkAddTextarea.value);
    els.bulkAddTextarea.value = "";
    if (els.bulkAddDrawer) els.bulkAddDrawer.hidden = true;
    if (entries.length > 0) {
      preset.participants.push(...entries);
      normalizePreset(preset);
      renderPresetSelect();
      renderActivePreset();
      await persistActivePreset();
    }
  });

  const syncRules = async () => {
    const preset = getActivePreset();
    if (!preset) return;
    preset.rules = {
      giverGroupSize: Math.max(1, Math.min(5, Number.parseInt(els.giverGroupSizeInput?.value, 10) || 2)),
      sampleCount: Math.max(1, Math.min(10, Number.parseInt(els.sampleCountInput?.value, 10) || 3)),
      preventDuplicateCoGiverPairs: Boolean(els.ruleDuplicateCoGivers?.checked),
      preventDirectReciprocity: Boolean(els.ruleDirectReciprocity?.checked)
    };
    await persistActivePreset();
  };

  els.giverGroupSizeInput?.addEventListener("change", syncRules);
  els.sampleCountInput?.addEventListener("change", syncRules);
  els.ruleDuplicateCoGivers?.addEventListener("change", syncRules);
  els.ruleDirectReciprocity?.addEventListener("change", syncRules);

  els.runDryRunBtn?.addEventListener("click", () => callDrawApi(true));
  els.liveSendForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const preset = getActivePreset();
    if (!preset) return;
    callDrawApi(false);
  });
}

async function init() {
  // 1. Synchronously bind all UI events and render initial seed presets immediately
  bindEvents();
  renderLanguageSelect();
  applyTranslations();

  // 2. Load persisted presets from IndexedDB (with timeout/fallback)
  const loadedPresets = await loadAllPresets();
  if (!state.userModified && Array.isArray(loadedPresets) && loadedPresets.length > 0) {
    state.presets = loadedPresets;
    if (!state.presets.some((p) => p.id === state.activePresetId)) {
      state.activePresetId = state.presets[0].id;
    }
    applyTranslations();
  }

  // 3. Fetch server metadata (supported languages)
  try {
    const res = await fetch("/api/meta");
    if (res.ok) {
      const meta = await res.json();
      if (Array.isArray(meta.languages) && meta.languages.length > 0) {
        state.languages = meta.languages;
        renderLanguageSelect();
      }
    }
  } catch {
    // Fallback to built-in language list
  }
}

init();
