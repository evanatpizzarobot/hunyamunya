<?php
/**
 * contact-submit.php — /contact form endpoint for hunyamunyarecords.com.
 *
 * Spec: docs/specs/contact-form-v1.md + docs/specs/hosting-addendum.md §2, §6.
 *
 * Runs on the NetActuate cPanel server behind Apache. Reads env vars from
 * /home/hmrecords/.env (outside docroot, chmod 600). Writes per-submission
 * JSON to $SUBMISSIONS_DIR, sends mail() to CONTACT_TO, sends auto-ack to
 * the submitter, and returns either JSON (for AJAX) or a redirect to
 * /contact/sent (for no-JS submissions).
 *
 * Anti-spam layers run BEFORE any disk or mail work:
 *   1. Honeypot: the `website` field must be empty.
 *   2. Timing: the client timestamp in `_t` must be 3s-2hrs old.
 *   3. Rate limit: at most RATE_LIMIT_MAX_PER_WINDOW submissions from one IP
 *      in RATE_LIMIT_WINDOW_SECONDS seconds.
 *
 * Failures are returned as 400/429 with generic copy (we don't tell spammers
 * which layer they tripped).
 */

declare(strict_types=1);

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

// ---- HTTP method + config ------------------------------------------------

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  header('Allow: POST');
  exit('Method Not Allowed');
}

$env_path = '/home/hmrecords/.env';
$env = parse_env_file($env_path);

$CONTACT_TO = env_get($env, 'CONTACT_TO', 'contact@hunyamunyarecords.com');
$CONTACT_FROM = env_get($env, 'CONTACT_FROM', 'website@hunyamunyarecords.com');
$CONTACT_SUBJECT_PREFIX = env_get($env, 'CONTACT_SUBJECT_PREFIX', '[hunyamunya]');
$SUBMISSIONS_DIR = rtrim(env_get($env, 'SUBMISSIONS_DIR', '/home/hmrecords/submissions'), '/');
$RATE_LIMIT_WINDOW_SECONDS = (int) env_get($env, 'RATE_LIMIT_WINDOW_SECONDS', '300');
$RATE_LIMIT_MAX_PER_WINDOW = (int) env_get($env, 'RATE_LIMIT_MAX_PER_WINDOW', '3');

$is_ajax =
  !empty($_SERVER['HTTP_X_REQUESTED_WITH']) ||
  (isset($_SERVER['HTTP_ACCEPT']) && str_contains($_SERVER['HTTP_ACCEPT'], 'application/json'));

// ---- Input extraction + sanitization -------------------------------------

$input = [
  'name'         => trim((string) ($_POST['name'] ?? '')),
  'email'        => trim((string) ($_POST['email'] ?? '')),
  'purpose'      => trim((string) ($_POST['purpose'] ?? '')),
  'message'      => trim((string) ($_POST['message'] ?? '')),
  'artist_name'  => trim((string) ($_POST['artist_name'] ?? '')),
  'music_link'   => trim((string) ($_POST['music_link'] ?? '')),
  'genre'        => trim((string) ($_POST['genre'] ?? '')),
  'outlet'       => trim((string) ($_POST['outlet'] ?? '')),
  'company'      => trim((string) ($_POST['company'] ?? '')),
  'project_type' => trim((string) ($_POST['project_type'] ?? '')),
  'website'      => trim((string) ($_POST['website'] ?? '')), // honeypot
  '_t'           => trim((string) ($_POST['_t'] ?? '')),
];

// Normalize line endings in free text.
foreach (['name', 'message', 'artist_name', 'genre', 'outlet', 'company', 'project_type'] as $f) {
  $input[$f] = preg_replace("/\r\n?|\r/", "\n", $input[$f]);
  $input[$f] = strip_tags($input[$f]);
}

// ---- Anti-spam layer 1: honeypot -----------------------------------------

if ($input['website'] !== '') {
  respond_reject($is_ajax, 400, 'Please check the form and try again.');
}

// ---- Anti-spam layer 2: timing -------------------------------------------

$submit_ts = (int) $input['_t'];
$now = time();
if ($submit_ts <= 0 || $now - $submit_ts < 3 || $now - $submit_ts > 7200) {
  respond_reject($is_ajax, 400, 'Please check the form and try again.');
}

