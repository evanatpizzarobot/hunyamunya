#!/bin/bash
# Idempotent patch: installs the content-type-keyed Cache-Control on the
# already-cut-over VPS. Safe to re-run. Writes:
#   /etc/nginx/conf.d/hmr-cache-control.conf  (map)
# and appends one `add_header Cache-Control ...` line inside the main
# server block of /etc/nginx/sites-available/hunyamunya (if missing).
#
# Run as root on the VPS:
#
#   curl -fsSL https://raw.githubusercontent.com/evanatpizzarobot/hunyamunya/main/site/scripts/vps-cache-control-patch.sh | sudo bash

set -e

MAP_FILE=/etc/nginx/conf.d/hmr-cache-control.conf
SITE_FILE=/etc/nginx/sites-available/hunyamunya

# Always re-write the map file; it's small and the contents are canonical.
cat > "$MAP_FILE" <<'MAP'
map $sent_http_content_type $hmr_cache_control {
    default                "public, max-age=31536000, immutable";
    ~^text/html            "public, max-age=0, must-revalidate";
    ~^application/xml      "public, max-age=3600";
    ~^text/xml             "public, max-age=3600";
}
MAP
echo "wrote $MAP_FILE"

# Append the add_header directive into the server block exactly once,
# positioned right after the Permissions-Policy line (so it inherits the
# same scope as the other security headers).
if grep -q 'add_header Cache-Control \$hmr_cache_control' "$SITE_FILE"; then
    echo "add_header Cache-Control already present in $SITE_FILE"
else
    if ! grep -q 'Permissions-Policy "geolocation=' "$SITE_FILE"; then
        echo "ERROR: cannot find Permissions-Policy anchor line in $SITE_FILE"
        echo "The server block layout has diverged from what this patch expects."
        exit 1
    fi
    sed -i '/Permissions-Policy "geolocation=/a\    add_header Cache-Control $hmr_cache_control always;' "$SITE_FILE"
    echo "inserted add_header Cache-Control into $SITE_FILE"
fi

# Test and reload
nginx -t
systemctl reload nginx

echo ""
echo "==== cache-control patch done ===="
echo ""
echo "Verify from your workstation:"
echo "  curl -sI https://www.hunyamunyarecords.com/ | grep -i cache-control"
echo "  curl -sI https://www.hunyamunyarecords.com/media/releases/hmr010-nco-cover.jpg | grep -i cache-control"
echo "Expected: HTML shows max-age=0, images show immutable."
