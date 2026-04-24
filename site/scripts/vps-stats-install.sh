#!/bin/bash
# VPS install for the stats cron.
#
# Run once on the production VPS as root:
#   curl -fsSL https://raw.githubusercontent.com/evanatpizzarobot/hunyamunya/main/site/scripts/vps-stats-install.sh | bash
#
# After this, /var/www/hunyamunya/api/stats.json is regenerated every minute
# from Nginx access logs, served by the existing Nginx config at
# https://hunyamunyarecords.com/api/stats.json. Add that URL to WebTraffic
# Tracker as a custom source.

set -e

SCRIPT_URL="https://raw.githubusercontent.com/evanatpizzarobot/hunyamunya/main/site/scripts/stats-cron.js"
SCRIPT_PATH="/opt/hunyamunya/stats-cron.js"
OUTPUT_PATH="/var/www/hunyamunya/api/stats.json"
LOG_PATH="/var/log/nginx/access.log"
CRON_USER="deploy"
SITE_NGINX=/etc/nginx/sites-available/hunyamunya

mkdir -p /opt/hunyamunya
curl -fsSL "$SCRIPT_URL" -o "$SCRIPT_PATH"
chmod 0755 "$SCRIPT_PATH"

# The deploy user needs read access to /var/log/nginx. On Ubuntu those logs
# are owned by root:adm mode 640, so adding deploy to adm is the standard fix.
usermod -a -G adm "$CRON_USER" || true

# Output dir must be writable by the cron user.
mkdir -p "$(dirname "$OUTPUT_PATH")"
chown -R "$CRON_USER":"$CRON_USER" "$(dirname "$OUTPUT_PATH")"

# Install the crontab entry for the deploy user. Uses a marker tag so re-runs
# are idempotent.
TAG="# hunyamunya-stats-cron"
CRON_LINE="* * * * * STATS_LOG_PATH=$LOG_PATH STATS_OUTPUT_PATH=$OUTPUT_PATH /usr/bin/node $SCRIPT_PATH $TAG"

TMP_CRON=$(mktemp)
crontab -u "$CRON_USER" -l 2>/dev/null | grep -v "$TAG" > "$TMP_CRON" || true
echo "$CRON_LINE" >> "$TMP_CRON"
crontab -u "$CRON_USER" "$TMP_CRON"
rm -f "$TMP_CRON"

# Run once immediately so stats.json exists before the first cron tick.
sudo -u "$CRON_USER" STATS_LOG_PATH="$LOG_PATH" STATS_OUTPUT_PATH="$OUTPUT_PATH" /usr/bin/node "$SCRIPT_PATH"

# Patch Nginx to override Cache-Control for /api/ so pollers see fresh JSON
# instead of the site-wide "immutable, 1-year" default applied by
# $hmr_cache_control. Idempotent: guards on a sentinel comment.
if [ -f "$SITE_NGINX" ]; then
    if grep -q "# hunyamunya-api-stats-location" "$SITE_NGINX"; then
        echo "api location block already present in $SITE_NGINX"
    else
        if ! grep -q "location / { try_files" "$SITE_NGINX"; then
            echo "ERROR: cannot find 'location / { try_files' anchor in $SITE_NGINX"
            echo "Skipping Nginx patch. Add an /api/ location block manually."
        else
            sed -i '/location \/ { try_files/i\    # hunyamunya-api-stats-location\n    location ^~ /api/ {\n        try_files $uri =404;\n        add_header Cache-Control "public, max-age=30" always;\n        add_header X-Content-Type-Options "nosniff" always;\n    }\n' "$SITE_NGINX"
            echo "inserted /api/ location block into $SITE_NGINX"
            nginx -t
            systemctl reload nginx
        fi
    fi
else
    echo "WARN: $SITE_NGINX not found, skipping Nginx patch"
fi

echo ""
echo "==== stats cron installed ===="
echo ""
echo "Output:   $OUTPUT_PATH"
echo "Public:   https://hunyamunyarecords.com/api/stats.json"
echo ""
echo "Verify:   curl -s https://hunyamunyarecords.com/api/stats.json | head -c 400"
echo "Crontab:  crontab -u $CRON_USER -l"
echo ""
