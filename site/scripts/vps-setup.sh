#!/bin/bash
# VPS bootstrap: installs nginx + node, creates a `deploy` user for GitHub
# Actions SSH, lays down the web root, and writes an nginx server block for
# hunyamunyarecords.com. Run as root on a fresh Ubuntu 24.04 VPS:
#
#   curl -fsSL https://raw.githubusercontent.com/evanatpizzarobot/hunyamunya/main/site/scripts/vps-setup.sh | bash
#
# After this completes, paste your deploy-actions.pub into
# /home/deploy/.ssh/authorized_keys (one-liner shown at end of output).

set -e

apt update -qq
apt install -y nginx curl git

curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

useradd -m -s /bin/bash deploy || true
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
touch /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh

mkdir -p /var/www/hunyamunya
chown -R deploy:deploy /var/www/hunyamunya

cat > /etc/nginx/sites-available/hunyamunya <<'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name hunyamunyarecords.com www.hunyamunyarecords.com _;
    root /var/www/hunyamunya;
    index index.html;
    location / { try_files $uri $uri.html $uri/ =404; }
    location /_next/ { expires 1y; add_header Cache-Control "public, immutable"; }
}
NGINX

ln -sf /etc/nginx/sites-available/hunyamunya /etc/nginx/sites-enabled/hunyamunya
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx

echo ""
echo "==== base setup done ===="
echo ""
echo "Next: from this same shell, paste the following then hit Enter (replace"
echo "the inner line with the exact contents of your deploy-actions.pub):"
echo ""
echo "echo 'ssh-ed25519 AAAA...your-key-here... deploy-actions' >> /home/deploy/.ssh/authorized_keys"
echo ""
