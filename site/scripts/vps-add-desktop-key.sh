#!/bin/bash
# One-time bootstrap: add Evan's desktop SSH pubkey to root's
# authorized_keys so the run-on-vps wrapper can connect from PowerShell
# without needing the noVNC console.
#
# Run once on the VPS as root:
#   curl -fsSL https://raw.githubusercontent.com/evanatpizzarobot/hunyamunya/main/site/scripts/vps-add-desktop-key.sh | bash
#
# Idempotent: safe to re-run; will report "key already present" the
# second time.

set -e

KEY='ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINC+mEG+c6Dm7Jk09VveW9Xq8F+vQj12PXLMf+982YqX evan@vr.org'

mkdir -p /root/.ssh
chmod 700 /root/.ssh

if grep -qF "$KEY" /root/.ssh/authorized_keys 2>/dev/null; then
    echo "key already present"
else
    echo "$KEY" >> /root/.ssh/authorized_keys
    echo "key added"
fi

chmod 600 /root/.ssh/authorized_keys
echo OK
