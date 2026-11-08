// Minimal, dependency-free SMTP client supporting plain SMTP, STARTTLS (587), and SMTPS (465).
// Uses only Toit 2.0 built-in standard library modules (net, tls, encoding.base64).

import encoding.base64
import net
import net.tcp
import tls

class SmtpConfig:
  host/string
  port/int
  tls-mode/string          // "starttls" | "smtps" | "plain"
  username/string
  password/string
  from-email/string
  from-name/string
  helo-domain/string
  skip-certificate-validation/bool
  root-certificates/List   // List of tls.RootCertificate

  constructor
      --.host/string
      --.port/int=587
      --.tls-mode/string="starttls"
      --.username/string=""
      --.password/string=""
      --.from-email/string
      --.from-name/string="Wichteln"
      --.helo-domain/string="localhost"
      --.skip-certificate-validation/bool=false
      --.root-certificates/List=[]:

class EmailMessage:
  to-email/string
  subject/string
  body/string

  constructor --.to-email/string --.subject/string --.body/string:

encode-mime-header_ text/string -> string:
  // Always RFC 2047 UTF-8 Base64 encode header text so umlauts and non-ASCII are safe
  // and no CRLF injection is possible.
  b64 := base64.encode text.to-byte-array
  return "=?UTF-8?B?$b64?="

wrap-base64_ b64/string -> string:
  lines := []
  pos := 0
  len := b64.size
  while pos < len:
    end := min (pos + 76) len
    lines.add b64[pos..end]
    pos = end
  return lines.join "\r\n"

read-smtp-response_ socket/tcp.Socket -> int:
  last-code := 0
  while true:
    line := socket.in.read-line
    if not line or line.size < 3:
      throw "SMTP_UNEXPECTED_EOF"
    code := int.parse line[0..3] --if-error=(: throw "SMTP_BAD_STATUS: $line")
    last-code = code
    // Multi-line responses have '-' at index 3; final line has ' ' or ends at 3.
    if line.size == 3 or line[3] != '-':
      if code >= 400:
        throw "SMTP_ERROR_$code: $line"
      return last-code

send-cmd_ socket/tcp.Socket cmd/string expected-prefix/int -> none:
  socket.out.write "$cmd\r\n" --flush=true
  code := read-smtp-response_ socket
  if (code / 100) != expected-prefix:
    throw "SMTP_UNEXPECTED_CODE_$code"

/**
Sends a batch of EmailMessage items over a single SMTP session.
*/
send-emails config/SmtpConfig messages/List -> none:
  if messages.is-empty: return

  network := net.open
  try:
    raw-socket/tcp.Socket := network.tcp-connect config.host config.port
    active-socket/tcp.Socket := raw-socket
    try:
      if config.tls-mode == "smtps":
        tls-sock := tls.Socket.client raw-socket
            --server-name=config.host
            --root-certificates=config.root-certificates
            --skip-certificate-validation=config.skip-certificate-validation
        tls-sock.handshake
        active-socket = tls-sock

      // 220 Service ready banner.
      banner-code := read-smtp-response_ active-socket
      if (banner-code / 100) != 2:
        throw "SMTP_BANNER_FAILED_$banner-code"

      send-cmd_ active-socket "EHLO $config.helo-domain" 2

      if config.tls-mode == "starttls":
        send-cmd_ active-socket "STARTTLS" 2
        tls-sock := tls.Socket.client active-socket
            --server-name=config.host
            --root-certificates=config.root-certificates
            --skip-certificate-validation=config.skip-certificate-validation
        tls-sock.handshake
        active-socket = tls-sock
        send-cmd_ active-socket "EHLO $config.helo-domain" 2

      if not config.username.is-empty:
        // AUTH PLAIN: base64("\0username\0password")
        user-bytes := config.username.to-byte-array
        pass-bytes := config.password.to-byte-array
        auth-buf := ByteArray (2 + user-bytes.size + pass-bytes.size)
        auth-buf.replace 1 user-bytes
        auth-buf.replace (2 + user-bytes.size) pass-bytes
        auth-b64 := base64.encode auth-buf
        send-cmd_ active-socket "AUTH PLAIN $auth-b64" 2

      from-header := config.from-name.is-empty
          ? "<$config.from-email>"
          : "$(encode-mime-header_ config.from-name) <$config.from-email>"

      messages.do: | msg/EmailMessage |
        send-cmd_ active-socket "MAIL FROM:<$config.from-email>" 2
        send-cmd_ active-socket "RCPT TO:<$msg.to-email>" 2
        send-cmd_ active-socket "DATA" 3

        encoded-subject := encode-mime-header_ msg.subject
        encoded-body := wrap-base64_ (base64.encode msg.body.to-byte-array)

        payload := [
          "From: $from-header",
          "To: <$msg.to-email>",
          "Subject: $encoded-subject",
          "MIME-Version: 1.0",
          "Content-Type: text/plain; charset=UTF-8",
          "Content-Transfer-Encoding: base64",
          "",
          encoded-body,
          ".",
          ""
        ].join "\r\n"

        active-socket.out.write payload --flush=true
        code := read-smtp-response_ active-socket
        if (code / 100) != 2:
          throw "SMTP_DATA_REJECTED_$code"

      catch:
        send-cmd_ active-socket "QUIT" 2
    finally:
      catch: active-socket.close
  finally:
    catch: network.close
