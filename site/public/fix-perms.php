<?php
// Token-gated chmod endpoint called by the deploy workflow after FTPS upload.
// Recursively resets public_html perms so Apache can serve every file regardless
// of the FTP sub-account's upload umask.
//
// The deploy workflow replaces __DEPLOY_TOKEN__ at build time with the value of
// the DEPLOY_TOKEN repo secret, then curls this endpoint with a matching header.
// Any request that doesn't match returns 404 to avoid revealing the endpoint
// exists; an un-injected build likewise 404s because the placeholder string
// can't match a real token.
//
// If called directly (e.g. during manual recovery), replace __DEPLOY_TOKEN__
// with your secret value, visit the URL with that value in the X-Deploy-Token
// header, then revert.
$expected = '__DEPLOY_TOKEN__';
$provided = $_SERVER['HTTP_X_DEPLOY_TOKEN'] ?? '';
if ($expected === '__DEPLOY_TOKEN__' || $provided === '' || !hash_equals($expected, $provided)) {
    http_response_code(404);
    exit;
}
$root = $_SERVER['DOCUMENT_ROOT'];
$d = 0; $f = 0;
@chmod($root, 0755);
$it = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS),
    RecursiveIteratorIterator::SELF_FIRST
);
foreach ($it as $p) {
    if (is_dir($p)) { @chmod($p, 0755); $d++; }
    else { @chmod($p, 0644); $f++; }
}
echo "ok d=$d f=$f";
