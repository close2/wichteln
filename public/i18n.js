// Multi-language dictionary for the frontend UI.

export const I18N = {
  de: {
    appTitle: "Wichteln / Engerl-Bengerl",
    appSubtitle: "Team- & Klassisches Wichteln",
    uiLanguageLabel: "Sprache / Mail-Text:",
    presetsTitle: "Gespeicherte Runden (Presets)",
    btnNewPreset: "+ Neue Runde",
    btnDuplicate: "Duplizieren",
    btnExport: "Export JSON",
    btnImport: "Import JSON",
    btnDelete: "Löschen",
    selectPresetLabel: "Aktive Runde",
    presetNameLabel: "Name der Runde",
    participantsTitle: "Teilnehmer",
    participantsHint: "E-Mail-Adresse genügt (Name ist optional und dient nur der Anzeige in der Mail).",
    btnLoadExample: "Beispieldaten",
    btnClearAll: "Alle leeren",
    btnBulkAdd: "Liste einfügen",
    btnAddParticipant: "+ Zeile",
    explainReceiverGroupTitle: "🚫 Beschenken sich nicht (Gruppenname):",
    explainReceiverGroupText:
      "Trage denselben Gruppennamen (z.B. „Paar1“) bei zwei oder mehr Personen ein, damit sie sich nicht gegenseitig beschenken (sie dürfen aber trotzdem gemeinsam für jemand anderen ein Geschenk organisieren).",
    explainCoGiverGroupTitle: "🤝 Kein Schenk-Team (Gruppenname):",
    explainCoGiverGroupText:
      "Trage denselben Gruppennamen (z.B. „TeamX“) bei Personen ein, die bei k ≥ 2 nicht zusammen in dasselbe Schenk-Team gelost werden sollen. Mehrere Gruppennamen einfach mit Komma trennen.",
    bulkAddHelp:
      "E-Mail-Adressen (komma- oder zeilengetrennt, oder Format: email, Name, NichtBeschenkenGruppe1|2, KeinTeamGruppe1|2)",
    btnApplyBulk: "Hinzufügen",
    btnCancel: "Abbrechen",
    colEmail: "E-Mail-Adresse *",
    colName: "Name (optional)",
    colReceiverGroups: "Beschenken sich nicht",
    colCoGiverGroups: "Kein Schenk-Team",
    tooltipColName: "Wird in der E-Mail-Anrede und Zuordnung angezeigt. Wenn leer, wird die E-Mail-Adresse verwendet.",
    tooltipColReceiverGroups:
      "Gleicher Gruppenname (z.B. Paar1) = diese Personen beschenken sich nicht gegenseitig. Mehrere Gruppen mit Komma trennen.",
    tooltipColCoGiverGroups:
      "Gleicher Gruppenname (z.B. WG1) = diese Personen bilden bei k ≥ 2 kein gemeinsames Schenk-Team. Mehrere Gruppen mit Komma trennen.",
    placeholderReceiverGroups: "z.B. Paar1",
    placeholderCoGiverGroups: "z.B. TeamA",
    rulesTitle: "Regeln & Optionen",
    ruleGiverGroupSize: "Schenkende pro Geschenk (k)",
    tooltipGiverGroupSize:
      "Wie viele Personen legen für ein Geschenk zusammen? Gleichzeitig beteiligt sich jede Person an k Geschenken.",
    ruleGiverGroupSizeHelp:
      "k=1: Klassisches Wichteln (1:1) · k=2: Engerl-Bengerl zu zweit (jeder schenkt 2× im Team und bekommt 1 Geschenk)",
    ruleSampleCount: "Anzahl Dry-Run-Beispiele",
    tooltipSampleCount: "Berechnet mehrere unterschiedliche gültige Ziehungen zur Vorschau.",
    ruleSampleCountHelp: "Wie viele verschiedene zufällige Ziehungen beim Dry-Run angezeigt werden",
    ruleDuplicateCoTitle: "Keine doppelten Schenk-Teams (bei k ≥ 2 empfohlen)",
    ruleDuplicateCoDesc:
      "Verhindert, dass exakt dieselben zwei Personen {A, B} gleich zweimal zusammen für verschiedene Empfänger schenken müssen.",
    ruleReciprocityTitle: "Keine direkte Gegenseitigkeit (A ↔ B, für k = 1)",
    ruleReciprocityDesc:
      "Wenn Person A an Person B schenkt, darf B nicht gleichzeitig an A schenken (vor allem beim klassischen 1:1-Wichteln sinnvoll).",
    dryRunTitle: "1. Dry-Run (Test-Ziehung prüfen)",
    dryRunHint: "Berechnet Beispiel-Ziehungen am Server und zeigt die E-Mail-Vorschau, ohne E-Mails zu versenden.",
    btnRunDryRun: "Dry-Run starten",
    dryRunEmpty: "Noch kein Dry-Run ausgeführt. Klicke auf „Dry-Run starten“, um zufällige Ziehungen zu prüfen.",
    liveSendTitle: "2. Echte Ziehung & E-Mail-Versand",
    liveSendHint:
      "Das Backend zieht eine neue geheime Zuordnung und verschickt die E-Mails direkt. Die Zuordnung wird nicht an den Browser übertragen.",
    passcodeLabel: "Server-Passcode",
    btnSendEmails: "Geheim auslosen & Mails senden",
    sampleTabLabel: "Ziehung #{n}",
    tableColReceiver: "Beschenkte Person (Empfänger)",
    tableColGivers: "Schenk-Team (Geber)",
    mailPreviewSummary: "E-Mail-Vorschau ({count} Mails)",
    confirmDeletePreset: "Soll diese gespeicherte Runde wirklich gelöscht werden?",
    confirmClearParticipants: "Alle Teilnehmer in dieser Runde leeren?",
    confirmLoadExample: "Aktuelle Teilnehmerliste durch die Beispieldaten ersetzen?",
    confirmLiveSend: "Jetzt geheim auslosen und echte E-Mails an {count} Teilnehmer senden?",
    statusDryRunOk: "{count} eindeutige Beispiel-Ziehung(en) erfolgreich berechnet.",
    warnOnlyOneSolution:
      "⚠️ Achtung: Durch die engen Ausschlussgruppen existiert mathematisch NUR EINE EINZIGE gültige Lösung! Die Ziehung ist dadurch komplett vorhersehbar (nicht geheim).",
    warnFewSolutions:
      "⚠️ Hinweis: Es existieren insgesamt nur {unique} verschiedene gültige Lösungen (angefordert: {requested}).",
    warnForcedReceivers:
      "⚠️ Hinweis: Folgende Empfänger erhalten in allen gezogenen Lösungen exakt dasselbe Schenk-Team: {receivers}",
    statusLiveSendOk: "Erfolg! {count} E-Mails wurden geheim ausgelost und versendet.",
    statusImportOk: "Runden erfolgreich importiert.",
    newPresetDefaultName: "Neue Wichtelrunde",
    copySuffix: " (Kopie)",
    errors: {
      ERR_BAD_JSON: "Ungültige Anfrage-Daten.",
      ERR_INVALID_LANG: "Gewählte Sprache wird vom Server nicht unterstützt.",
      ERR_INVALID_RULES: "Ungültige Regel-Einstellungen (k muss kleiner als die Teilnehmerzahl sein).",
      ERR_PARTICIPANT_COUNT: "Zu wenige oder zu viele Teilnehmer (mindestens 3 erforderlich).",
      ERR_INVALID_EMAIL: "Mindestens eine E-Mail-Adresse fehlt oder ist ungültig.",
      ERR_INVALID_NAME: "Ungültiger Name oder Gruppenname (keine URLs oder Sonderzeichen wie @, :, / erlaubt).",
      ERR_DUPLICATE_PARTICIPANT: "Doppelte E-Mail-Adresse oder doppelter Name gefunden.",
      ERR_AUTH_FAILED: "Falscher Server-Passcode.",
      ERR_PAYLOAD_TOO_LARGE: "Anfrage ist zu groß.",
      ERR_UNSATISFIABLE:
        "Keine gültige Ziehung möglich! Bitte lockere die Optionen oder prüfe die eingetragenen Gruppennamen.",
      ERR_RATE_LIMITED: "Zu viele Versuche. Bitte warte einige Minuten.",
      ERR_SMTP_FAILED: "E-Mail-Versand über den SMTP-Server fehlgeschlagen.",
      ERR_NETWORK: "Verbindung zum Backend fehlgeschlagen."
    }
  },
  en: {
    appTitle: "Secret Santa / Engerl-Bengerl",
    appSubtitle: "Team & Classic Secret Santa",
    uiLanguageLabel: "Language / Mail Text:",
    presetsTitle: "Saved Rounds (Presets)",
    btnNewPreset: "+ New Round",
    btnDuplicate: "Duplicate",
    btnExport: "Export JSON",
    btnImport: "Import JSON",
    btnDelete: "Delete",
    selectPresetLabel: "Active Round",
    presetNameLabel: "Round Name",
    participantsTitle: "Participants",
    participantsHint: "Email address is enough (Name is optional and only used as the display label in the email).",
    btnLoadExample: "Load Example",
    btnClearAll: "Clear All",
    btnBulkAdd: "Paste List",
    btnAddParticipant: "+ Row",
    explainReceiverGroupTitle: "🚫 Do Not Gift Each Other (Group Name):",
    explainReceiverGroupText:
      "Enter the same group name (e.g. 'Couple1') for two or more people so they won't draw each other as gift receivers (they may still co-organize a gift for someone else).",
    explainCoGiverGroupTitle: "🤝 No Giving Team Together (Group Name):",
    explainCoGiverGroupText:
      "Enter the same group name (e.g. 'TeamX') for people who should not be paired together on the same giving team when k ≥ 2. Separate multiple group names with commas.",
    bulkAddHelp:
      "Email addresses (comma- or line-separated, or format: email, Name, NoGiftGroup1|2, NoTeamGroup1|2)",
    btnApplyBulk: "Add",
    btnCancel: "Cancel",
    colEmail: "Email Address *",
    colName: "Name (optional)",
    colReceiverGroups: "Do Not Gift (Groups)",
    colCoGiverGroups: "No Giving Team (Groups)",
    tooltipColName: "Displayed in the email greeting and assignment lines. Falls back to the email address if left empty.",
    tooltipColReceiverGroups:
      "Same group name (e.g. Couple1) = these people will not gift each other. Separate multiple groups with commas.",
    tooltipColCoGiverGroups:
      "Same group name (e.g. Roommates) = these people will not be placed on the same giving team when k ≥ 2. Separate multiple groups with commas.",
    placeholderReceiverGroups: "e.g. Couple1",
    placeholderCoGiverGroups: "e.g. TeamA",
    rulesTitle: "Rules & Options",
    ruleGiverGroupSize: "Givers per Gift (k)",
    tooltipGiverGroupSize:
      "How many people team up to buy one gift? Each participant also takes part in k giving teams.",
    ruleGiverGroupSizeHelp:
      "k=1: Classic 1-on-1 Secret Santa · k=2: Team of 2 givers per receiver (each person gives 2 gifts in teams and receives 1)",
    ruleSampleCount: "Dry-Run Sample Count",
    tooltipSampleCount: "Calculates multiple distinct valid draws for preview.",
    ruleSampleCountHelp: "Number of distinct random draws shown during a dry-run",
    ruleDuplicateCoTitle: "No duplicate giving teams (recommended for k ≥ 2)",
    ruleDuplicateCoDesc:
      "Prevents the exact same pair {A, B} from being teamed up twice for two different receivers.",
    ruleReciprocityTitle: "No direct reciprocity (A ↔ B, for k = 1)",
    ruleReciprocityDesc:
      "If person A gifts person B, B cannot simultaneously gift A (mainly useful for classic 1-on-1 Secret Santa).",
    dryRunTitle: "1. Dry-Run (Test & Verify Mappings)",
    dryRunHint: "Calculates sample draws on the backend and previews the emails without sending anything.",
    btnRunDryRun: "Run Dry-Run",
    dryRunEmpty: "No dry-run executed yet. Click 'Run Dry-Run' to inspect sample mappings.",
    liveSendTitle: "2. Secret Draw & Send Emails",
    liveSendHint:
      "The backend computes a fresh secret draw and sends the emails directly without returning the mapping to the browser.",
    passcodeLabel: "Server Passcode",
    btnSendEmails: "Draw Secretly & Send Emails",
    sampleTabLabel: "Sample #{n}",
    tableColReceiver: "Receiver",
    tableColGivers: "Giver Team",
    mailPreviewSummary: "Email Previews ({count} emails)",
    confirmDeletePreset: "Are you sure you want to delete this saved round?",
    confirmClearParticipants: "Clear all participants in this round?",
    confirmLoadExample: "Replace the current participant list with example participants?",
    confirmLiveSend: "Run the secret draw now and send real emails to {count} participants?",
    statusDryRunOk: "Successfully generated {count} distinct sample draw(s).",
    warnOnlyOneSolution:
      "⚠️ Warning: Due to tight exclusion groups, ONLY ONE valid solution exists mathematically! The draw is completely deterministic (not secret).",
    warnFewSolutions: "⚠️ Note: Only {unique} distinct valid solutions exist in total (requested: {requested}).",
    warnForcedReceivers:
      "⚠️ Note: The following receivers were assigned the exact same giver team across all samples: {receivers}",
    statusLiveSendOk: "Success! {count} secret emails were generated and sent.",
    statusImportOk: "Rounds imported successfully.",
    newPresetDefaultName: "New Secret Santa Round",
    copySuffix: " (Copy)",
    errors: {
      ERR_BAD_JSON: "Malformed request payload.",
      ERR_INVALID_LANG: "Selected language is not supported by the server.",
      ERR_INVALID_RULES: "Invalid rule settings (k must be smaller than participant count).",
      ERR_PARTICIPANT_COUNT: "Too few or too many participants (minimum 3 required).",
      ERR_INVALID_EMAIL: "One or more email addresses are missing or invalid.",
      ERR_INVALID_NAME: "Invalid participant name or group name (no URLs or special chars like @, :, / allowed).",
      ERR_DUPLICATE_PARTICIPANT: "Duplicate email address or participant label found.",
      ERR_AUTH_FAILED: "Invalid server passcode.",
      ERR_PAYLOAD_TOO_LARGE: "Request payload is too large.",
      ERR_UNSATISFIABLE:
        "No valid assignment possible! Please relax options or check your exclusion group names.",
      ERR_RATE_LIMITED: "Too many requests. Please wait a few minutes.",
      ERR_SMTP_FAILED: "Failed to send emails via SMTP server.",
      ERR_NETWORK: "Could not reach backend server."
    }
  }
};

export function translate(lang, key, vars = {}) {
  const pack = I18N[lang] || I18N.de;
  let str = pack[key] ?? I18N.de[key] ?? key;
  for (const [k, v] of Object.entries(vars)) {
    str = str.replaceAll(`{${k}}`, String(v));
  }
  return str;
}

export function translateError(lang, errorCode, detail = "") {
  const pack = I18N[lang] || I18N.de;
  const base = pack.errors?.[errorCode] || I18N.de.errors?.[errorCode] || errorCode;
  return detail ? `${base} (${detail})` : base;
}
