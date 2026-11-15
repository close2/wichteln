import { translate, translateError } from "./i18n.js?v=1.3.0";
import {
  createEmptyDraft,
  loadAllPresets,
  savePreset,
  deletePresetById,
  normalizePreset,
  EXAMPLE_PARTICIPANTS_CLASSIC,
  EXAMPLE_PARTICIPANTS_TEAM
} from "./db.js?v=1.3.0";

const SESSION_DRAFT_KEY = "wichteln_session_draft_v4";

function loadInitialRound() {
  try {
    const raw = sessionStorage.getItem(SESSION_DRAFT_KEY);
    if (raw) {
      return normalizePreset(JSON.parse(raw));
    }
  } catch {
    // Fall back to clean empty draft
  }
  return createEmptyDraft();
}

const state = {
  lang: localStorage.getItem("wichteln_lang") || "de",
  languages: [
    { code: "de", label: "Deutsch" },
    { code: "en", label: "English" }
  ],
  savedPresets: [],
  currentRound: loadInitialRound(),
  twoWaySync: localStorage.getItem("wichteln_twoway_sync") !== "false",
  samples: [],
  dryRunMeta: null,
  activeSampleIdx: 0,
  lastGeneratedPersonalCode: "",
  userModified: false
};

const els = {
  langSelect: document.getElementById("langSelect"),
  openRedeemBtn: document.getElementById("openRedeemBtn"),
  redeemSection: document.getElementById("redeemSection"),
  closeRedeemBtn: document.getElementById("closeRedeemBtn"),
  redeemForm: document.getElementById("redeemForm"),
  redeemCodeInput: document.getElementById("redeemCodeInput"),
  redeemSubmitBtn: document.getElementById("redeemSubmitBtn"),
  redeemResultBox: document.getElementById("redeemResultBox"),

  presetSelect: document.getElementById("presetSelect"),
  presetNameInput: document.getElementById("presetNameInput"),
  savePresetBtn: document.getElementById("savePresetBtn"),
  newPresetBtn: document.getElementById("newPresetBtn"),
  duplicatePresetBtn: document.getElementById("duplicatePresetBtn"),
  exportJsonBtn: document.getElementById("exportJsonBtn"),
  importJsonInput: document.getElementById("importJsonInput"),
  deletePresetBtn: document.getElementById("deletePresetBtn"),

  modeCard1: document.getElementById("modeCard1"),
  modeCard2: document.getElementById("modeCard2"),
  modeCardMore: document.getElementById("modeCardMore"),
  customTeamSizeBox: document.getElementById("customTeamSizeBox"),
  giverGroupSizeSelect: document.getElementById("giverGroupSizeSelect"),

  participantCountBadge: document.getElementById("participantCountBadge"),
  loadExampleBtn: document.getElementById("loadExampleBtn"),
  emptyLoadExampleBtn: document.getElementById("emptyLoadExampleBtn"),
  clearParticipantsBtn: document.getElementById("clearParticipantsBtn"),
  toggleBulkBtn: document.getElementById("toggleBulkBtn"),
  bulkAddDrawer: document.getElementById("bulkAddDrawer"),
  bulkAddTextarea: document.getElementById("bulkAddTextarea"),
  applyBulkBtn: document.getElementById("applyBulkBtn"),
  cancelBulkBtn: document.getElementById("cancelBulkBtn"),
  addParticipantBtn: document.getElementById("addParticipantBtn"),
  emptyAddFirstBtn: document.getElementById("emptyAddFirstBtn"),
  emptyParticipantsBox: document.getElementById("emptyParticipantsBox"),
  participantsTableWrap: document.getElementById("participantsTableWrap"),
  explainReceiverTextEl: document.getElementById("explainReceiverTextEl"),
  explainCoGiverCard: document.getElementById("explainCoGiverCard"),
  thExcludeCoGivers: document.getElementById("thExcludeCoGivers"),
  twoWaySyncCheckbox: document.getElementById("twoWaySyncCheckbox"),
  participantsTbody: document.getElementById("participantsTbody"),

  ruleDuplicateCoRow: document.getElementById("ruleDuplicateCoRow"),
  ruleDuplicateCoGivers: document.getElementById("ruleDuplicateCoGivers"),
  ruleDirectReciprocity: document.getElementById("ruleDirectReciprocity"),
  sampleCountInput: document.getElementById("sampleCountInput"),
  runDryRunBtn: document.getElementById("runDryRunBtn"),
  dryRunResults: document.getElementById("dryRunResults"),

  statusBanner: document.getElementById("statusBanner"),
  enableRecoveryCheckbox: document.getElementById("enableRecoveryCheckbox"),
  liveSendForm: document.getElementById("liveSendForm"),
  passcodeInput: document.getElementById("passcodeInput"),
  sendRealEmailsBtn: document.getElementById("sendRealEmailsBtn"),

  seedResultBox: document.getElementById("seedResultBox"),
  seedDisplayCode: document.getElementById("seedDisplayCode"),
  copySeedBtn: document.getElementById("copySeedBtn"),

  recoveryDetails: document.getElementById("recoveryDetails"),
  recoverySeedInput: document.getElementById("recoverySeedInput"),
  recoveryPersonSelect: document.getElementById("recoveryPersonSelect"),
  generateCodeBtn: document.getElementById("generateCodeBtn"),
  generatedCodeBox: document.getElementById("generatedCodeBox"),
  generatedCodeForLabel: document.getElementById("generatedCodeForLabel"),
  generatedCodeText: document.getElementById("generatedCodeText"),
  copyPersonalCodeBtn: document.getElementById("copyPersonalCodeBtn"),
  copyPersonalLinkBtn: document.getElementById("copyPersonalLinkBtn"),
  recoveryOverrideEmailInput: document.getElementById("recoveryOverrideEmailInput"),
  resendSingleEmailBtn: document.getElementById("resendSingleEmailBtn")
};

