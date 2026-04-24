<?php
// Token-gated archive extractor called by the deploy workflow. Unzips
// /public_html/site.zip in place, overwriting existing files, then removes
// the zip. Returns a one-line status; any fatal error is captured and
// returned as text so the workflow can surface it.
//
// Token is injected at build time by .github/workflows/deploy.yml. A copy
// of this file pulled from the repo without injection always 404s.

// Always return something, even on fatal error.
register_shutdown_function(function () {
    $e = error_get_last();
    if ($e && in_array($e['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        if (!headers_sent()) { http_response_code(500); }
        echo "\nfatal: " . $e['message'] . " in " . $e['file'] . ":" . $e['line'];
    }
});

@ini_set('display_errors', '0');
@ini_set('log_errors', '1');

$expected = '__DEPLOY_TOKEN__';
$provided = isset($_SERVER['HTTP_X_DEPLOY_TOKEN']) ? $_SERVER['HTTP_X_DEPLOY_TOKEN'] : '';
if ($expected === '__DEPLOY_TOKEN__' || $provided === '' || !hash_equals($expected, $provided)) {
    http_response_code(404);
    exit;
}

@set_time_limit(300);
@ini_set('memory_limit', '512M');

$root = isset($_SERVER['DOCUMENT_ROOT']) ? $_SERVER['DOCUMENT_ROOT'] : dirname(__FILE__);
$zipPath = $root . '/site.zip';

if (!file_exists($zipPath)) {
    http_response_code(500);
    echo "zip missing at $zipPath";
    exit;
}

header('Content-Type: text/plain');

// Prefer ZipArchive (pure PHP, no shell exec needed). Fall back to the
// system `unzip` binary if the extension isn't compiled in.
$count = 0;
$method = '';
if (class_exists('ZipArchive')) {
    $method = 'ziparchive';
    $zip = new ZipArchive();
    $rc = $zip->open($zipPath);
    if ($rc !== true) {
        http_response_code(500);
        echo "ZipArchive::open failed code=$rc";
        exit;
    }
    $count = $zip->numFiles;
    if (!$zip->extractTo($root)) {
        $zip->close();
        http_response_code(500);
        echo "ZipArchive::extractTo failed";
        exit;
    }
    $zip->close();
} else {
    $method = 'unzip-bin';
    // -o overwrite without prompt, -q quiet
    $cmd = 'unzip -oq ' . escapeshellarg($zipPath) . ' -d ' . escapeshellarg($root) . ' 2>&1';
    $out = [];
    $rc = 0;
    exec($cmd, $out, $rc);
    if ($rc !== 0) {
        http_response_code(500);
        echo "unzip rc=$rc out=" . implode("\n", $out);
        exit;
    }
    $count = count($out);
}

@unlink($zipPath);

echo "ok method=$method extracted=$count";
