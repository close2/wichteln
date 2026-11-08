// Generalized Secret Santa / Engerl-Bengerl constraint solver and validator.
// Uses only Toit 2.0 standard library modules.

class ValidationError:
  code/string
  detail/string
  constructor .code .detail:

class Participant:
  id/string
  email/string
  name/string
  groups/List             // List of string (legacy symmetric exclusion groups)
  receiver-groups/List    // List of string (shared group tag => do not gift each other)
  co-giver-groups/List    // List of string (shared group tag => do not form a giver team together)
  excludes/List           // List of string (legacy exclusions)
  exclude-receivers/List  // List of string
  exclude-co-givers/List  // List of string

  constructor
      --.id/string=""
      --.email/string
      --.name/string
      --.groups/List=[]
      --.receiver-groups/List=[]
      --.co-giver-groups/List=[]
      --.excludes/List=[]
      --.exclude-receivers/List=[]
      --.exclude-co-givers/List=[]:

  label -> string:
    if name.is-empty: return email
    if email.is-empty or email == name: return name
    return "$name ($email)"

  greeting-name -> string:
    if not name.is-empty: return name
    return email

  matches-ref ref/string -> bool:
    if ref.is-empty: return false
    r-low := ref.to-ascii-lower
    if not id.is-empty and id.to-ascii-lower == r-low: return true
    if not email.is-empty and email.to-ascii-lower == r-low: return true
    if not name.is-empty and name.to-ascii-lower == r-low: return true
    if label.to-ascii-lower == r-low: return true
    return false

class Rules:
  giver-group-size/int
  prevent-same-group-giver-receiver/bool
  prevent-same-group-co-givers/bool
  prevent-duplicate-co-giver-pairs/bool
  prevent-direct-reciprocity/bool
  sample-count/int
  max-steps/int

  constructor
      --.giver-group-size/int=2
      --.prevent-same-group-giver-receiver/bool=true
      --.prevent-same-group-co-givers/bool=false
      --.prevent-duplicate-co-giver-pairs/bool=true
      --.prevent-direct-reciprocity/bool=false
      --.sample-count/int=3
      --.max-steps/int=40000:

// Limits enforced by the backend.
MIN-PARTICIPANTS ::= 3
MAX-PARTICIPANTS ::= 60
MAX-GIVER-GROUP-SIZE ::= 5
MAX-SAMPLE-COUNT ::= 10
MAX-NAME-LENGTH ::= 40
MAX-EMAIL-LENGTH ::= 120
MAX-GROUP-NAME-LENGTH ::= 30
MAX-GROUPS-PER-PARTICIPANT ::= 10

FORBIDDEN-NAME-SUBSTRINGS_ ::= [
  "http://", "https://", "www.", "://", ".com", ".net", ".org", ".de", ".at", ".io"
]

is-valid-email email/string -> bool:
  if email.size < 3 or email.size > MAX-EMAIL-LENGTH: return false
  at-index := email.index-of "@"
  if at-index <= 0 or at-index >= email.size - 2: return false
  if (email.index-of "@" --last) != at-index: return false

  domain := email[at-index + 1 ..]
  dot-index := domain.index-of "."
  if dot-index <= 0 or dot-index >= domain.size - 1: return false
  if domain.starts-with "." or domain.ends-with "." or domain.starts-with "-" or domain.ends-with "-":
    return false

  valid-chars := true
  email.do --runes: | c/int |
    if c <= 0x20 or c >= 0x7f:
      valid-chars = false
    else if c == '<' or c == '>' or c == '"' or c == '\'' or c == ';' or c == ',' or c == ':' or c == '\\':
      valid-chars = false
  return valid-chars

is-valid-name name/string -> bool:
  if name.is-empty: return true
  if name.size > MAX-NAME-LENGTH: return false
  valid := true
  name.do --runes: | c/int |
    if c < 0x20 or c == 0x7f:
      valid = false
    else if c == '<' or c == '>' or c == '@' or c == ':' or c == '/' or c == '\\' or c == '"' or c == '\r' or c == '\n':
      valid = false
  if not valid: return false
  lower := name.to-ascii-lower
  FORBIDDEN-NAME-SUBSTRINGS_.do: | sub/string |
    if lower.contains sub: return false
  return true

is-valid-group-name group/string -> bool:
  if group.is-empty or group.size > MAX-GROUP-NAME-LENGTH: return false
  valid := true
  group.do --runes: | c/int |
    if c < 0x20 or c == 0x7f or c == '<' or c == '>' or c == '\r' or c == '\n':
      valid = false
  return valid