function t(key, vars) {
  return translate(state.lang, key, vars) ?? key;
}

function getActivePreset() {
  return state.currentRound;
}

function isTeamMode() {
  return (state.currentRound.rules.giverGroupSize || 1) >= 2;
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

async function copyTextWithFeedback(btn, text, originalKey) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    if (btn) {
      btn.textContent = t("copiedFeedback");
      setTimeout(() => {
        btn.textContent = t(originalKey);
      }, 1600);
    }
  } catch {
    // Fallback selection if clipboard API is unavailable
  }
}

function saveSessionDraft() {
  try {
    sessionStorage.setItem(SESSION_DRAFT_KEY, JSON.stringify(state.currentRound));
  } catch {
    // Ignore sessionStorage quota/restriction errors
  }
}

async function persistActivePreset() {
  state.userModified = true;
  saveSessionDraft();
  const round = state.currentRound;
  if (round.id) {
    const existingIdx = state.savedPresets.findIndex((p) => p.id === round.id);
    const snapshot = structuredClone(round);
    if (existingIdx >= 0) {
      state.savedPresets[existingIdx] = snapshot;
    } else {
      state.savedPresets.push(snapshot);
    }
    await savePreset(snapshot);
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
  for (const node of document.querySelectorAll("[data-i18n-placeholder]")) {
    const key = node.getAttribute("data-i18n-placeholder");
    const val = translate(state.lang, key);
    if (val !== null) {
      node.placeholder = val;
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

  const blankOpt = document.createElement("option");
  blankOpt.value = "";
  blankOpt.textContent = t("unsavedNewRoundOption");
  if (!state.currentRound.id) blankOpt.selected = true;
  els.presetSelect.appendChild(blankOpt);

  for (const preset of state.savedPresets) {
    const opt = document.createElement("option");
    opt.value = preset.id;
    const displayName = preset.name || t("newPresetDefaultName");
    opt.textContent = `${displayName} (${preset.participants.length})`;
    if (preset.id === state.currentRound.id) opt.selected = true;
    els.presetSelect.appendChild(opt);
  }

  if (els.deletePresetBtn) {
    els.deletePresetBtn.disabled = !state.currentRound.id;
  }
}

function renderModeControls() {
  const size = state.currentRound.rules.giverGroupSize || 1;
  const team = size >= 2;

  els.modeCard1?.classList.toggle("active", size === 1);
  els.modeCard2?.classList.toggle("active", size === 2);
  els.modeCardMore?.classList.toggle("active", size >= 3);

  if (els.customTeamSizeBox) {
    els.customTeamSizeBox.hidden = size < 3;
  }
  if (els.giverGroupSizeSelect && size >= 3) {
    els.giverGroupSizeSelect.value = String(size);
  }

  if (els.explainReceiverTextEl) {
    els.explainReceiverTextEl.textContent = t(team ? "explainReceiverTextTeam" : "explainReceiverTextClassic");
  }
  if (els.explainCoGiverCard) {
    els.explainCoGiverCard.hidden = !team;
  }
  if (els.thExcludeCoGivers) {
    els.thExcludeCoGivers.hidden = !team;
  }
  if (els.ruleDuplicateCoRow) {
    els.ruleDuplicateCoRow.hidden = !team;
  }
}

function renderRecoveryControls() {
  const round = state.currentRound;
  const seed = round.lastRecoverySeed || "";

  if (els.seedResultBox && els.seedDisplayCode) {
    els.seedResultBox.hidden = !seed;
    els.seedDisplayCode.textContent = seed;
  }
  if (els.recoverySeedInput && seed && !els.recoverySeedInput.value) {
    els.recoverySeedInput.value = seed;
  }

  if (!els.recoveryPersonSelect) return;
  const prevVal = els.recoveryPersonSelect.value;
  els.recoveryPersonSelect.replaceChildren();

  if (round.participants.length === 0) {
    const emptyOpt = document.createElement("option");
    emptyOpt.value = "";
    emptyOpt.textContent = t("recoveryNoParticipants");
    els.recoveryPersonSelect.appendChild(emptyOpt);
    els.recoveryPersonSelect.disabled = true;
    if (els.generateCodeBtn) els.generateCodeBtn.disabled = true;
    if (els.resendSingleEmailBtn) els.resendSingleEmailBtn.disabled = true;
    return;
  }

  els.recoveryPersonSelect.disabled = false;
  if (els.generateCodeBtn) els.generateCodeBtn.disabled = false;
  if (els.resendSingleEmailBtn) els.resendSingleEmailBtn.disabled = false;

  round.participants.forEach((p, idx) => {
    const opt = document.createElement("option");
    opt.value = String(idx);
    opt.textContent = participantLabel(p, idx);
    if (String(idx) === prevVal) opt.selected = true;
    els.recoveryPersonSelect.appendChild(opt);
  });
}

function buildExcludesCell(preset, participant, byId, fieldName, placeholderKey, allowOneWay, dataLabelKey) {
  const td = document.createElement("td");
  td.setAttribute("data-label", t(dataLabelKey));
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
      dirBtn.tabIndex = -1;
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
    labelSpan.dataset.chipLabelFor = targetP.id;
    labelSpan.dataset.chipLabelIdx = String(targetEntry.i);
    labelSpan.textContent = participantShortLabel(targetP, targetEntry.i);

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.tabIndex = -1;
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
    picker.tabIndex = -1;
    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = t(placeholderKey);
    picker.appendChild(defaultOpt);

    for (const { other, otherIdx } of availableOthers) {
      const opt = document.createElement("option");
      opt.value = other.id;
      opt.dataset.optFor = other.id;
      opt.dataset.optIdx = String(otherIdx);
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

function refreshParticipantLabelsInPlace(participant, idx) {
  if (!els.participantsTbody) return;
  const fullLabel = participantLabel(participant, idx);
  const shortLabel = participantShortLabel(participant, idx);
  for (const opt of els.participantsTbody.querySelectorAll(`option[data-opt-for="${participant.id}"]`)) {
    opt.textContent = fullLabel;
  }
  for (const span of els.participantsTbody.querySelectorAll(`span[data-chip-label-for="${participant.id}"]`)) {
    span.textContent = shortLabel;
  }
  renderRecoveryControls();
}

function focusParticipantInput(rowIdx, colName) {
  if (!els.participantsTbody) return false;
  const target = els.participantsTbody.querySelector(
    `input[data-row-idx="${rowIdx}"][data-col="${colName}"]`
  );
  if (target) {
    target.focus();
    target.select?.();
    return true;
  }
  return false;
}

function removeParticipantAt(preset, idx) {
  const removed = preset.participants[idx];
  if (!removed) return;
  const removedId = removed.id;
  preset.participants.splice(idx, 1);
  for (const other of preset.participants) {
    if (Array.isArray(other.excludeReceivers)) {
      other.excludeReceivers = other.excludeReceivers.filter((id) => id !== removedId);
    }
    if (Array.isArray(other.excludeCoGivers)) {
      other.excludeCoGivers = other.excludeCoGivers.filter((id) => id !== removedId);
    }
  }
}

function renderActivePreset() {
  const preset = getActivePreset();
  if (!preset) return;

  renderModeControls();

  if (els.presetNameInput) els.presetNameInput.value = preset.name || "";
  if (els.participantCountBadge) els.participantCountBadge.textContent = String(preset.participants.length);
  if (els.twoWaySyncCheckbox) els.twoWaySyncCheckbox.checked = state.twoWaySync;

  if (els.sampleCountInput) els.sampleCountInput.value = String(preset.rules.sampleCount ?? 3);
  if (els.ruleDuplicateCoGivers) els.ruleDuplicateCoGivers.checked = preset.rules.preventDuplicateCoGiverPairs !== false;
  if (els.ruleDirectReciprocity) els.ruleDirectReciprocity.checked = preset.rules.preventDirectReciprocity === true;
  if (els.enableRecoveryCheckbox) els.enableRecoveryCheckbox.checked = preset.rules.enableRecovery !== false;

  const isEmpty = preset.participants.length === 0;
  if (els.emptyParticipantsBox) els.emptyParticipantsBox.hidden = !isEmpty;
  if (els.participantsTableWrap) els.participantsTableWrap.hidden = isEmpty;
  if (els.clearParticipantsBtn) els.clearParticipantsBtn.disabled = isEmpty;

  renderRecoveryControls();

  if (!els.participantsTbody) return;
  els.participantsTbody.replaceChildren();
  if (isEmpty) return;

  const team = isTeamMode();
  const byId = new Map(preset.participants.map((p, i) => [p.id, { p, i }]));

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

    // Mobile card top bar (person number + remove button)
    const mobileHeader = document.createElement("div");
    mobileHeader.className = "mobile-row-header";
    const mobileTitle = document.createElement("span");
    mobileTitle.className = "mobile-row-title";
    mobileTitle.textContent = t("mobileCardPersonLabel", { n: idx + 1 });
    const mobileRemoveBtn = document.createElement("button");
    mobileRemoveBtn.type = "button";
    mobileRemoveBtn.tabIndex = -1;
    mobileRemoveBtn.className = "btn btn-danger btn-sm";
    mobileRemoveBtn.textContent = `✕ ${t("btnRemoveRowLabel")}`;
    mobileRemoveBtn.addEventListener("click", async () => {
      removeParticipantAt(preset, idx);
      renderPresetSelect();
      renderActivePreset();
      await persistActivePreset();
    });
    mobileHeader.append(mobileTitle, mobileRemoveBtn);

    // Column 1: Email
    const tdEmail = document.createElement("td");
    tdEmail.appendChild(mobileHeader);
    const mobileEmailLabel = document.createElement("span");
    mobileEmailLabel.className = "mobile-field-label";
    mobileEmailLabel.textContent = t("colEmail");
    tdEmail.appendChild(mobileEmailLabel);
    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.dataset.rowIdx = String(idx);
    emailInput.dataset.col = "email";
    emailInput.placeholder = "name@example.org";
    emailInput.value = participant.email || "";
    emailInput.addEventListener("input", () => {
      participant.email = emailInput.value.trim();
      refreshParticipantLabelsInPlace(participant, idx);
      saveSessionDraft();
    });
    emailInput.addEventListener("change", async () => {
      participant.email = emailInput.value.trim();
      refreshParticipantLabelsInPlace(participant, idx);
      await persistActivePreset();
    });
    emailInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        focusParticipantInput(idx, "name");
      }
    });
    tdEmail.appendChild(emailInput);

    // Column 2: Optional Name
    const tdName = document.createElement("td");
    tdName.setAttribute("data-label", t("colName"));
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.dataset.rowIdx = String(idx);
    nameInput.dataset.col = "name";
    nameInput.placeholder = t("namePlaceholder");
    nameInput.maxLength = 40;
    nameInput.value = participant.name || "";
    nameInput.addEventListener("input", () => {
      participant.name = nameInput.value.trim();
      refreshParticipantLabelsInPlace(participant, idx);
      saveSessionDraft();
    });
    nameInput.addEventListener("change", async () => {
      participant.name = nameInput.value.trim();
      refreshParticipantLabelsInPlace(participant, idx);
      await persistActivePreset();
    });
    nameInput.addEventListener("keydown", async (e) => {
      const isLastRow = idx === preset.participants.length - 1;
      if (e.key === "Enter") {
        e.preventDefault();
        if (isLastRow) {
          preset.participants.push({
            id: makeParticipantId(),
            email: "",
            name: "",
            excludeReceivers: [],
            excludeCoGivers: []
          });
          renderPresetSelect();
          renderActivePreset();
          focusParticipantInput(idx + 1, "email");
          await persistActivePreset();
        } else {
          focusParticipantInput(idx + 1, "email");
        }
      } else if (e.key === "Tab" && !e.shiftKey && isLastRow && (participant.email || participant.name)) {
        e.preventDefault();
        preset.participants.push({
          id: makeParticipantId(),
          email: "",
          name: "",
          excludeReceivers: [],
          excludeCoGivers: []
        });
        renderPresetSelect();
        renderActivePreset();
        focusParticipantInput(idx + 1, "email");
        await persistActivePreset();
      }
    });
    tdName.appendChild(nameInput);

    // Column 3: Receiver Exclusions
    const tdExcludeReceivers = buildExcludesCell(
      preset,
      participant,
      byId,
      "excludeReceivers",
      "addExcludeReceiverPlaceholder",
      true,
      "colExcludeReceivers"
    );

    tr.append(tdEmail, tdName, tdExcludeReceivers);

    // Column 4: Co-Giver Exclusions (only in Team mode)
    if (team) {
      const tdExcludeCoGivers = buildExcludesCell(
        preset,
        participant,
        byId,
        "excludeCoGivers",
        "addExcludeCoGiverPlaceholder",
        false,
        "colExcludeCoGivers"
      );
      tr.appendChild(tdExcludeCoGivers);
    }

    // Column 5: Desktop Remove Row Button
    const tdRemove = document.createElement("td");
    tdRemove.className = "col-actions";
    const removeRowBtn = document.createElement("button");
    removeRowBtn.type = "button";
    removeRowBtn.tabIndex = -1;
    removeRowBtn.className = "btn btn-danger btn-sm";
    removeRowBtn.textContent = "✕";
    removeRowBtn.ariaLabel = t("btnRemoveRowLabel");
    removeRowBtn.addEventListener("click", async () => {
      removeParticipantAt(preset, idx);
      renderPresetSelect();
      renderActivePreset();
      await persistActivePreset();
    });
    tdRemove.appendChild(removeRowBtn);

    tr.appendChild(tdRemove);
    els.participantsTbody.appendChild(tr);
  });
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
  thGivers.textContent = t(isTeamMode() ? "tableColGiversTeam" : "tableColGiversClassic");
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
    enableRecovery: !dryRun && Boolean(els.enableRecoveryCheckbox?.checked),
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
      if (data.recoverySeed) {
        preset.lastRecoverySeed = data.recoverySeed;
        if (els.recoverySeedInput) els.recoverySeedInput.value = data.recoverySeed;
        await persistActivePreset();
        renderRecoveryControls();
      } else {
        preset.lastRecoverySeed = "";
        renderRecoveryControls();
      }
      showStatus("success", t("statusLiveSendOk", { count: data.sentCount }));
    }
  } catch (err) {
    showStatus("error", translateError(state.lang, "ERR_NETWORK", err.message));
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function handleGeneratePersonalCode() {
  clearStatus();
  const preset = getActivePreset();
  const seed = els.recoverySeedInput?.value.trim() || "";
  const targetIndex = Number.parseInt(els.recoveryPersonSelect?.value ?? "-1", 10);

  if (els.generateCodeBtn) els.generateCodeBtn.disabled = true;
  try {
    const res = await fetch("/api/recover/code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seed,
        lang: state.lang,
        roundName: preset.name || "",
        targetIndex,
        rules: preset.rules,
        participants: preset.participants
      })
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      showStatus("error", translateError(state.lang, data.errorCode || "ERR_BAD_JSON", data.detail));
      return;
    }

    state.lastGeneratedPersonalCode = data.code;
    if (els.generatedCodeBox && els.generatedCodeText && els.generatedCodeForLabel) {
      els.generatedCodeForLabel.textContent = t("generatedCodeLabel", { person: data.giver });
      els.generatedCodeText.textContent = data.code;
      els.generatedCodeBox.hidden = false;
    }
    showStatus("success", t("statusCodeCreated", { giver: data.giver }));
  } catch (err) {
    showStatus("error", translateError(state.lang, "ERR_NETWORK", err.message));
  } finally {
    if (els.generateCodeBtn) els.generateCodeBtn.disabled = false;
  }
}

