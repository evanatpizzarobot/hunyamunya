#!/bin/bash
# One-time migration for the already-provisioned NetActuate VPS
# (208.111.40.106). Replaces the minimal server block laid down by
# vps-setup.sh with the full cutover-ready block: include of the redirect
# snippet, dotfile deny, security headers, trailing-.html strip, and
# sudoers grant for deploy-triggered nginx reloads.
#
# Run as root on the VPS:
#
#   curl -fsSL https://raw.githubusercontent.com/evanatpizzarobot/hunyamunya/main/site/scripts/vps-nginx-cutover.sh | sudo bash
#
# Safe to re-run; writes are idempotent (overwrite, not append).

set -e

# Bootstrap the snippet file so the `include` below resolves on first load.
# The deploy workflow overwrites this on every push to main.
touch /var/www/hunyamunya/.nginx-redirects.conf
chown deploy:deploy /var/www/hunyamunya/.nginx-redirects.conf

# Content-type-keyed Cache-Control. Keeps static assets immutable (1y) but
# forces HTML to revalidate on every hit, so edits go live immediately
# without users needing a hard refresh. `map` has to live in http context.
cat > /etc/nginx/conf.d/hmr-cache-control.conf <<'MAP'
map $sent_http_content_type $hmr_cache_control {
    default                "public, max-age=31536000, immutable";
    ~^text/html            "public, max-age=0, must-revalidate";
    ~^application/xml      "public, max-age=3600";
    ~^text/xml             "public, max-age=3600";
}
MAP

cat > /etc/nginx/sites-available/hunyamunya <<'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name hunyamunyarecords.com www.hunyamunyarecords.com _;
    root /var/www/hunyamunya;
    index index.html;

    location ~ /\.(?!well-known) { deny all; }
    location ^~ /migration/ { deny all; }

    include /var/www/hunyamunya/.nginx-redirects.conf;

    location /_next/ { expires 1y; add_header Cache-Control "public, immutable"; }

    if ($request_uri ~ ^/(.*)\.html(\?.*)?$) { return 301 /$1$2; }

    location / { try_files $uri $uri.html $uri/ =404; }

    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    add_header Cache-Control $hmr_cache_control always;
}
NGINX

ln -sf /etc/nginx/sites-available/hunyamunya /etc/nginx/sites-enabled/hunyamunya
rm -f /etc/nginx/sites-enabled/default

cat > /etc/sudoers.d/deploy-nginx <<'SUDO'
deploy ALL=(root) NOPASSWD: /usr/sbin/nginx -t, /bin/systemctl reload nginx
SUDO
chmod 440 /etc/sudoers.d/deploy-nginx

nginx -t
systemctl reload nginx

echo ""
echo "==== nginx cutover done ===="
echo "Server block updated, redirect-snippet include in place, deploy"
echo "user has NOPASSWD sudo for nginx -t + reload."
echo ""
echo "Next steps (do in order):"
echo "  1. Push the matching commit on main to trigger a deploy. The workflow"
echo "     will rsync the real .nginx-redirects.conf and reload nginx."
echo "  2. Verify redirects: curl -sI http://208.111.40.106/?p=20 | head"
echo "     (expect 301 to /news/2010/rykard-arrive-the-radio-beacon)"
echo "  3. Flip DNS, then run certbot for SSL (see project memory)."