// ---- Anti-spam layer 3: rate limit ---------------------------------------

$ip = client_ip();
if (!ensure_under_rate_limit($SUBMISSIONS_DIR, $ip, $RATE_LIMIT_WINDOW_SECONDS, $RATE_LIMIT_MAX_PER_WINDOW)) {
  respond_reject($is_ajax, 429, 'Too many submissions right now. Please try again in a few minutes.');
}

// ---- Required-field + format validation ----------------------------------

$valid_purposes = ['submission', 'press', 'licensing', 'general'];
$errors = [];

if ($input['name'] === '' || mb_strlen($input['name']) > 200) $errors[] = 'name';
if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL) || mb_strlen($input['email']) > 320) $errors[] = 'email';
if (!in_array($input['purpose'], $valid_purposes, true)) $errors[] = 'purpose';
if (mb_strlen($input['message']) < 20 || mb_strlen($input['message']) > 3000) $errors[] = 'message';

if ($input['purpose'] === 'submission') {
  if (!is_https_url($input['music_link']) || mb_strlen($input['music_link']) > 500) $errors[] = 'music_link';
}

if (!empty($errors)) {
  respond_reject($is_ajax, 400, 'Please check the form and try again.');
}

// ---- Content heuristic (cheap spam filter) -------------------------------

if (preg_match_all('/https?:\/\//i', $input['message']) > 5) {
  respond_reject($is_ajax, 400, 'Please check the form and try again.');
}
$spam_phrases = ['viagra', 'casino', 'seo services', 'buy followers', 'guest post'];
foreach ($spam_phrases as $phrase) {
  if (stripos($input['message'], $phrase) !== false) {
    respond_reject($is_ajax, 400, 'Please check the form and try again.');
  }
}

// ---- Persist + dispatch --------------------------------------------------

$id = generate_submission_id();
$record = [
  'id'           => $id,
  'received_at'  => gmdate('c'),
  'ip'           => $ip,
  'user_agent'   => substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 512),
  'purpose'      => $input['purpose'],
  'name'         => $input['name'],
  'email'        => $input['email'],
  'message'      => $input['message'],
  'artist_name'  => $input['artist_name'],
  'music_link'   => $input['music_link'],
  'genre'        => $input['genre'],
  'outlet'       => $input['outlet'],
  'company'      => $input['company'],
  'project_type' => $input['project_type'],
];

$wrote = persist_submission($SUBMISSIONS_DIR, $id, $record);
if (!$wrote) {
  respond_reject(
    $is_ajax,
    500,
    'Something went wrong on our end. Please try again, or email ' . $CONTACT_TO . ' directly.'
  );
}

// Mail to Evan + auto-ack to submitter. Mail failures are non-fatal; the
// submission file on disk is the source of truth.
$mail_ok = send_notification_to_evan($record, $CONTACT_TO, $CONTACT_FROM, $CONTACT_SUBJECT_PREFIX);
if (!$mail_ok) {
  log_error($SUBMISSIONS_DIR, "notify-evan failed for id=$id");
}

$ack_ok = send_acknowledgment_to_submitter($record, $CONTACT_TO);
if (!$ack_ok) {
  log_error($SUBMISSIONS_DIR, "auto-ack failed for id=$id to={$record['email']}");
}

// ---- Success -------------------------------------------------------------

if ($is_ajax) {
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['ok' => true, 'id' => $id], JSON_UNESCAPED_SLASHES);
} else {
  header('Location: /contact/sent?id=' . rawurlencode($id));
  http_response_code(303);
}
exit;

// ==========================================================================
// Helpers
// ==========================================================================

function respond_reject(bool $is_ajax, int $status, string $message): void
{
  http_response_code($status);
  if ($is_ajax) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'message' => $message]);
  } else {
    header('Content-Type: text/plain; charset=utf-8');
    echo $message;
  }
  exit;
}

