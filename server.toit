// Hardened, zero-dependency HTTP/1.1 server for Wichteln / Engerl-Bengerl.
// Uses only Toit 2.0 built-in SDK libraries.

import crypto.sha256 show sha256
import encoding.json
import net
import net.tcp
import .solver as solver
import .smtp as smtp

ST-SIZE_ ::= 7
MAX-BODY-BYTES_ ::= 32768
REQUEST-TIMEOUT-MS_ ::= 10_000
RATE-WINDOW-US_ ::= 15 * 60 * 1_000_000  // 15 minutes in microseconds
MAX-LIVE-SENDS-PER-WINDOW_ ::= 5
MAX-AUTH-FAILS-PER-WINDOW_ ::= 5

stat_ name/string follow-links/bool -> List?:
  #primitive.file.stat

read-file-content-posix_ filename/string size/int -> ByteArray:
  #primitive.file.read-file-content-posix

read-file-bytes_ path/string -> ByteArray:
  st := stat_ path true
  if not st: throw "FILE_NOT_FOUND: $path"
  size := st[ST-SIZE_] as int
  return read-file-content-posix_ path size

constant-time-equals_ a/string b/string -> bool:
  ha := sha256 a.to-byte-array
  hb := sha256 b.to-byte-array
  diff := 0
  for i := 0; i < ha.size; i++:
    diff |= ha[i] ^ hb[i]
  return diff == 0 and a.size == b.size

class RateLimiter_:
  live-send-timestamps/List := []
  auth-fail-timestamps/List := []

  prune_ list/List now/int -> List:
    cutoff := now - RATE-WINDOW-US_
    return list.filter: (it as int) >= cutoff

  allow-auth-attempt -> bool:
    now := Time.monotonic-us
    auth-fail-timestamps = prune_ auth-fail-timestamps now
    return auth-fail-timestamps.size < MAX-AUTH-FAILS-PER-WINDOW_

  record-auth-failure -> none:
    now := Time.monotonic-us
    auth-fail-timestamps = prune_ auth-fail-timestamps now
    auth-fail-timestamps.add now

  allow-live-send -> bool:
    now := Time.monotonic-us
    live-send-timestamps = prune_ live-send-timestamps now
    return live-send-timestamps.size < MAX-LIVE-SENDS-PER-WINDOW_

  record-live-send -> none:
    now := Time.monotonic-us
    live-send-timestamps = prune_ live-send-timestamps now
    live-send-timestamps.add now

STATIC-ALLOWLIST_ ::= {
  "/index.html": "text/html; charset=utf-8",
  "/styles.css": "text/css; charset=utf-8",
  "/i18n.js": "text/javascript; charset=utf-8",
  "/db.js": "text/javascript; charset=utf-8",
  "/app.js": "text/javascript; charset=utf-8",
}

FAVICON-SVG_ ::= "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><text y='52' font-size='52'>🎁</text></svg>"

