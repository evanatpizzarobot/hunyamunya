<?php
// Token-gated archive extractor called by the deploy workflow. Unzips
// /public_html/site.zip in place, overwriting existing files, then removes
// the zip. Returns a one-line status.
//
// This exists because cPanel's UAPI Fileman module on this host does not
// expose an `extract` function, but does expose `upload_files` — so the
// workflow uploads site.zip via UAPI, then hits this endpoint over HTTPS
// to do the extraction on the server side.
//
// Token is injected at build time by .github/workflows/deploy.yml, so a
// copy of this file pulled from the repo always 404s (the placeholder
// can never match a real token).
$expected = '__DEPLOY_TOKEN__';
$provided = $_SERVER['HTTP_X_DEPLOY_TOKEN'] ?? '';
if ($expected === '__DEPLOY_TOKEN__' || $provided === '' || !hash_equals($expected, $provided)) {
    http_response_code(404);
    exit;
}

@set_time_limit(300);
@ini_set('memory_limit', '256M');

$root = $_SERVER['DOCUMENT_ROOT'];
$zipPath = $root . '/site.zip';

if (!file_exists($zipPath)) {
    http_response_code(500);
    echo "zip missing at $zipPath";
    exit;
}

$zip = new ZipArchive();
$rc = $zip->open($zipPath);
if ($rc !== true) {
    http_response_code(500);
    echo "zip open failed: code $rc";
    exit;
}

$count = $zip->numFiles;
if (!$zip->extractTo($root)) {
    $zip->close();
    http_response_code(500);
    echo "extractTo failed";
    exit;
}
$zip->close();
@unlink($zipPath);

echo "ok extracted=$count";