validate-request-data
    participants/List
    rules/Rules
    --require-emails/bool -> ValidationError?:
  n := participants.size
  if n < MIN-PARTICIPANTS or n > MAX-PARTICIPANTS:
    return ValidationError "ERR_PARTICIPANT_COUNT" "Participant count must be between $MIN-PARTICIPANTS and $MAX-PARTICIPANTS"

  k := rules.giver-group-size
  if k < 1 or k > MAX-GIVER-GROUP-SIZE or k >= n:
    return ValidationError "ERR_INVALID_RULES" "giverGroupSize must be between 1 and $(min MAX-GIVER-GROUP-SIZE (n - 1))"

  if rules.sample-count < 1 or rules.sample-count > MAX-SAMPLE-COUNT:
    return ValidationError "ERR_INVALID_RULES" "sampleCount must be between 1 and $MAX-SAMPLE-COUNT"

  seen-emails := {}
  seen-labels := {}

  participants.do: | p/Participant |
    if p.email.is-empty:
      if require-emails:
        return ValidationError "ERR_INVALID_EMAIL" "Email address is required for all participants when sending emails"
      if p.name.is-empty:
        return ValidationError "ERR_INVALID_EMAIL" "Each participant must have an email address or a name"
    else:
      if not is-valid-email p.email:
        return ValidationError "ERR_INVALID_EMAIL" "Invalid email address: $p.email"
      email-lower := p.email.to-ascii-lower
      if seen-emails.contains email-lower:
        return ValidationError "ERR_DUPLICATE_PARTICIPANT" "Duplicate email address: $p.email"
      seen-emails.add email-lower

    if not is-valid-name p.name:
      return ValidationError "ERR_INVALID_NAME" "Invalid participant name: $p.name"

    label-lower := p.label.to-ascii-lower
    if seen-labels.contains label-lower:
      return ValidationError "ERR_DUPLICATE_PARTICIPANT" "Duplicate participant identifier: $p.label"
    seen-labels.add label-lower

    if p.groups.size > MAX-GROUPS-PER-PARTICIPANT or
        p.receiver-groups.size > MAX-GROUPS-PER-PARTICIPANT or
        p.co-giver-groups.size > MAX-GROUPS-PER-PARTICIPANT or
        p.excludes.size >= n or
        p.exclude-receivers.size >= n or
        p.exclude-co-givers.size >= n:
      return ValidationError "ERR_INVALID_RULES" "Too many exclusions for $p.label"

    (p.groups + p.receiver-groups + p.co-giver-groups).do: | g/string |
      if not is-valid-group-name g:
        return ValidationError "ERR_INVALID_NAME" "Invalid exclusion group name: $g"

    (p.excludes + p.exclude-receivers + p.exclude-co-givers).do: | ex/string |
      if ex.is-empty or ex.size > MAX-EMAIL-LENGTH:
        return ValidationError "ERR_INVALID_RULES" "Invalid exclusion reference for $p.label"

  return null

shuffle-list_ list/List -> List:
  copy := list.copy
  n := copy.size
  for i := n - 1; i > 0; i--:
    j := random (i + 1)
    tmp := copy[i]
    copy[i] = copy[j]
    copy[j] = tmp
  return copy

