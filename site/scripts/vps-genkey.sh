#!/bin/bash
# Generate a new SSH keypair for the `deploy` user, authorize the public
# half for SSH login, and print the private half so it can be stored as
# the SSH_PRIVATE_KEY secret in GitHub Actions.
#
# Run once on the VPS as root:
#   wget https://raw.githubusercontent.com/evanatpizzarobot/hunyamunya/main/site/scripts/vps-genkey.sh
#   bash vps-genkey.sh

set -e

su - deploy -c '
  ssh-keygen -t ed25519 -f ~/.ssh/github-deploy -N "" >/dev/null
  cat ~/.ssh/github-deploy.pub >> ~/.ssh/authorized_keys
'

echo ""
echo "===== COPY THE PRIVATE KEY BELOW (from BEGIN to END inclusive) ====="
echo ""
cat /home/deploy/.ssh/github-deploy
echo ""
echo "===== END OF PRIVATE KEY ====="
