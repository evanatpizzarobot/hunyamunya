#!/bin/bash
# Repairs and finishes the 2026-10-21 HSTS change. Safe to re-run.
#
# A botched sed earlier that day left a literal `$H` line in the site config,
# so `nginx -t` fails (the running nginx kept its last good config, but every
# deploy's reload step fails and a restart would not come back). This removes
# that stray line, then adds Strict-Transport-Security to both 443 server
# blocks: the main site and the www -> apex redirect. No includeSubDomains,
# because mail. still points at the old cPanel box.
#
# If nginx -t still fails, both files are restored from the pre-edit backups
# in /root and nginx stays on the old config.
#
# Run from Windows:
#
#   .\site\scripts\run-on-vps.ps1 vps-hsts-patch

set -e

SITES=/etc/nginx/sites-available
MAIN=$SITES/hunyamunya
WWW=$SITES/hunyamunya-www-redirect
HSTS='    add_header Strict-Transport-Security "max-age=31536000" always;'

restore() {
    for f in hunyamunya hunyamunya-www-redirect; do
        if [ -f "/root/$f.pre-hsts" ]; then cp -a "/root/$f.pre-hsts" "$SITES/$f"; fi
    done
}

# 1. Drop the stray line(s) left by the failed edit.
sed -i '/^[[:space:]]*\$H[[:space:]]*$/d' "$MAIN" "$WWW"

# 2. Insert HSTS once per file, right after a literal anchor line.
insert_after() {
    local file=$1 anchor=$2 tmp
    if grep -q 'Strict-Transport-Security' "$file"; then
        echo "HSTS already present in $file"
        return
    fi
    if ! grep -qF "$anchor" "$file"; then
        echo "ERROR: cannot find '$anchor' in $file"
        exit 1
    fi
    tmp=$(mktemp)
    awk -v h="$HSTS" -v a="$anchor" '{ print } !done && index($0, a) { print h; done = 1 }' "$file" > "$tmp"
    cat "$tmp" > "$file"
    rm -f "$tmp"
    echo "inserted HSTS into $file"
}
insert_after "$MAIN" 'add_header Permissions-Policy'
# The first www server_name is the 443 block; the port 80 block comes after.
insert_after "$WWW" 'server_name www.hunyamunyarecords.com;'

# 3. Test, and fall back to the pre-edit files if the test fails.
if nginx -t; then
    systemctl reload nginx
    echo "nginx reloaded with HSTS"
else
    echo "nginx -t failed; restoring pre-edit backups"
    restore
    nginx -t && systemctl reload nginx
    exit 1
fi

echo ""
echo "Changes vs the pre-edit backups (expect one added line per file):"
diff /root/hunyamunya.pre-hsts "$MAIN" || true
diff /root/hunyamunya-www-redirect.pre-hsts "$WWW" || true