class SolverState_:
  n/int
  k/int
  rules/Rules
  receiver-order/List          // List of participant indices ordered most-constrained first
  forbidden-co-giver/ByteArray // n * n symmetric matrix (1 if i and j cannot be co-givers together)
  can-gift/ByteArray           // n * n directed matrix (1 if giver g can gift receiver r)
  give-count/List              // int per participant
  gives-to/ByteArray           // n * n matrix (1 if g currently gifts r)
  co-giver-pair/ByteArray      // n * n matrix (1 if g1 and g2 currently co-gift together)
  assigned-givers/List         // List of List<int> indexed by receiver participant index
  forbidden-signatures/Set     // Set of canonical solution signatures to skip
  steps/int := 0
  aborted/bool := false

  constructor participants/List .rules --.forbidden-signatures/Set={}:
    n = participants.size
    k = rules.giver-group-size
    forbidden-co-giver = ByteArray (n * n)
    can-gift = ByteArray (n * n)
    gives-to = ByteArray (n * n)
    co-giver-pair = ByteArray (n * n)
    give-count = List n 0
    assigned-givers = List n: []

    for i := 0; i < n; i++:
      pi := participants[i] as Participant
      gi := pi.groups
      rgi := pi.receiver-groups
      cgi := pi.co-giver-groups
      exi := pi.excludes
      ex-rec-i := pi.exclude-receivers
      ex-cog-i := pi.exclude-co-givers
      for j := 0; j < n; j++:
        if i == j: continue
        pj := participants[j] as Participant
        gj := pj.groups
        rgj := pj.receiver-groups
        cgj := pj.co-giver-groups

        shared-legacy := false
        gi.do: | tag/string |
          if gj.contains tag: shared-legacy = true
        if not shared-legacy:
          exi.do: | ref/string |
            if pj.matches-ref ref: shared-legacy = true

        // 1. Giver -> Receiver exclusion check
        rec-excluded := false
        if rules.prevent-same-group-giver-receiver and shared-legacy:
          rec-excluded = true
        if not rec-excluded:
          rgi.do: | tag/string |
            if rgj.contains tag: rec-excluded = true
        if not rec-excluded:
          ex-rec-i.do: | ref/string |
            if pj.matches-ref ref: rec-excluded = true

        if not rec-excluded:
          can-gift[i * n + j] = 1

        // 2. Co-Giver exclusion check (symmetric between i and j)
        cog-excluded := false
        if rules.prevent-same-group-co-givers and shared-legacy:
          cog-excluded = true
        if not cog-excluded:
          cgi.do: | tag/string |
            if cgj.contains tag: cog-excluded = true
        if not cog-excluded:
          ex-cog-i.do: | ref/string |
            if pj.matches-ref ref: cog-excluded = true
        if cog-excluded:
          forbidden-co-giver[i * n + j] = 1
          forbidden-co-giver[j * n + i] = 1

    // Order receivers by ascending number of eligible givers (most constrained first),
    // with random tie-breaking.
    shuffled := shuffle-list_ (List n: it)
    eligible-counts := List n: | idx/int |
      count := 0
      for g := 0; g < n; g++:
        if can-gift[g * n + idx] == 1: count++
      count
    shuffled.sort --in-place: | a/int b/int |
      ca := eligible-counts[a]
      cb := eligible-counts[b]
      ca - cb
    receiver-order = shuffled

  // Forward-check that every participant can still reach k outgoing gifts
  // in the remaining receivers [next-r-pos .. n - 1].
  is-feasible_ next-r-pos/int -> bool:
    remaining-receivers := n - next-r-pos
    for g := 0; g < n; g++:
      needed := k - give-count[g]
      if needed == 0: continue
      if needed > remaining-receivers: return false
      // Count how many remaining receivers g is actually allowed to gift.
      possible := 0
      for r-pos := next-r-pos; r-pos < n; r-pos++:
        r := receiver-order[r-pos]
        if can-gift[g * n + r] == 1:
          if not (rules.prevent-direct-reciprocity and gives-to[r * n + g] == 1):
            possible++
            if possible >= needed: break
      if possible < needed: return false
    return true

  solve-receiver_ r-pos/int -> bool:
    if r-pos >= n:
      if forbidden-signatures.is-empty: return true
      sig := canonical-signature assigned-givers
      return not (forbidden-signatures.contains sig)
    steps++
    if steps > rules.max-steps:
      aborted = true
      return false

    if not is-feasible_ r-pos: return false

    r := receiver-order[r-pos]
    // Gather eligible givers for receiver r who still have capacity < k.
    candidates := []
    for g := 0; g < n; g++:
      if give-count[g] < k and can-gift[g * n + r] == 1:
        if not (rules.prevent-direct-reciprocity and gives-to[r * n + g] == 1):
          candidates.add g

    if candidates.size < k: return false

    // Prioritize givers who have the most remaining gifts to give (to avoid stranding a giver at the end),
    // after shuffling for randomness.
    candidates = shuffle-list_ candidates
    candidates.sort --in-place: | a/int b/int |
      give-count[a] - give-count[b]

    team := []
    return pick-team_ r-pos r candidates 0 team

  pick-team_ r-pos/int r/int candidates/List start-idx/int team/List -> bool:
    if aborted: return false
    picked := team.size
    if picked == k:
      assigned-givers[r] = team.copy
      if solve-receiver_ (r-pos + 1): return true
      assigned-givers[r] = []
      return false

    needed := k - picked
    max-start := candidates.size - needed
    for i := start-idx; i <= max-start; i++:
      steps++
      if steps > rules.max-steps:
        aborted = true
        return false

      g := candidates[i]
      // Check co-giver compatibility with already-selected team members.
      compatible := true
      team.do: | prev-g/int |
        if forbidden-co-giver[g * n + prev-g] == 1:
          compatible = false
        if rules.prevent-duplicate-co-giver-pairs and co-giver-pair[g * n + prev-g] == 1:
          compatible = false

      if not compatible: continue

      // Apply choice.
      give-count[g] = give-count[g] + 1
      gives-to[g * n + r] = 1
      team.do: | prev-g/int |
        co-giver-pair[g * n + prev-g] = 1
        co-giver-pair[prev-g * n + g] = 1
      team.add g

      if pick-team_ r-pos r candidates (i + 1) team:
        return true

      // Backtrack.
      team.resize (team.size - 1)
      team.do: | prev-g/int |
        co-giver-pair[g * n + prev-g] = 0
        co-giver-pair[prev-g * n + g] = 0
      gives-to[g * n + r] = 0
      give-count[g] = give-count[g] - 1

      if aborted: return false

    return false

