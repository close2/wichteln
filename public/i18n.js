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
    presetFriendsName: "Engerl-Bengerl (Beispiel mit 9 Personen)",
    presetClassicName: "Klassisches Wichteln (Beispiel mit 5 Personen)",
    participantsTitle: "Teilnehmer",
    participantsHint: "E-Mail-Adresse genügt (Name ist optional und dient nur der Anzeige in der Mail).",
    btnLoadExample: "Beispieldaten",
    btnClearAll: "Alle leeren",
    btnBulkAdd: "Liste einfügen",
    btnAddParticipant: "+ Zeile",
    explainReceiverTitle: "🚫 Schenkt nicht an (Empfänger-Ausschluss):",
    explainReceiverText:
      "Wähle direkt die Personen aus, die von dieser Person kein Geschenk erhalten sollen (z.B. Partner). Sie dürfen aber trotzdem gemeinsam für eine dritte Person ein Geschenk organisieren.",
    explainCoGiverTitle: "🤝 Kein Schenk-Team mit (Co-Schenker-Ausschluss):",
    explainCoGiverText:
      "Wähle Personen aus, mit denen diese Person bei k ≥ 2 nicht zusammen in dasselbe Schenk-Team gelost werden soll.",
    // Legacy aliases for backwards compatibility with any cached HTML
    explainReceiverGroupTitle: "🚫 Schenkt nicht an (Empfänger-Ausschluss):",
    explainReceiverGroupText:
      "Wähle direkt die Personen aus, die von dieser Person kein Geschenk erhalten sollen (z.B. Partner). Sie dürfen aber trotzdem gemeinsam für eine dritte Person ein Geschenk organisieren.",
    explainCoGiverGroupTitle: "🤝 Kein Schenk-Team mit (Co-Schenker-Ausschluss):",
    explainCoGiverGroupText:
      "Wähle Personen aus, mit denen diese Person bei k ≥ 2 nicht zusammen in dasselbe Schenk-Team gelost werden soll.",
    twoWaySyncLabel: "„Schenkt nicht an“ standardmäßig beidseitig eintragen (↔ Paare)",
    twoWaySyncHint:
      "Tipp: Klicke auf ↔ / → in einem Tag, um jederzeit zwischen beidseitig (↔) und einseitig (→) zu wechseln.",
    bulkAddHelp: "E-Mail-Adressen (komma- oder zeilengetrennt, oder Format: email, Name)",
    btnApplyBulk: "Hinzufügen",
    btnCancel: "Abbrechen",
    colEmail: "E-Mail-Adresse *",
    colName: "Name (optional)",
    namePlaceholder: "Optional",
    colExcludeReceivers: "Schenkt nicht an",
    colExcludeCoGivers: "Kein Schenk-Team mit",
    colReceiverGroups: "Schenkt nicht an",
    colCoGiverGroups: "Kein Schenk-Team mit",
    tooltipColName: "Wird in der E-Mail-Anrede und Zuordnung angezeigt. Wenn leer, wird die E-Mail-Adresse verwendet.",
    tooltipColExcludeReceivers:
      "Personen auswählen, die diese Person nicht beschenken soll. ↔ = gegenseitig (Paar), → = nur einseitig (per Klick umschaltbar).",
    tooltipColExcludeCoGivers:
      "Personen auswählen, mit denen diese Person bei k ≥ 2 kein gemeinsames Schenk-Team bilden soll.",
    tooltipColReceiverGroups:
      "Personen auswählen, die diese Person nicht beschenken soll. ↔ = gegenseitig (Paar), → = nur einseitig (per Klick umschaltbar).",
    tooltipColCoGiverGroups:
      "Personen auswählen, mit denen diese Person bei k ≥ 2 kein gemeinsames Schenk-Team bilden soll.",
    addExcludeReceiverPlaceholder: "+ Nicht beschenken…",
    addExcludeCoGiverPlaceholder: "+ Kein Team mit…",
    dirTwoWayTitle: "Beidseitiger Ausschluss (klicken für einseitig →)",
    dirOneWayTitle: "Einseitiger Ausschluss: schenkt nicht an diese Person (klicken für beidseitig ↔)",
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
    statusLoadedExample: "Beispieldaten wurden geladen.",
    statusClearedParticipants: "Teilnehmerliste wurde geleert.",
    warnOnlyOneSolution:
      "⚠️ Achtung: Durch die engen Ausschlüsse existiert mathematisch NUR EINE EINZIGE gültige Lösung! Die Ziehung ist dadurch komplett vorhersehbar (nicht geheim).",
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
      ERR_INVALID_NAME: "Ungültiger Name (keine URLs oder Sonderzeichen wie @, :, / erlaubt).",
      ERR_DUPLICATE_PARTICIPANT: "Doppelte E-Mail-Adresse oder doppelter Name gefunden.",
      ERR_AUTH_FAILED: "Falscher Server-Passcode.",
      ERR_PAYLOAD_TOO_LARGE: "Anfrage ist zu groß.",
      ERR_UNSATISFIABLE:
        "Keine gültige Ziehung möglich! Bitte lockere die Optionen oder prüfe die eingetragenen Ausschlüsse.",
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
    presetFriendsName: "Engerl-Bengerl (Example with 9 People)",
    presetClassicName: "Classic Secret Santa (Example with 5 People)",
    participantsTitle: "Participants",
    participantsHint: "Email address is enough (Name is optional and only used as the display label in the email).",
    btnLoadExample: "Load Example",
    btnClearAll: "Clear All",
    btnBulkAdd: "Paste List",
    btnAddParticipant: "+ Row",
    explainReceiverTitle: "🚫 Does Not Gift (Receiver Exclusion):",
    explainReceiverText:
      "Pick people this participant should not buy a gift for (e.g. partner). They are still allowed to co-organize a gift together for a third person.",
    explainCoGiverTitle: "🤝 Not on Team With (Co-Giver Exclusion):",
    explainCoGiverText:
      "Pick people this participant should not be paired with on the same giving team when k ≥ 2.",
    // Legacy aliases
    explainReceiverGroupTitle: "🚫 Does Not Gift (Receiver Exclusion):",
    explainReceiverGroupText:
      "Pick people this participant should not buy a gift for (e.g. partner). They are still allowed to co-organize a gift together for a third person.",
    explainCoGiverGroupTitle: "🤝 Not on Team With (Co-Giver Exclusion):",
    explainCoGiverGroupText:
      "Pick people this participant should not be paired with on the same giving team when k ≥ 2.",
    twoWaySyncLabel: "Add 'Does not gift' exclusions two-way by default (↔ Couples)",
    twoWaySyncHint: "Tip: Click ↔ / → on any chip to switch between two-way (↔) and one-way (→) exclusion at any time.",
    bulkAddHelp: "Email addresses (comma- or line-separated, or format: email, Name)",
    btnApplyBulk: "Add",
    btnCancel: "Cancel",
    colEmail: "Email Address *",
    colName: "Name (optional)",
    namePlaceholder: "Optional",
    colExcludeReceivers: "Does Not Gift",
    colExcludeCoGivers: "No Team With",
    colReceiverGroups: "Does Not Gift",
    colCoGiverGroups: "No Team With",
    tooltipColName: "Displayed in the email greeting and assignment lines. Falls back to the email address if left empty.",
    tooltipColExcludeReceivers:
      "Select people this participant must not gift. ↔ = mutual (couple), → = one-way only (click icon to toggle).",
    tooltipColExcludeCoGivers:
      "Select people this participant must not be paired with on the same giving team when k ≥ 2.",
    tooltipColReceiverGroups:
      "Select people this participant must not gift. ↔ = mutual (couple), → = one-way only (click icon to toggle).",
    tooltipColCoGiverGroups:
      "Select people this participant must not be paired with on the same giving team when k ≥ 2.",
    addExcludeReceiverPlaceholder: "+ Don't gift…",
    addExcludeCoGiverPlaceholder: "+ No team with…",
    dirTwoWayTitle: "Two-way exclusion (click to make one-way →)",
    dirOneWayTitle: "One-way exclusion: will not gift this person (click to make two-way ↔)",
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
    tableColReceiver: "Gift Receiver",
    tableColGivers: "Giver Team",
    mailPreviewSummary: "Email Previews ({count} emails)",
    confirmDeletePreset: "Really delete this saved round?",
    confirmClearParticipants: "Clear all participants in this round?",
    confirmLoadExample: "Replace current participants with the example data?",
    confirmLiveSend: "Run secret draw now and send real emails to {count} participants?",
    statusDryRunOk: "Calculated {count} distinct sample draw(s).",
    statusLoadedExample: "Example participants loaded.",
    statusClearedParticipants: "Participant list cleared.",
    warnOnlyOneSolution:
      "⚠️ Warning: Due to tight exclusions, ONLY ONE valid mathematical solution exists! The draw is completely predictable (not secret).",
    warnFewSolutions:
      "⚠️ Note: Only {unique} distinct valid solutions exist in total (requested: {requested}).",
    warnForcedReceivers:
      "⚠️ Note: The following receivers get the exact same giver team in every sampled draw: {receivers}",
    statusLiveSendOk: "Success! {count} emails have been secretly drawn and sent.",
    statusImportOk: "Rounds imported successfully.",
    newPresetDefaultName: "New Secret Santa Round",
    copySuffix: " (Copy)",
    errors: {
      ERR_BAD_JSON: "Invalid request data.",
      ERR_INVALID_LANG: "Selected language is not supported by the server.",
      ERR_INVALID_RULES: "Invalid rule settings (k must be smaller than participant count).",
      ERR_PARTICIPANT_COUNT: "Too few or too many participants (at least 3 required).",
      ERR_INVALID_EMAIL: "At least one email address is missing or invalid.",
      ERR_INVALID_NAME: "Invalid name (no URLs or special characters like @, :, / allowed).",
      ERR_DUPLICATE_PARTICIPANT: "Duplicate email address or duplicate name found.",
      ERR_AUTH_FAILED: "Invalid server passcode.",
      ERR_PAYLOAD_TOO_LARGE: "Request payload is too large.",
      ERR_UNSATISFIABLE:
        "No valid assignment possible! Please relax options or check your exclusions.",
      ERR_RATE_LIMITED: "Too many requests. Please wait a few minutes.",
      ERR_SMTP_FAILED: "Failed to send emails via SMTP server.",
      ERR_NETWORK: "Could not reach backend server."
    }
  }
};

export function translate(lang, key, vars = {}) {
  const pack = I18N[lang] || I18N.de;
  let str = pack[key] ?? I18N.de[key] ?? null;
  if (str === null) return null;
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