async function handleResendSingleEmail() {
  clearStatus();
  const preset = getActivePreset();
  const seed = els.recoverySeedInput?.value.trim() || "";
  const targetIndex = Number.parseInt(els.recoveryPersonSelect?.value ?? "-1", 10);
  const overrideEmail = els.recoveryOverrideEmailInput?.value.trim() || "";

  if (els.resendSingleEmailBtn) els.resendSingleEmailBtn.disabled = true;
  try {
    const res = await fetch("/api/recover/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        passcode: els.passcodeInput?.value || "",
        seed,
        lang: state.lang,
        targetIndex,
        overrideEmail,
        rules: preset.rules,
        participants: preset.participants
      })
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      showStatus("error", translateError(state.lang, data.errorCode || "ERR_BAD_JSON", data.detail));
      return;
    }

    showStatus("success", t("statusResendOk", { giver: data.giver, email: data.sentTo }));
  } catch (err) {
    showStatus("error", translateError(state.lang, "ERR_NETWORK", err.message));
  } finally {
    if (els.resendSingleEmailBtn) els.resendSingleEmailBtn.disabled = false;
  }
}

async function redeemPersonalCode(rawCode) {
  clearStatus();
  if (!rawCode || !rawCode.trim()) return;
  if (els.redeemSubmitBtn) els.redeemSubmitBtn.disabled = true;
  try {
    const res = await fetch("/api/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: rawCode.trim() })
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      if (els.redeemResultBox) els.redeemResultBox.hidden = true;
      showStatus("error", translateError(state.lang, data.errorCode || "ERR_INVALID_CODE", data.detail));
      return;
    }

    if (!els.redeemResultBox) return;
    els.redeemResultBox.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = t("redeemResultHeading");

    const meta = document.createElement("div");
    meta.className = "redeem-meta";
    const parts = [`${t("redeemForLabel")} ${data.giver}`];
    if (data.roundName) parts.push(`${t("redeemRoundLabel")} ${data.roundName}`);
    meta.textContent = parts.join(" · ");

    const pre = document.createElement("pre");
    pre.className = "mail-preview-body";
    pre.textContent = data.body;

    els.redeemResultBox.append(heading, meta, pre);
    els.redeemResultBox.hidden = false;
  } catch (err) {
    showStatus("error", translateError(state.lang, "ERR_NETWORK", err.message));
  } finally {
    if (els.redeemSubmitBtn) els.redeemSubmitBtn.disabled = false;
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

async function setGiverGroupSize(newSize) {
  const preset = getActivePreset();
  const prevSize = preset.rules.giverGroupSize || 1;
  preset.rules.giverGroupSize = newSize;
  if (newSize === 1 && prevSize >= 2) {
    preset.rules.preventDirectReciprocity = true;
  } else if (newSize >= 2 && prevSize === 1) {
    preset.rules.preventDirectReciprocity = false;
  }
  state.samples = [];
  state.dryRunMeta = null;
  renderActivePreset();
  renderDryRunResults();
  await persistActivePreset();
}

async function addBlankParticipantAndFocus() {
  const preset = getActivePreset();
  preset.participants.push({
    id: makeParticipantId(),
    email: "",
    name: "",
    excludeReceivers: [],
    excludeCoGivers: []
  });
  renderPresetSelect();
  renderActivePreset();
  focusParticipantInput(preset.participants.length - 1, "email");
  await persistActivePreset();
}

async function loadModeExample() {
  const preset = getActivePreset();
  const example = isTeamMode() ? EXAMPLE_PARTICIPANTS_TEAM : EXAMPLE_PARTICIPANTS_CLASSIC;
  preset.participants = structuredClone(example);
  state.samples = [];
  state.dryRunMeta = null;
  if (els.generatedCodeBox) els.generatedCodeBox.hidden = true;
  renderPresetSelect();
  renderActivePreset();
  renderDryRunResults();
  showStatus("success", t("statusLoadedExample"));
  await persistActivePreset();
}

function checkUrlRedeemHash() {
  const hash = window.location.hash || "";
  if (hash.includes("code=")) {
    const idx = hash.lastIndexOf("code=");
    const code = decodeURIComponent(hash.slice(idx + 5).split("&")[0].trim());
    if (code && els.redeemSection && els.redeemCodeInput) {
      els.redeemSection.hidden = false;
      els.redeemCodeInput.value = code;
      redeemPersonalCode(code);
      els.redeemSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
}

function bindEvents() {
  els.langSelect?.addEventListener("change", () => {
    state.lang = els.langSelect.value;
    localStorage.setItem("wichteln_lang", state.lang);
    applyTranslations();
  });

  // Personal Code Redeem Section
  els.openRedeemBtn?.addEventListener("click", () => {
    if (!els.redeemSection) return;
    els.redeemSection.hidden = !els.redeemSection.hidden;
    if (!els.redeemSection.hidden) {
      els.redeemCodeInput?.focus();
    }
  });

  els.closeRedeemBtn?.addEventListener("click", () => {
    if (els.redeemSection) els.redeemSection.hidden = true;
  });

  els.redeemForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    redeemPersonalCode(els.redeemCodeInput?.value || "");
  });

  window.addEventListener("hashchange", checkUrlRedeemHash);

  // Mode Selector Cards
  els.modeCard1?.addEventListener("click", () => setGiverGroupSize(1));
  els.modeCard2?.addEventListener("click", () => setGiverGroupSize(2));
  els.modeCardMore?.addEventListener("click", () => {
    const selected = Number.parseInt(els.giverGroupSizeSelect?.value || "3", 10) || 3;
    setGiverGroupSize(Math.max(3, Math.min(5, selected)));
  });
  els.giverGroupSizeSelect?.addEventListener("change", () => {
    const selected = Number.parseInt(els.giverGroupSizeSelect.value, 10) || 3;
    setGiverGroupSize(Math.max(3, Math.min(5, selected)));
  });

  els.twoWaySyncCheckbox?.addEventListener("change", () => {
    state.twoWaySync = els.twoWaySyncCheckbox.checked;
    localStorage.setItem("wichteln_twoway_sync", String(state.twoWaySync));
  });

  // Saved Rounds (Presets)
  els.presetSelect?.addEventListener("change", () => {
    const chosenId = els.presetSelect.value;
    if (!chosenId) {
      state.currentRound = createEmptyDraft();
    } else {
      const found = state.savedPresets.find((p) => p.id === chosenId);
      if (found) {
        state.currentRound = structuredClone(found);
      }
    }
    state.samples = [];
    state.dryRunMeta = null;
    if (els.generatedCodeBox) els.generatedCodeBox.hidden = true;
    if (els.recoverySeedInput) els.recoverySeedInput.value = state.currentRound.lastRecoverySeed || "";
    saveSessionDraft();
    renderPresetSelect();
    renderActivePreset();
    renderDryRunResults();
    clearStatus();
  });

  els.presetNameInput?.addEventListener("input", () => {
    state.currentRound.name = els.presetNameInput.value;
    saveSessionDraft();
  });

  els.presetNameInput?.addEventListener("change", async () => {
    state.currentRound.name = els.presetNameInput.value.trim();
    renderPresetSelect();
    await persistActivePreset();
  });

  els.savePresetBtn?.addEventListener("click", async () => {
    state.userModified = true;
    const round = state.currentRound;
    if (!round.id) {
      round.id = `preset-${Date.now()}`;
    }
    if (!round.name.trim()) {
      round.name = t("newPresetDefaultName");
    }
    await persistActivePreset();
    renderPresetSelect();
    renderActivePreset();
    showStatus("success", t("statusSavedPreset", { name: round.name }));
  });

  els.newPresetBtn?.addEventListener("click", () => {
    state.userModified = true;
    state.currentRound = createEmptyDraft();
    state.samples = [];
    state.dryRunMeta = null;
    if (els.generatedCodeBox) els.generatedCodeBox.hidden = true;
    if (els.recoverySeedInput) els.recoverySeedInput.value = "";
    saveSessionDraft();
    renderPresetSelect();
    renderActivePreset();
    renderDryRunResults();
    clearStatus();
  });

  els.duplicatePresetBtn?.addEventListener("click", async () => {
    state.userModified = true;
    const copy = structuredClone(state.currentRound);
    copy.id = `preset-${Date.now()}`;
    copy.name = `${copy.name || t("newPresetDefaultName")}${t("copySuffix")}`;
    copy.lastRecoverySeed = "";
    state.currentRound = copy;
    await persistActivePreset();
    renderPresetSelect();
    renderActivePreset();
  });

  els.deletePresetBtn?.addEventListener("click", async () => {
    state.userModified = true;
    const idToDelete = state.currentRound.id;
    if (!idToDelete) return;
    state.savedPresets = state.savedPresets.filter((p) => p.id !== idToDelete);
    state.currentRound = createEmptyDraft();
    state.samples = [];
    state.dryRunMeta = null;
    if (els.recoverySeedInput) els.recoverySeedInput.value = "";
    saveSessionDraft();
    renderPresetSelect();
    renderActivePreset();
    renderDryRunResults();
    await deletePresetById(idToDelete);
  });

  els.exportJsonBtn?.addEventListener("click", () => {
    const exportList = state.currentRound.id
      ? state.savedPresets
      : [...state.savedPresets, { ...state.currentRound, id: `draft-${Date.now()}` }];
    const blob = new Blob([JSON.stringify(exportList, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wichteln-backup.json";
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
      let lastImported = null;
      for (const item of list) {
        if (item && Array.isArray(item.participants)) {
          const preset = normalizePreset({
            id: item.id || `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: item.name || t("newPresetDefaultName"),
            lastRecoverySeed: item.lastRecoverySeed || "",
            rules: item.rules || { giverGroupSize: 1, sampleCount: 3 },
            participants: item.participants
          });
          await savePreset(preset);
          lastImported = preset;
        }
      }
      state.savedPresets = await loadAllPresets();
      if (lastImported) {
        state.currentRound = structuredClone(lastImported);
        saveSessionDraft();
      }
      renderPresetSelect();
      renderActivePreset();
      showStatus("success", t("statusImportOk"));
    } catch (err) {
      showStatus("error", translateError(state.lang, "ERR_BAD_JSON", err.message));
    } finally {
      els.importJsonInput.value = "";
    }
  });

  // Participant Actions
  els.addParticipantBtn?.addEventListener("click", addBlankParticipantAndFocus);
  els.emptyAddFirstBtn?.addEventListener("click", addBlankParticipantAndFocus);
  els.loadExampleBtn?.addEventListener("click", loadModeExample);
  els.emptyLoadExampleBtn?.addEventListener("click", loadModeExample);

  els.clearParticipantsBtn?.addEventListener("click", async () => {
    const preset = getActivePreset();
    preset.participants = [];
    state.samples = [];
    state.dryRunMeta = null;
    if (els.generatedCodeBox) els.generatedCodeBox.hidden = true;
    renderPresetSelect();
    renderActivePreset();
    renderDryRunResults();
    showStatus("success", t("statusClearedParticipants"));
    await persistActivePreset();
  });

  els.toggleBulkBtn?.addEventListener("click", () => {
    if (!els.bulkAddDrawer) return;
    els.bulkAddDrawer.hidden = !els.bulkAddDrawer.hidden;
    if (!els.bulkAddDrawer.hidden) {
      els.bulkAddTextarea?.focus();
    }
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

  // Rules & Recovery Checkboxes
  const syncRules = async () => {
    const preset = getActivePreset();
    preset.rules = {
      ...preset.rules,
      sampleCount: Math.max(1, Math.min(10, Number.parseInt(els.sampleCountInput?.value, 10) || 3)),
      preventDuplicateCoGiverPairs: Boolean(els.ruleDuplicateCoGivers?.checked),
      preventDirectReciprocity: Boolean(els.ruleDirectReciprocity?.checked),
      enableRecovery: Boolean(els.enableRecoveryCheckbox?.checked)
    };
    await persistActivePreset();
  };

  els.sampleCountInput?.addEventListener("change", syncRules);
  els.ruleDuplicateCoGivers?.addEventListener("change", syncRules);
  els.ruleDirectReciprocity?.addEventListener("change", syncRules);
  els.enableRecoveryCheckbox?.addEventListener("change", syncRules);

  // Dry-Run & Live Send
  els.runDryRunBtn?.addEventListener("click", () => callDrawApi(true));
  els.liveSendForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    callDrawApi(false);
  });

  // Seed Copy & Recovery Actions
  els.copySeedBtn?.addEventListener("click", () => {
    copyTextWithFeedback(els.copySeedBtn, state.currentRound.lastRecoverySeed, "btnCopySeed");
  });

  els.generateCodeBtn?.addEventListener("click", handleGeneratePersonalCode);
  els.resendSingleEmailBtn?.addEventListener("click", handleResendSingleEmail);

  els.copyPersonalCodeBtn?.addEventListener("click", () => {
    copyTextWithFeedback(els.copyPersonalCodeBtn, state.lastGeneratedPersonalCode, "btnCopyPersonalCode");
  });

  els.copyPersonalLinkBtn?.addEventListener("click", () => {
    if (!state.lastGeneratedPersonalCode) return;
    const link = `${window.location.origin}${window.location.pathname}#code=${encodeURIComponent(
      state.lastGeneratedPersonalCode
    )}`;
    copyTextWithFeedback(els.copyPersonalLinkBtn, link, "btnCopyPersonalLink");
  });
}

async function init() {
  bindEvents();
  renderLanguageSelect();
  applyTranslations();
  checkUrlRedeemHash();

  const loadedPresets = await loadAllPresets();
  state.savedPresets = loadedPresets;
  renderPresetSelect();

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
