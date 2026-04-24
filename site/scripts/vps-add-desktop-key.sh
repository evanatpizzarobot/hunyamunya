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

# Both pubkeys are kept here so the script stays idempotent and so the
# original key (id_ed25519) remains usable from any other client. The
# wrapper on the desktop uses id_hmr_vps because the original key has a
# forgotten passphrase that locks Windows OpenSSH out.
KEYS=(
    'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINC+mEG+c6Dm7Jk09VveW9Xq8F+vQj12PXLMf+982YqX evan@vr.org'
    'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBfTsD4facPokzxzK1iLTydGvScqYmMbqpG7dMKBQg0G evan@hmr-vps-desktop'
)

mkdir -p /root/.ssh
chmod 700 /root/.ssh
touch /root/.ssh/authorized_keys

for KEY in "${KEYS[@]}"; do
    if grep -qF "$KEY" /root/.ssh/authorized_keys; then
        echo "key already present: ${KEY##* }"
    else
        echo "$KEY" >> /root/.ssh/authorized_keys
        echo "key added: ${KEY##* }"
    fi
done

chmod 600 /root/.ssh/authorized_keys
echo OK