/**
Computes a canonical string signature for an assigned-givers table so that
  identical mappings (regardless of giver order within a team) have the same key.
*/
canonical-signature assigned-givers/List -> string:
  parts := []
  for r := 0; r < assigned-givers.size; r++:
    team := (assigned-givers[r] as List).copy
    team.sort --in-place
    team-str := (team.map: "$it").join ","
    parts.add "$r:$team-str"
  return parts.join "|"

/**
Runs the constraint solver once and returns a List of length N where entry `r`
  is a List<int> of `k` giver participant indices, or null if unsatisfiable.
*/
solve participants/List rules/Rules --forbidden-signatures/Set={} -> List?:
  result := solve-with-status_ participants rules --forbidden-signatures=forbidden-signatures
  return result["solution"]

solve-with-status_ participants/List rules/Rules --forbidden-signatures/Set={} -> Map:
  state := SolverState_ participants rules --forbidden-signatures=forbidden-signatures
  if state.n > 0:
    // Quick degree feasibility check before recursion.
    for r := 0; r < state.n; r++:
      eligible := 0
      for g := 0; g < state.n; g++:
        if state.can-gift[g * state.n + r] == 1: eligible++
      if eligible < state.k:
        return { "solution": null, "aborted": false }
  if state.solve-receiver_ 0:
    return { "solution": state.assigned-givers, "aborted": false }
  return { "solution": null, "aborted": state.aborted }

/**
Finds up to `rules.sample-count` distinct valid solutions (and always checks if at
  least 2 distinct solutions exist so it can detect unique/forced draws).
*/
solve-distinct participants/List rules/Rules -> Map:
  target := max 2 rules.sample-count
  forbidden := {}
  solutions := []
  exhausted := false

  for i := 0; i < target; i++:
    res := solve-with-status_ participants rules --forbidden-signatures=forbidden
    sol := res["solution"]
    if not sol:
      if not (res["aborted"] as bool):
        exhausted = true
      break
    sig := canonical-signature sol
    forbidden.add sig
    solutions.add sol

  if solutions.is-empty:
    return {
      "solutions": [],
      "exhaustedAllSolutions": exhausted,
      "onlyOneSolutionExists": false,
      "forcedReceivers": [],
    }

  only-one := exhausted and solutions.size == 1

  // Identify receivers whose giver team never changed across all distinct solutions found.
  forced-receivers := []
  n := participants.size
  if only-one:
    for r := 0; r < n; r++:
      forced-receivers.add (participants[r] as Participant).label
  else if solutions.size >= 2:
    first-sol := solutions[0] as List
    for r := 0; r < n; r++:
      first-team := (first-sol[r] as List).copy
      first-team.sort --in-place
      first-key := (first-team.map: "$it").join ","
      all-same := true
      for s := 1; s < solutions.size; s++:
        other-team := ((solutions[s] as List)[r] as List).copy
        other-team.sort --in-place
        other-key := (other-team.map: "$it").join ","
        if other-key != first-key:
          all-same = false
          break
      if all-same:
        forced-receivers.add (participants[r] as Participant).label

  // Trim to requested sample-count if we probed 2 when sample-count was 1.
  returned-solutions := solutions.size > rules.sample-count
      ? solutions[..rules.sample-count]
      : solutions

  return {
    "solutions": returned-solutions,
    "exhaustedAllSolutions": exhausted,
    "onlyOneSolutionExists": only-one,
    "forcedReceivers": forced-receivers,
  }