class ServerApp_:
  port/int
  passcode/string
  smtp-config/smtp.SmtpConfig
  templates/Map
  public-dir/string
  rate-limiter/RateLimiter_ ::= RateLimiter_

  constructor config/Map .public-dir:
    port = (config.get "port") or 8080
    passcode = (config.get "passcode") or ""
    templates = (config.get "templates") or {:}

    smtp-map := (config.get "smtp") or {:}
    smtp-config = smtp.SmtpConfig
        --host=((smtp-map.get "host") or "localhost")
        --port=((smtp-map.get "port") or 587)
        --tls-mode=((smtp-map.get "tlsMode") or "starttls")
        --username=((smtp-map.get "username") or "")
        --password=((smtp-map.get "password") or "")
        --from-email=((smtp-map.get "fromEmail") or "wichteln@localhost")
        --from-name=((smtp-map.get "fromName") or "Wichteln")
        --helo-domain=((smtp-map.get "heloDomain") or "localhost")
        --skip-certificate-validation=((smtp-map.get "skipCertificateValidation") == true)

  handle-connection socket/tcp.Socket -> none:
    try:
      with-timeout (Duration --ms=REQUEST-TIMEOUT-MS_):
        process-http-request_ socket
    finally:
      catch: socket.close

  process-http-request_ socket/tcp.Socket -> none:
    request-line := socket.in.read-line
    if not request-line or request-line.is-empty: return

    parts := request-line.split " "
    if parts.size < 2:
      send-json-error_ socket 400 "ERR_BAD_REQUEST" "Malformed HTTP request line"
      return

    method := parts[0]
    raw-path := parts[1]
    q-pos := raw-path.index-of "?"
    path := q-pos >= 0 ? raw-path[..q-pos] : raw-path

    content-length := 0
    while true:
      header-line := socket.in.read-line
      if not header-line or header-line.is-empty: break
      colon := header-line.index-of ":"
      if colon > 0:
        h-name := header-line[..colon].trim.to-ascii-lower
        h-val := header-line[colon + 1 ..].trim
        if h-name == "content-length":
          content-length = int.parse h-val --if-error=(: -1)

    if content-length < 0 or content-length > MAX-BODY-BYTES_:
      send-json-error_ socket 413 "ERR_PAYLOAD_TOO_LARGE" "Payload exceeds $(MAX-BODY-BYTES_) bytes"
      return

    if method == "GET":
      if path == "/api/meta":
        handle-meta_ socket
        return
      serve-static_ socket path
      return

    if method == "POST" and path == "/api/draw":
      if not (socket.in.try-ensure-buffered content-length):
        send-json-error_ socket 400 "ERR_BAD_JSON" "Incomplete request body"
        return
      body-bytes := socket.in.read-bytes content-length
      handle-draw_ socket body-bytes
      return

    send-json-error_ socket 404 "ERR_NOT_FOUND" "Not found"

  serve-static_ socket/tcp.Socket path/string -> none:
    if path == "/favicon.ico":
      send-response_ socket 200 "OK" "image/svg+xml; charset=utf-8" FAVICON-SVG_.to-byte-array
      return

    lookup := path == "/" ? "/index.html" : path
    content-type := STATIC-ALLOWLIST_.get lookup
    if not content-type:
      send-json-error_ socket 404 "ERR_NOT_FOUND" "Resource not found"
      return

    bytes/ByteArray? := null
    err := catch:
      bytes = read-file-bytes_ "$public-dir$lookup"
    if err or not bytes:
      send-json-error_ socket 404 "ERR_NOT_FOUND" "Resource not found"
      return

    send-response_ socket 200 "OK" (content-type as string) bytes

  handle-meta_ socket/tcp.Socket -> none:
    langs := []
    templates.do: | code/string tpl/Map |
      langs.add {
        "code": code,
        "label": (tpl.get "label") or code,
      }
    payload := json.encode {
      "ok": true,
      "languages": langs,
      "limits": {
        "minParticipants": solver.MIN-PARTICIPANTS,
        "maxParticipants": solver.MAX-PARTICIPANTS,
        "maxGiverGroupSize": solver.MAX-GIVER-GROUP-SIZE,
        "maxSampleCount": solver.MAX-SAMPLE-COUNT,
        "maxNameLength": solver.MAX-NAME-LENGTH,
        "maxEmailLength": solver.MAX-EMAIL-LENGTH,
        "maxGroupNameLength": solver.MAX-GROUP-NAME-LENGTH,
        "maxGroupsPerParticipant": solver.MAX-GROUPS-PER-PARTICIPANT,
      }
    }
    send-response_ socket 200 "OK" "application/json; charset=utf-8" payload

  handle-draw_ socket/tcp.Socket body-bytes/ByteArray -> none:
    parsed/any := null
    exception := catch:
      parsed = json.decode body-bytes
    if exception or parsed is not Map:
      send-json-error_ socket 400 "ERR_BAD_JSON" "Invalid JSON payload"
      return

    req := parsed as Map
    dry-run := (req.get "dryRun") != false
    lang := (req.get "lang")
    if lang is not string or not (templates.contains lang):
      send-json-error_ socket 400 "ERR_INVALID_LANG" "Unsupported language code"
      return

    if not dry-run:
      if not rate-limiter.allow-auth-attempt:
        send-json-error_ socket 429 "ERR_RATE_LIMITED" "Too many failed authentication attempts. Try again later."
        return
      supplied-pass := (req.get "passcode")
      if supplied-pass is not string or passcode.is-empty or not (constant-time-equals_ supplied-pass passcode):
        rate-limiter.record-auth-failure
        send-json-error_ socket 401 "ERR_AUTH_FAILED" "Invalid passcode"
        return
      if not rate-limiter.allow-live-send:
        send-json-error_ socket 429 "ERR_RATE_LIMITED" "Rate limit exceeded for sending emails. Try again later."
        return

    raw-rules := (req.get "rules")
    if raw-rules is not Map:
      send-json-error_ socket 400 "ERR_INVALID_RULES" "Missing or invalid rules object"
      return
    rules-map := raw-rules as Map

    k := rules-map.get "giverGroupSize"
    sample-count := dry-run ? ((rules-map.get "sampleCount") or 3) : 1
    if k is not int or sample-count is not int:
      send-json-error_ socket 400 "ERR_INVALID_RULES" "giverGroupSize and sampleCount must be integers"
      return

    rules := solver.Rules
        --giver-group-size=(k as int)
        --prevent-same-group-giver-receiver=((rules-map.get "preventSameGroupGiverReceiver") != false)
        --prevent-same-group-co-givers=((rules-map.get "preventSameGroupCoGivers") == true)
        --prevent-duplicate-co-giver-pairs=((rules-map.get "preventDuplicateCoGiverPairs") != false)
        --prevent-direct-reciprocity=((rules-map.get "preventDirectReciprocity") == true)
        --sample-count=(sample-count as int)

    raw-participants := req.get "participants"
    if raw-participants is not List:
      send-json-error_ socket 400 "ERR_PARTICIPANT_COUNT" "participants must be a list"
      return

    participants := []
    bad-type := false
    (raw-participants as List).do: | item |
      if item is not Map:
        bad-type = true
      else:
        m := item as Map
        id := (m.get "id") or ""
        email := (m.get "email") or ""
        name := (m.get "name") or ""
        raw-groups := (m.get "groups") or []
        raw-receiver-groups := (m.get "receiverGroups") or []
        raw-co-giver-groups := (m.get "coGiverGroups") or []
        raw-excludes := (m.get "excludes") or []
        raw-exclude-receivers := (m.get "excludeReceivers") or []
        raw-exclude-co-givers := (m.get "excludeCoGivers") or []
        if id is not string or email is not string or name is not string or
            raw-groups is not List or raw-receiver-groups is not List or raw-co-giver-groups is not List or
            raw-excludes is not List or raw-exclude-receivers is not List or raw-exclude-co-givers is not List:
          bad-type = true
        else:
          parse-str-list := : | raw-list/List |
            res := []
            raw-list.do: | elem |
              if elem is string:
                trimmed := (elem as string).trim
                if not trimmed.is-empty: res.add trimmed
              else:
                bad-type = true
            res

          groups := parse-str-list.call (raw-groups as List)
          receiver-groups := parse-str-list.call (raw-receiver-groups as List)
          co-giver-groups := parse-str-list.call (raw-co-giver-groups as List)
          excludes := parse-str-list.call (raw-excludes as List)
          exclude-receivers := parse-str-list.call (raw-exclude-receivers as List)
          exclude-co-givers := parse-str-list.call (raw-exclude-co-givers as List)

          participants.add
              solver.Participant
                  --id=(id as string).trim
                  --email=(email as string).trim
                  --name=(name as string).trim
                  --groups=groups
                  --receiver-groups=receiver-groups
                  --co-giver-groups=co-giver-groups
                  --excludes=excludes
                  --exclude-receivers=exclude-receivers
                  --exclude-co-givers=exclude-co-givers

    if bad-type:
      send-json-error_ socket 400 "ERR_BAD_JSON" "Invalid participant field types"
      return

    val-err := solver.validate-request-data participants rules --require-emails=(not dry-run)
    if val-err:
      send-json-error_ socket 400 val-err.code val-err.detail
      return

    lang-template := templates[lang] as Map

    if dry-run:
      distinct := solver.solve-distinct participants rules
      solutions := distinct["solutions"] as List
      if solutions.is-empty:
        blocking := solver.diagnose-unsatisfiable participants rules
        detail := blocking.is-empty
            ? "Constraints cannot be satisfied for this participant group"
            : "Try disabling: $(blocking.join ", ")"
        send-json-error_ socket 422 "ERR_UNSATISFIABLE" detail
        return

      samples := solutions.map: | assigned/List |
        solver.build-draw-result participants assigned lang-template

      resp := json.encode {
        "ok": true,
        "dryRun": true,
        "samples": samples,
        "requestedSampleCount": rules.sample-count,
        "uniqueSampleCount": samples.size,
        "exhaustedAllSolutions": distinct["exhaustedAllSolutions"],
        "onlyOneSolutionExists": distinct["onlyOneSolutionExists"],
        "forcedReceivers": distinct["forcedReceivers"],
      }
      send-response_ socket 200 "OK" "application/json; charset=utf-8" resp
      return

    // Live send mode (dryRun == false)
    assigned := solver.solve participants rules
    if not assigned:
      send-json-error_ socket 422 "ERR_UNSATISFIABLE" "Constraints cannot be satisfied for this participant group"
      return

    draw-result := solver.build-draw-result participants assigned lang-template
    by-giver := draw-result["byGiver"] as List
    email-messages := by-giver.map: | g-entry/Map |
      smtp.EmailMessage
          --to-email=(g-entry["email"] as string)
          --subject=(g-entry["subject"] as string)
          --body=(g-entry["body"] as string)

    smtp-err := catch:
      smtp.send-emails smtp-config email-messages
    if smtp-err:
      send-json-error_ socket 502 "ERR_SMTP_FAILED" "Failed to dispatch emails via SMTP: $smtp-err"
      return

    rate-limiter.record-live-send
    resp := json.encode {
      "ok": true,
      "dryRun": false,
      "sentCount": email-messages.size,
    }
    send-response_ socket 200 "OK" "application/json; charset=utf-8" resp

  status-text_ status/int -> string:
    if status == 400: return "Bad Request"
    if status == 401: return "Unauthorized"
    if status == 404: return "Not Found"
    if status == 413: return "Payload Too Large"
    if status == 422: return "Unprocessable Entity"
    if status == 429: return "Too Many Requests"
    return "Server Error"

  send-json-error_ socket/tcp.Socket status/int code/string detail/string -> none:
    payload := json.encode {
      "ok": false,
      "errorCode": code,
      "detail": detail,
    }
    send-response_ socket status (status-text_ status) "application/json; charset=utf-8" payload

  send-response_ socket/tcp.Socket status/int status-text/string content-type/string body/ByteArray -> none:
    headers := [
      "HTTP/1.1 $status $status-text",
      "Content-Type: $content-type",
      "Content-Length: $body.size",
      "Connection: close",
      "Cache-Control: no-cache, no-store, must-revalidate",
      "Pragma: no-cache",
      "Expires: 0",
      "X-Content-Type-Options: nosniff",
      "X-Frame-Options: DENY",
      "Referrer-Policy: no-referrer",
      "Content-Security-Policy: default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'",
      "",
      ""
    ].join "\r\n"
    socket.out.write headers
    socket.out.write body --flush=true

main args/List:
  config-path := args.size > 0 ? args[0] : "config.json"
  public-dir := args.size > 1 ? args[1] : "public"

  config-bytes := read-file-bytes_ config-path
  config := (json.decode config-bytes) as Map

  app := ServerApp_ config public-dir
  network := net.open
  server-socket := network.tcp-listen app.port
  print "Wichteln server listening on http://127.0.0.1:$app.port"

  while true:
    client := server-socket.accept
    if client:
      task::
        app.handle-connection client
