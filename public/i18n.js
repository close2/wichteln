// Beginner-friendly multi-language dictionary (DE / EN) without math jargon.

export const I18N = {
  de: {
    appTitle: "Wichteln & Engerl-Bengerl",
    appSubtitle: "Einfach & geheim auslosen – allein oder im Team",
    uiLanguageLabel: "Sprache & E-Mail-Text:",
    btnOpenRedeemHeader: "🎟️ Code einlösen",

    // Personal Code Redeem Card
    redeemTitle: "🎟️ Persönlichen Wichtel-Code einlösen",
    redeemHint:
      "Du hast keine E-Mail bekommen, aber von der Organisation einen persönlichen Code oder Link erhalten? Gib ihn hier ein – es wird ausschließlich dein eigenes Los angezeigt.",
    redeemInputLabel: "Dein persönlicher Wichtel-Code",
    redeemInputPlaceholder: "WC1-…",
    btnRedeemSubmit: "Mein Los anzeigen",
    btnRedeemClose: "Schließen",
    redeemResultHeading: "🎁 Dein persönliches Wichtel-Los",
    redeemForLabel: "Für:",
    redeemRoundLabel: "Runde:",

    // Stepper Nav
    stepNav1: "1. Runde & Spielart",
    stepNav2: "2. Wer macht mit?",
    stepNav3: "3. Vorschau testen",
    stepNav4: "4. Auslosen & Hilfe",

    // Step 1: Round & Mode
    step1Badge: "Schritt 1",
    step1Title: "Runde benennen & Spielart wählen",
    step1Hint: "Lege fest, wie ihr schenken möchtet, oder öffne eine früher gespeicherte Runde.",
    presetNameLabel: "Name eurer Runde (optional)",
    presetNamePlaceholder: "z.B. Familien-Wichteln oder Büro-Runde",
    selectPresetLabel: "Gespeicherte Runde in diesem Browser öffnen",
    unsavedNewRoundOption: "— Neue leere Runde —",
    presetsStorageNote:
      "Hinweis: Gespeicherte Runden bleiben ausschließlich lokal in deinem Browser (nichts wird auf dem Server gespeichert). Für ein Backup oder ein anderes Gerät kannst du Export/Import nutzen.",
    btnSavePreset: "💾 Runde im Browser merken",
    btnNewPreset: "+ Neue leere Runde",
    btnDuplicate: "Duplizieren",
    btnExport: "Backup speichern",
    btnImport: "Backup laden",
    btnDelete: "Löschen",

    modeHeading: "Wie möchtet ihr wichteln?",
    modeClassicTitle: "Klassisches Wichteln (Allein)",
    modeClassicDesc:
      "Jede Person zieht heimlich genau eine andere Person, besorgt allein ein Geschenk und bekommt am Ende selbst ein Geschenk.",
    modeTeam2Title: "Team-Wichteln / Engerl-Bengerl (Zu zweit)",
    modeTeam2Desc:
      "Immer zwei Personen tun sich heimlich für ein Geschenk zusammen. Jede Person macht bei zwei Geschenken mit und bekommt selbst ein Geschenk.",
    modeTeamMoreTitle: "Größeres Schenk-Team (3–5 Personen)",
    modeTeamMoreDesc:
      "Drei bis fünf Personen legen gemeinsam für ein Geschenk zusammen. Jede Person hilft entsprechend oft mit und bekommt ein Geschenk.",
    modeTeamSizeLabel: "Wie viele Personen schenken gemeinsam pro Geschenk?",
    modeTeamSize3: "3 Personen pro Geschenk",
    modeTeamSize4: "4 Personen pro Geschenk",
    modeTeamSize5: "5 Personen pro Geschenk",
    diagPersonA: "Anna",
    diagPersonB: "Ben",
    diagPersonC: "Clara",
    diagTeamLabel: "Team",

    // Step 2: Participants
    step2Badge: "Schritt 2",
    step2Title: "Wer macht mit?",
    participantsHint:
      "Trage die E-Mail-Adressen aller Mitspielenden ein. Der Name ist freiwillig, macht die Anrede in der E-Mail aber persönlicher.",
    btnAddParticipant: "+ Person hinzufügen",
    btnBulkAdd: "Mehrere einfügen",
    btnLoadExample: "Beispiel füllen",
    btnClearAll: "Liste leeren",

    emptyParticipantsTitle: "Die Teilnehmerliste ist noch leer.",
    emptyParticipantsText:
      "Füge jetzt Schritt für Schritt Personen hinzu, füge eine Liste ein oder probiere es mit Beispieldaten aus.",
    btnEmptyAddFirst: "+ Erste Person eintragen",

    explainReceiverTitle: "Ausnahme: „Beschenkt nicht“ (z.B. für Paare)",
    explainReceiverTextClassic:
      "Wähle hier Personen aus, die diese Person nicht ziehen soll (z.B. den eigenen Partner oder die eigene Partnerin).",
    explainReceiverTextTeam:
      "Wähle Personen aus, für die diese Person kein Geschenk kaufen soll (z.B. Partner/in). Gemeinsam als Duo für eine dritte Person ein Geschenk besorgen dürfen sie aber trotzdem!",
    explainCoGiverTitle: "Ausnahme: „Nicht im selben Team mit“",
    explainCoGiverText:
      "Wähle Personen aus, mit denen diese Person nicht gemeinsam in dasselbe Schenk-Team gesteckt werden soll (z.B. wenn zwei Personen nicht zusammen organisieren können).",
    diagNoGiftCaption: "Kein Geschenk füreinander",
    diagTeamOkCaption: "Aber gemeinsam für Dritte ok",
    diagNoTeamCaption: "Kein Team 🚫",

    twoWaySyncLabel: "„Beschenkt nicht“ automatisch für beide Seiten eintragen (ideal für Paare)",
    twoWaySyncHint:
      "Tipp: Mit einem Klick auf ↔ oder → auf einem blauen Schild kannst du jederzeit zwischen beidseitig (↔) und nur einseitig (→) wechseln.",

    bulkAddHelp: "Eine Person pro Zeile (E-Mail-Adresse oder: E-Mail-Adresse, Name)",
    btnApplyBulk: "Zur Liste hinzufügen",
    btnCancel: "Abbrechen",

    colEmail: "E-Mail-Adresse *",
    colName: "Name (freiwillig)",
    namePlaceholder: "z.B. Anna",
    colExcludeReceivers: "Beschenkt nicht",
    colExcludeCoGivers: "Nicht im Team mit",
    mobileCardPersonLabel: "Person #{n}",
    btnRemoveRowLabel: "Entfernen",
    tooltipColName:
      "Steht in der Begrüßung und im Text der E-Mail. Bleibt das Feld leer, wird stattdessen die E-Mail-Adresse angezeigt.",
    tooltipColExcludeReceivers:
      "Diese Personen bekommen von dieser Person kein Geschenk. ↔ bedeutet gegenseitig, → nur in eine Richtung (anklickbar).",
    tooltipColExcludeCoGivers:
      "Mit diesen Personen wird diese Person nicht zusammen in ein gemeinsames Schenk-Team gelost.",
    addExcludeReceiverPlaceholder: "+ Person wählen…",
    addExcludeCoGiverPlaceholder: "+ Person wählen…",
    dirTwoWayTitle: "Gegenseitig eingetragen (anklicken für nur einseitig →)",
    dirOneWayTitle: "Nur einseitig eingetragen (anklicken für gegenseitig ↔)",

    // Step 3: Rules & Preview
    step3Badge: "Schritt 3",
    step3Title: "Zusatzregeln & Probe-Auslosung (ohne E-Mails)",
    step3Hint:
      "Hier kannst du unverbindlich testen, ob mit euren Ausnahmen eine faire Auslosung aufgeht. Es werden dabei noch keine E-Mails verschickt.",
    ruleDuplicateCoTitle: "Abwechslungsreiche Teams (nicht zweimal dasselbe Duo)",
    ruleDuplicateCoDesc:
      "Wer bei mehreren Geschenken mitmacht, bekommt jedes Mal andere Team-Partner zugeteilt statt zweimal mit genau derselben Person zu schenken.",
    ruleReciprocityTitle: "Kein direktes Zurückschenken",
    ruleReciprocityDesc:
      "Wenn Anna bereits Ben beschenkt, zieht Ben garantiert eine andere Person und schenkt nicht direkt an Anna zurück.",
    ruleSampleCount: "Anzahl der Vorschau-Beispiele",
    ruleSampleCountHelp: "Wie viele unterschiedliche Beispiel-Auslosungen zum Prüfen gezeigt werden sollen",
    btnRunDryRun: "Probe-Auslosung testen",
    dryRunEmpty:
      "Noch keine Probe-Auslosung gestartet. Klicke auf „Probe-Auslosung testen“, um Beispiel-Zuordnungen und die E-Mail-Texte vorab zu sehen.",
    sampleTabLabel: "Beispiel #{n}",
    tableColReceiver: "Wer wird beschenkt?",
    tableColGiversClassic: "Wer schenkt?",
    tableColGiversTeam: "Wer besorgt das Geschenk gemeinsam?",
    mailPreviewSummary: "Vorschau der E-Mail-Texte öffnen ({count} E-Mails)",

    // Step 4: Live Send & Recovery
    step4Badge: "Schritt 4",
    step4Title: "Geheime Auslosung & E-Mails versenden",
    step4Hint:
      "Jetzt wird geheim ausgelost und jede Person erhält ihre persönliche E-Mail. Damit die Überraschung auch für dich gewahrt bleibt, wird die Zuordnung hier nicht angezeigt.",
    enableRecoveryTitle: "Notfall-Wiederherstellung einschalten (empfohlen)",
    enableRecoveryDesc:
      "Zeigt dir nach dem Versand ein geheimes Notfall-Passwort an. Falls jemand seine E-Mail nicht bekommt, kannst du damit später die E-Mail gezielt noch einmal senden oder einen persönlichen Abruf-Code für genau diese Person erstellen.",
    passcodeLabel: "Server-Passwort (Freigabe für E-Mail-Versand)",
    btnSendEmails: "🎁 Geheim auslosen & E-Mails senden",

    seedBoxTitle: "🔑 Dein Notfall-Passwort für diese Auslosung",
    seedBoxHint:
      "Bitte gut aufbewahren! Solange Teilnehmerliste und Regeln unverändert bleiben, kannst du damit unten jederzeit einzelne E-Mails erneut senden oder persönliche Codes erzeugen.",
    btnCopySeed: "Notfall-Passwort kopieren",
    copiedFeedback: "Kopiert!",

    recoverySectionSummary: "🛟 Hilfe: Jemand hat keine E-Mail bekommen? (Einzelversand & Persönlicher Code)",
    recoveryIntro:
      "Gib das Notfall-Passwort deiner Auslosung ein und wähle die betroffene Person. Die Auslosung bleibt dabei komplett geheim – auch du siehst nicht, wen die Person gezogen hat.",
    recoverySeedInputLabel: "Notfall-Passwort der Auslosung",
    recoverySeedPlaceholder: "z.B. W-ABCD-1234-…",
    recoveryPersonLabel: "Welche Person hat ihre E-Mail nicht erhalten?",
    recoveryNoParticipants: "Bitte zuerst oben die Teilnehmerliste der Runde laden oder eintragen.",

    recoveryCodeCardTitle: "Option A: Persönlichen Abruf-Code schicken (ohne E-Mail)",
    recoveryCodeCardDesc:
      "Ideal, wenn E-Mails im Spam hängen bleiben: Erzeuge einen verschlüsselten Code oder Direkt-Link und schicke ihn der Person z.B. per WhatsApp oder Signal. Der Code zeigt nur ihr eigenes Los.",
    btnGeneratePersonalCode: "🎟️ Persönlichen Code erstellen",
    generatedCodeLabel: "Persönlicher Code für {person}:",
    btnCopyPersonalCode: "Code kopieren",
    btnCopyPersonalLink: "Direkt-Link kopieren",

    recoveryResendCardTitle: "Option B: E-Mail gezielt erneut senden",
    recoveryResendCardDesc:
      "Verschickt exakt dieselbe gezogene E-Mail noch einmal nur an diese eine Person. Falls ein Tippfehler in der Adresse war, kannst du hier eine korrigierte E-Mail-Adresse eintragen.",
    recoveryOverrideEmailLabel: "Abweichende E-Mail-Adresse (nur falls Tippfehler, sonst leer lassen)",
    recoveryOverrideEmailPlaceholder: "korrigierte.adresse@example.org",
    btnResendSingleEmail: "✉️ E-Mail nur an diese Person senden",

    // Status & Warnings
    statusDryRunOk: "{count} Beispiel-Auslosung(en) erfolgreich erstellt.",
    statusSavedPreset: "Runde „{name}“ wurde lokal im Browser gespeichert.",
    statusLoadedExample: "Beispieldaten wurden eingefügt.",
    statusClearedParticipants: "Die Teilnehmerliste ist jetzt leer.",
    statusImportOk: "Backup erfolgreich geladen.",
    statusLiveSendOk: "Geschafft! {count} geheime E-Mails wurden ausgelost und verschickt.",
    statusResendOk: "Die E-Mail für {giver} wurde erfolgreich erneut an {email} gesendet.",
    statusCodeCreated: "Persönlicher Code für {giver} wurde erstellt.",
    warnOnlyOneSolution:
      "⚠️ Achtung: Durch die vielen Ausnahmen bleibt rechnerisch nur eine einzige mögliche Zuordnung übrig! Dadurch ließe sich erraten, wer wen beschenkt.",
    warnFewSolutions:
      "⚠️ Hinweis: Mit diesen Ausnahmen gibt es insgesamt nur {unique} verschiedene Möglichkeiten (gewünscht waren {requested}).",
    warnForcedReceivers:
      "⚠️ Hinweis: Folgende Personen werden in allen Beispielen immer von denselben Personen beschenkt: {receivers}",
    newPresetDefaultName: "Meine Wichtelrunde",
    copySuffix: " (Kopie)",

    errors: {
      ERR_BAD_JSON: "Ungültige Eingabedaten.",
      ERR_INVALID_LANG: "Diese Sprache wird vom Server nicht unterstützt.",
      ERR_INVALID_RULES:
        "Für diese Spielart sind noch zu wenige Personen eingetragen (es müssen mehr Personen mitmachen als pro Geschenk zusammenlegen).",
      ERR_PARTICIPANT_COUNT: "Bitte trage mindestens 3 teilnehmende Personen ein.",
      ERR_INVALID_EMAIL: "Mindestens eine E-Mail-Adresse fehlt oder ist falsch geschrieben.",
      ERR_INVALID_NAME: "Ungültiger Name (bitte keine Web-Adressen oder Sonderzeichen wie @, :, / verwenden).",
      ERR_DUPLICATE_PARTICIPANT: "Eine E-Mail-Adresse oder ein Name kommt doppelt in der Liste vor.",
      ERR_AUTH_FAILED: "Das eingegebene Server-Passwort stimmt nicht.",
      ERR_INVALID_SEED: "Bitte gib ein gültiges Notfall-Passwort der Auslosung ein.",
      ERR_INVALID_CODE: "Dieser persönliche Wichtel-Code ist ungültig oder unvollständig.",
      ERR_PAYLOAD_TOO_LARGE: "Die Anfrage ist zu groß.",
      ERR_UNSATISFIABLE:
        "Mit diesen Ausnahmen geht leider keine faire Auslosung auf! Bitte lockere eine Zusatzregel oder entferne einzelne Ausnahmen.",
      ERR_RATE_LIMITED: "Zu viele Versuche kurz hintereinander. Bitte warte ein paar Minuten.",
      ERR_SMTP_FAILED: "Der E-Mail-Server konnte die Nachricht nicht versenden.",
      ERR_NETWORK: "Der Server ist gerade nicht erreichbar."
    }
  },

  en: {
    appTitle: "Secret Santa & Team Gift Draw",
    appSubtitle: "Simple & secret gift drawing — solo or in teams",
    uiLanguageLabel: "Language & Email Text:",
    btnOpenRedeemHeader: "🎟️ Redeem Code",

    // Personal Code Redeem Card
    redeemTitle: "🎟️ Open Your Personal Secret Santa Code",
    redeemHint:
      "Didn't receive your email, and the organizer sent you a personal code or link? Paste it below — it only reveals your own assignment.",
    redeemInputLabel: "Your Personal Code",
    redeemInputPlaceholder: "WC1-…",
    btnRedeemSubmit: "Reveal My Assignment",
    btnRedeemClose: "Close",
    redeemResultHeading: "🎁 Your Personal Secret Santa Assignment",
    redeemForLabel: "For:",
    redeemRoundLabel: "Round:",

    // Stepper Nav
    stepNav1: "1. Round & Mode",
    stepNav2: "2. Who's Joining?",
    stepNav3: "3. Preview Draw",
    stepNav4: "4. Send & Recovery",

    // Step 1: Round & Mode
    step1Badge: "Step 1",
    step1Title: "Name Your Round & Pick How You Gift",
    step1Hint: "Choose whether everyone gifts individually or teams up, or load a saved round.",
    presetNameLabel: "Round Name (optional)",
    presetNamePlaceholder: "e.g. Family Secret Santa or Office Party",
    selectPresetLabel: "Open a Saved Round from This Browser",
    unsavedNewRoundOption: "— New Empty Round —",
    presetsStorageNote:
      "Note: Saved rounds are stored locally in your browser only (never on the server). Use Backup Save/Load to move rounds to another device.",
    btnSavePreset: "💾 Save Round in Browser",
    btnNewPreset: "+ New Empty Round",
    btnDuplicate: "Duplicate",
    btnExport: "Save Backup",
    btnImport: "Load Backup",
    btnDelete: "Delete",

    modeHeading: "How would you like to exchange gifts?",
    modeClassicTitle: "Classic Secret Santa (Solo)",
    modeClassicDesc:
      "Each person secretly draws one other person, gets them a gift on their own, and receives one gift in return.",
    modeTeam2Title: "Team Secret Santa / Engerl-Bengerl (Pairs)",
    modeTeam2Desc:
      "Two people secretly team up for each gift. Every person joins two gift teams and receives one gift themselves.",
    modeTeamMoreTitle: "Larger Gift Teams (3–5 People)",
    modeTeamMoreDesc:
      "Three to five people pool together for each gift. Everyone joins that many teams and receives one gift.",
    modeTeamSizeLabel: "How many people team up for one gift?",
    modeTeamSize3: "3 people per gift",
    modeTeamSize4: "4 people per gift",
    modeTeamSize5: "5 people per gift",
    diagPersonA: "Anna",
    diagPersonB: "Ben",
    diagPersonC: "Clara",
    diagTeamLabel: "Team",

    // Step 2: Participants
    step2Badge: "Step 2",
    step2Title: "Who Is Joining?",
    participantsHint:
      "Enter everyone's email address. Adding a name is optional, but makes the greeting in the email friendlier.",
    btnAddParticipant: "+ Add Person",
    btnBulkAdd: "Paste List",
    btnLoadExample: "Fill Example",
    btnClearAll: "Clear List",

    emptyParticipantsTitle: "Your participant list is empty.",
    emptyParticipantsText:
      "Add people one by one, paste a list of emails, or load an example group to try things out.",
    btnEmptyAddFirst: "+ Add First Person",

    explainReceiverTitle: "Exception: 'Does Not Gift' (e.g. Couples)",
    explainReceiverTextClassic:
      "Pick people this person should not draw as their gift recipient (for example, their partner).",
    explainReceiverTextTeam:
      "Pick people this person should not buy a gift for (e.g. partner). They are still allowed to team up together to organize a gift for someone else!",
    explainCoGiverTitle: "Exception: 'Not on Same Team With'",
    explainCoGiverText:
      "Pick people this person should not be paired with on the same gift-buying team.",
    diagNoGiftCaption: "No gift for each other",
    diagTeamOkCaption: "Teaming up for others is ok",
    diagNoTeamCaption: "No team 🚫",

    twoWaySyncLabel: "Automatically apply 'Does not gift' both ways (great for couples)",
    twoWaySyncHint:
      "Tip: Click ↔ or → on any blue tag to switch between two-way (↔) and one-way (→) at any time.",

    bulkAddHelp: "One person per line (email address, or: email@example.org, Name)",
    btnApplyBulk: "Add to List",
    btnCancel: "Cancel",

    colEmail: "Email Address *",
    colName: "Name (optional)",
    namePlaceholder: "e.g. Anna",
    colExcludeReceivers: "Does Not Gift",
    colExcludeCoGivers: "Not Teamed With",
    mobileCardPersonLabel: "Person #{n}",
    btnRemoveRowLabel: "Remove",
    tooltipColName:
      "Used in the email greeting and assignments. If left blank, the email address is shown instead.",
    tooltipColExcludeReceivers:
      "People this person will not buy a gift for. ↔ means mutual, → means one-way only (click to switch).",
    tooltipColExcludeCoGivers:
      "People this person will not be placed with on the same gift-buying team.",
    addExcludeReceiverPlaceholder: "+ Pick person…",
    addExcludeCoGiverPlaceholder: "+ Pick person…",
    dirTwoWayTitle: "Mutual exclusion (click to make one-way →)",
    dirOneWayTitle: "One-way exclusion (click to make mutual ↔)",

    // Step 3: Rules & Preview
    step3Badge: "Step 3",
    step3Title: "Extra Rules & Test Draw (No Emails Sent)",
    step3Hint:
      "Check right here whether a fair draw works with your exceptions. No emails are sent during a test draw.",
    ruleDuplicateCoTitle: "Varied teams (never pair the exact same duo twice)",
    ruleDuplicateCoDesc:
      "Everyone teams up with different people for each gift instead of being paired with the exact same co-giver twice.",
    ruleReciprocityTitle: "No direct gift-back",
    ruleReciprocityDesc:
      "If Anna draws Ben, Ben is guaranteed to draw someone else rather than gifting straight back to Anna.",
    ruleSampleCount: "Number of Sample Previews",
    ruleSampleCountHelp: "How many different random sample draws to show for testing",
    btnRunDryRun: "Test Sample Draw",
    dryRunEmpty:
      "No test draw run yet. Click 'Test Sample Draw' to preview sample assignments and email texts.",
    sampleTabLabel: "Sample #{n}",
    tableColReceiver: "Who Receives the Gift?",
    tableColGiversClassic: "Who Gives?",
    tableColGiversTeam: "Who Teams Up for the Gift?",
    mailPreviewSummary: "Preview Email Texts ({count} emails)",

    // Step 4: Live Send & Recovery
    step4Badge: "Step 4",
    step4Title: "Secret Draw & Send Emails",
    step4Hint:
      "Runs a fresh secret draw and emails everyone directly. To keep the surprise intact for you too, the assignments are never shown here.",
    enableRecoveryTitle: "Enable emergency recovery password (recommended)",
    enableRecoveryDesc:
      "Shows a secret recovery password after sending. If someone misses their email, you can reproduce the exact same draw later to resend just their email or give them a personal lookup code.",
    passcodeLabel: "Server Passcode (authorizes sending emails)",
    btnSendEmails: "🎁 Draw Secretly & Send Emails",

    seedBoxTitle: "🔑 Your Recovery Password for This Draw",
    seedBoxHint:
      "Keep this safe! As long as your participant list and rules stay the same, you can use it below at any time to resend an email or create a personal code.",
    btnCopySeed: "Copy Recovery Password",
    copiedFeedback: "Copied!",

    recoverySectionSummary: "🛟 Help: Someone didn't get their email? (Resend or Personal Code)",
    recoveryIntro:
      "Enter the recovery password from your draw and pick the person who missed their email. Everything stays secret — you won't see who they drew.",
    recoverySeedInputLabel: "Draw Recovery Password",
    recoverySeedPlaceholder: "e.g. W-ABCD-1234-…",
    recoveryPersonLabel: "Who missed their email?",
    recoveryNoParticipants: "Please load or enter your round's participant list above first.",

    recoveryCodeCardTitle: "Option A: Share a Personal Lookup Code (No Email Needed)",
    recoveryCodeCardDesc:
      "Great if their email provider blocks automated mail: create an encrypted code or direct link to send via WhatsApp, Signal, or SMS. It only unlocks that person's own assignment.",
    btnGeneratePersonalCode: "🎟️ Create Personal Code",
    generatedCodeLabel: "Personal code for {person}:",
    btnCopyPersonalCode: "Copy Code",
    btnCopyPersonalLink: "Copy Direct Link",

    recoveryResendCardTitle: "Option B: Resend Email to Just This Person",
    recoveryResendCardDesc:
      "Resends the exact same secret assignment email only to this person. If their email had a typo, you can enter a corrected delivery address below.",
    recoveryOverrideEmailLabel: "Corrected Email Address (optional, only if there was a typo)",
    recoveryOverrideEmailPlaceholder: "corrected.email@example.org",
    btnResendSingleEmail: "✉️ Resend Email to This Person",

    // Status & Warnings
    statusDryRunOk: "Generated {count} sample draw(s).",
    statusSavedPreset: "Saved round '{name}' locally in this browser.",
    statusLoadedExample: "Example participants added.",
    statusClearedParticipants: "Participant list cleared.",
    statusImportOk: "Backup loaded successfully.",
    statusLiveSendOk: "Done! {count} secret emails were drawn and sent.",
    statusResendOk: "Successfully resent email for {giver} to {email}.",
    statusCodeCreated: "Created personal lookup code for {giver}.",
    warnOnlyOneSolution:
      "⚠️ Heads up: Because of tight exceptions, only ONE valid assignment exists mathematically! People might be able to deduce who drew whom.",
    warnFewSolutions:
      "⚠️ Note: Only {unique} different valid assignments exist with these exceptions (requested {requested}).",
    warnForcedReceivers:
      "⚠️ Note: The following people receive from the exact same giver(s) in every sample: {receivers}",
    newPresetDefaultName: "My Secret Santa Round",
    copySuffix: " (Copy)",

    errors: {
      ERR_BAD_JSON: "Invalid input data.",
      ERR_INVALID_LANG: "Selected language is not supported by the server.",
      ERR_INVALID_RULES:
        "Not enough people for this gift mode yet (you need more participants than the number of people teaming up per gift).",
      ERR_PARTICIPANT_COUNT: "Please add at least 3 participants.",
      ERR_INVALID_EMAIL: "At least one email address is missing or invalid.",
      ERR_INVALID_NAME: "Invalid name (please avoid web links or special symbols like @, :, /).",
      ERR_DUPLICATE_PARTICIPANT: "Duplicate email address or duplicate name found in the list.",
      ERR_AUTH_FAILED: "Incorrect server passcode.",
      ERR_INVALID_SEED: "Please enter a valid draw recovery password.",
      ERR_INVALID_CODE: "This personal code is invalid or incomplete.",
      ERR_PAYLOAD_TOO_LARGE: "Request is too large.",
      ERR_UNSATISFIABLE:
        "No fair draw is possible with all current exceptions! Try relaxing an extra rule or removing an exception.",
      ERR_RATE_LIMITED: "Too many attempts in a short time. Please wait a few minutes.",
      ERR_SMTP_FAILED: "The email server could not send the message.",
      ERR_NETWORK: "Could not reach the server."
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