function parse_env_file(string $path): array
{
  $out = [];
  if (!is_readable($path)) return $out;
  $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
  if ($lines === false) return $out;
  foreach ($lines as $line) {
    if ($line === '' || $line[0] === '#') continue;
    $eq = strpos($line, '=');
    if ($eq === false) continue;
    $key = trim(substr($line, 0, $eq));
    $val = trim(substr($line, $eq + 1));
    // Strip surrounding quotes if present.
    if (
      (str_starts_with($val, '"') && str_ends_with($val, '"')) ||
      (str_starts_with($val, "'") && str_ends_with($val, "'"))
    ) {
      $val = substr($val, 1, -1);
    }
    $out[$key] = $val;
  }
  return $out;
}

function env_get(array $env, string $key, string $default): string
{
  return isset($env[$key]) && $env[$key] !== '' ? $env[$key] : $default;
}

function client_ip(): string
{
  // Prefer CF-Connecting-IP, X-Forwarded-For (first entry), then REMOTE_ADDR.
  $headers = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP'];
  foreach ($headers as $h) {
    if (!empty($_SERVER[$h])) {
      $first = trim(explode(',', $_SERVER[$h])[0]);
      if (filter_var($first, FILTER_VALIDATE_IP)) return $first;
    }
  }
  return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

function is_https_url(string $v): bool
{
  if ($v === '' || mb_strlen($v) > 2048) return false;
  $parts = parse_url($v);
  if (!$parts || ($parts['scheme'] ?? '') !== 'https') return false;
  if (empty($parts['host'])) return false;
  return true;
}

function generate_submission_id(): string
{
  $rand = bin2hex(random_bytes(3)); // 6 hex chars
  return gmdate('Y-m-d-His') . '-' . $rand;
}

function persist_submission(string $dir, string $id, array $record): bool
{
  if (!is_dir($dir) && !@mkdir($dir, 0700, true)) return false;
  $path = $dir . '/' . $id . '.json';
  $tmp = $path . '.tmp';
  $json = json_encode($record, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
  if ($json === false) return false;
  if (file_put_contents($tmp, $json, LOCK_EX) === false) return false;
  if (!@rename($tmp, $path)) { @unlink($tmp); return false; }
  @chmod($path, 0600);
  return true;
}

function ensure_under_rate_limit(string $dir, string $ip, int $window, int $max): bool
{
  if (!is_dir($dir) && !@mkdir($dir, 0700, true)) return true; // fail-open if we can't set up
  $file = $dir . '/.rate-limit.json';
  $fp = @fopen($file, 'c+');
  if ($fp === false) return true;
  flock($fp, LOCK_EX);

  $contents = stream_get_contents($fp);
  $buckets = $contents ? json_decode($contents, true) : [];
  if (!is_array($buckets)) $buckets = [];

  $now = time();
  // Prune old entries globally.
  foreach ($buckets as $bip => $timestamps) {
    $buckets[$bip] = array_values(array_filter($timestamps, fn($t) => ($now - (int)$t) < $window));
    if (empty($buckets[$bip])) unset($buckets[$bip]);
  }

  $count = isset($buckets[$ip]) ? count($buckets[$ip]) : 0;
  if ($count >= $max) {
    flock($fp, LOCK_UN);
    fclose($fp);
    return false;
  }

  $buckets[$ip][] = $now;
  ftruncate($fp, 0);
  rewind($fp);
  fwrite($fp, json_encode($buckets, JSON_UNESCAPED_SLASHES));
  fflush($fp);
  flock($fp, LOCK_UN);
  fclose($fp);
  return true;
}

function log_error(string $dir, string $message): void
{
  $line = gmdate('c') . ' ' . $message . "\n";
  @file_put_contents($dir . '/.errors.log', $line, FILE_APPEND | LOCK_EX);
}

function send_notification_to_evan(array $r, string $to, string $from, string $prefix): bool
{
  $purpose_label = match ($r['purpose']) {
    'submission' => 'Submission',
    'press'      => 'Press inquiry',
    'licensing'  => 'Licensing',
    'general'    => 'General',
    default      => 'Message',
  };

  $subject = trim($prefix) . ' ' . $purpose_label . ' from ' . $r['name'];

  $body = "New $purpose_label from the hunyamunyarecords.com contact form.\n\n";
  $body .= "---\n";
  $body .= "Name: {$r['name']}\n";
  $body .= "Email: {$r['email']}\n";

  if ($r['purpose'] === 'submission') {
    $body .= 'Artist name: ' . ($r['artist_name'] !== '' ? $r['artist_name'] : '(same as above)') . "\n";
    $body .= "Music link: {$r['music_link']}\n";
    $body .= 'Genre / style: ' . ($r['genre'] !== '' ? $r['genre'] : '(not specified)') . "\n";
  } elseif ($r['purpose'] === 'press') {
    $body .= 'Outlet: ' . ($r['outlet'] !== '' ? $r['outlet'] : '(not specified)') . "\n";
  } elseif ($r['purpose'] === 'licensing') {
    $body .= 'Company: ' . ($r['company'] !== '' ? $r['company'] : '(not specified)') . "\n";
    $body .= 'Project type: ' . ($r['project_type'] !== '' ? $r['project_type'] : '(not specified)') . "\n";
  }

  $body .= "---\n\n";
  $body .= "Message:\n\n";
  $body .= $r['message'] . "\n\n";
  $body .= "---\n";
  $body .= "Submission ID: {$r['id']}\n";
  $body .= 'Received: ' . format_la_time($r['received_at']) . "\n";
  $body .= "IP: {$r['ip']}\n";
  $body .= 'User-Agent: ' . $r['user_agent'] . "\n";
  $body .= "---\n";
  $body .= "Reply directly to this email; the submitter's address is in the Reply-To field.\n";

  $headers = [
    'From: ' . encode_header_name('Hunya Munya Records', $from),
    'Reply-To: ' . encode_header_name($r['name'], $r['email']),
    'Sender: ' . $from,
    'Return-Path: ' . $from,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: hunyamunyarecords-contact-form',
  ];

  return @mail($to, encode_header_utf8($subject), $body, implode("\r\n", $headers), '-f' . $from);
}

function send_acknowledgment_to_submitter(array $r, string $from): bool
{
  $first_name = extract_first_name($r['name']);
  $subject = 'Thanks for writing Hunya Munya Records';

  $body = "Hi $first_name,\n\n";
  $body .= "Thanks for writing Hunya Munya Records. Your message reached us.\n\n";
  $body .= "A few honest words on timing:\n\n";
  $body .= "We're a small independent label and we read every submission ourselves,\n";
  $body .= "which means responses can take a few weeks, sometimes longer during\n";
  $body .= "active release campaigns. If your message needs a reply, we'll get there.\n";
  $body .= "If you don't hear back in 4-6 weeks, it's fine to send a gentle follow-up.\n\n";
  $body .= "Your submission ID is {$r['id']}, in case you need to reference it.\n\n";
  $body .= "Hunya Munya Records\n";
  $body .= "hunyamunyarecords.com\n";
  $body .= "Los Angeles, CA\n";

  $headers = [
    'From: ' . encode_header_name('Hunya Munya Records', $from),
    'Reply-To: ' . $from,
    'Sender: ' . $from,
    'Return-Path: ' . $from,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: hunyamunyarecords-contact-form',
  ];

  return @mail($r['email'], encode_header_utf8($subject), $body, implode("\r\n", $headers), '-f' . $from);
}

function encode_header_name(string $name, string $email): string
{
  $clean_name = str_replace(["\r", "\n", '"'], '', $name);
  // RFC 2047 encode non-ASCII names.
  if (preg_match('/[^\x20-\x7E]/', $clean_name)) {
    $clean_name = '=?UTF-8?B?' . base64_encode($clean_name) . '?=';
    return "$clean_name <$email>";
  }
  return '"' . $clean_name . '" <' . $email . '>';
}

function encode_header_utf8(string $v): string
{
  if (preg_match('/[^\x20-\x7E]/', $v)) {
    return '=?UTF-8?B?' . base64_encode($v) . '?=';
  }
  return $v;
}

function extract_first_name(string $full): string
{
  $parts = preg_split('/\s+/', trim($full));
  if (!$parts || $parts[0] === '') return 'friend';
  return $parts[0];
}

function format_la_time(string $iso): string
{
  try {
    $dt = new DateTime($iso, new DateTimeZone('UTC'));
    $dt->setTimezone(new DateTimeZone('America/Los_Angeles'));
    return $dt->format('Y-m-d H:i:s T');
  } catch (Throwable $_) {
    return $iso;
  }
}