/**
If a configuration is unsatisfiable, checks whether relaxing any optional rules
  (preventDirectReciprocity, preventSameGroupCoGivers, preventDuplicateCoGiverPairs)
  makes it solvable, returning the list of conflicting rule keys.
*/
diagnose-unsatisfiable participants/List rules/Rules -> List:
  relaxed := Rules
      --giver-group-size=rules.giver-group-size
      --prevent-same-group-giver-receiver=rules.prevent-same-group-giver-receiver
      --prevent-same-group-co-givers=false
      --prevent-duplicate-co-giver-pairs=false
      --prevent-direct-reciprocity=false
      --max-steps=10000
  if not (solve participants relaxed):
    return []

  blocking := []
  if rules.prevent-direct-reciprocity:
    test-r := Rules
        --giver-group-size=rules.giver-group-size
        --prevent-same-group-giver-receiver=rules.prevent-same-group-giver-receiver
        --prevent-same-group-co-givers=false
        --prevent-duplicate-co-giver-pairs=false
        --prevent-direct-reciprocity=true
        --max-steps=10000
    if not (solve participants test-r):
      blocking.add "preventDirectReciprocity"

  if rules.prevent-same-group-co-givers:
    test-r := Rules
        --giver-group-size=rules.giver-group-size
        --prevent-same-group-giver-receiver=rules.prevent-same-group-giver-receiver
        --prevent-same-group-co-givers=true
        --prevent-duplicate-co-giver-pairs=false
        --prevent-direct-reciprocity=false
        --max-steps=10000
    if not (solve participants test-r):
      blocking.add "preventSameGroupCoGivers"

  if rules.prevent-duplicate-co-giver-pairs:
    test-r := Rules
        --giver-group-size=rules.giver-group-size
        --prevent-same-group-giver-receiver=rules.prevent-same-group-giver-receiver
        --prevent-same-group-co-givers=false
        --prevent-duplicate-co-giver-pairs=true
        --prevent-direct-reciprocity=false
        --max-steps=10000
    if not (solve participants test-r):
      blocking.add "preventDuplicateCoGiverPairs"

  if blocking.is-empty:
    if rules.prevent-direct-reciprocity: blocking.add "preventDirectReciprocity"
    if rules.prevent-same-group-co-givers: blocking.add "preventSameGroupCoGivers"
    if rules.prevent-duplicate-co-giver-pairs: blocking.add "preventDuplicateCoGiverPairs"

  return blocking

replace-all_ template/string placeholder/string value/string -> string:
  return template.replace --all placeholder value

/**
Builds the structured draw result (byReceiver, byGiver, and rendered emails)
  from a solved `assigned-givers` index table and a server-locked language template map.
*/
build-draw-result
    participants/List
    assigned-givers/List
    lang-template/Map -> Map:
  n := participants.size
  by-receiver := []
  // Map per giver index -> List of Map { "receiver": label, "coGivers": List<string> }
  giver-assignments := List n: []

  for r := 0; r < n; r++:
    receiver-p := participants[r] as Participant
    giver-indices := assigned-givers[r] as List
    giver-labels := giver-indices.map: | g-idx/int |
      (participants[g-idx] as Participant).label
    by-receiver.add {
      "receiver": receiver-p.label,
      "givers": giver-labels,
    }

    giver-indices.do: | g-idx/int |
      co-givers := []
      giver-indices.do: | other-idx/int |
        if other-idx != g-idx:
          co-givers.add (participants[other-idx] as Participant).label
      giver-assignments[g-idx].add {
        "receiver": receiver-p.label,
        "coGivers": co-givers,
      }

  subject-tpl := (lang-template.get "subject") or "Secret Santa / Wichteln"
  body-tpl := (lang-template.get "body") or "Hello {{giver_name}},\n\n{{assignments}}\n"
  single-tpl := (lang-template.get "singleAssignment") or "-> {{receiver}}"
  team-tpl := (lang-template.get "teamAssignment") or "({{co_givers}}) -> {{receiver}}"
  joiner := (lang-template.get "coGiverJoiner") or ", "

  by-giver := []
  for g := 0; g < n; g++:
    giver-p := participants[g] as Participant
    assignments := giver-assignments[g] as List
    lines := []
    assignments.do: | item/Map |
      rec-label := item["receiver"] as string
      co-list := item["coGivers"] as List
      if co-list.is-empty:
        line := replace-all_ single-tpl "{{receiver}}" rec-label
        lines.add line
      else:
        co-str := co-list.join joiner
        line := replace-all_ team-tpl "{{co_givers}}" co-str
        line = replace-all_ line "{{receiver}}" rec-label
        lines.add line

    assignments-block := lines.join "\n"
    body := replace-all_ body-tpl "{{giver_name}}" giver-p.greeting-name
    body = replace-all_ body "{{assignments}}" assignments-block

    by-giver.add {
      "giver": giver-p.label,
      "email": giver-p.email,
      "assignments": assignments,
      "subject": subject-tpl,
      "body": body,
    }

  return {
    "byReceiver": by-receiver,
    "byGiver": by-giver,
  }
