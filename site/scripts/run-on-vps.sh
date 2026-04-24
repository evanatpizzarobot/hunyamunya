#!/bin/bash
# Run a vps-*.sh install/maintenance script on the production VPS as root,
# from your local machine. One command instead of an interactive SSH session.
#
# Usage:
#   bash site/scripts/run-on-vps.sh <script-name>
#
# Examples:
#   bash site/scripts/run-on-vps.sh vps-stats-install
#   bash site/scripts/run-on-vps.sh vps-cache-control-patch
#
# The script name maps to site/scripts/<script-name>.sh in this repo. The
# wrapper SSHes to the VPS and runs:
#   curl -fsSL https://raw.githubusercontent.com/.../<branch>/site/scripts/<name>.sh | bash
#
# Env overrides:
#   HMR_VPS_HOST           - SSH target (default: root@208.111.40.106)
#   HMR_VPS_SCRIPT_BRANCH  - branch to fetch script from (default: main)
#
# Requires:
#   - SSH access as root to the VPS (your laptop's pubkey already in
#     /root/.ssh/authorized_keys on the VPS).
#   - The target script committed and pushed to the configured branch on
#     GitHub (the VPS pulls via raw.githubusercontent.com, not from your
#     working tree).

set -euo pipefail

SCRIPT_NAME="${1:-}"
VPS_HOST="${HMR_VPS_HOST:-root@208.111.40.106}"
BRANCH="${HMR_VPS_SCRIPT_BRANCH:-main}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ -z "$SCRIPT_NAME" ]; then
    echo "Usage: $0 <script-name>"
    echo ""
    echo "Available scripts:"
    for f in "$SCRIPT_DIR"/vps-*.sh; do
        [ -f "$f" ] || continue
        name=$(basename "$f" .sh)
        echo "  $name"
    done
    exit 1
fi

SCRIPT_NAME="${SCRIPT_NAME%.sh}"
LOCAL_SCRIPT="$SCRIPT_DIR/${SCRIPT_NAME}.sh"

if [ ! -f "$LOCAL_SCRIPT" ]; then
    echo "ERROR: $LOCAL_SCRIPT not found"
    exit 1
fi

# The VPS fetches from origin/$BRANCH, not from your local tree. Warn if
# those would diverge so you don't run a stale copy unknowingly.
if command -v git >/dev/null 2>&1 && git -C "$SCRIPT_DIR" rev-parse --git-dir >/dev/null 2>&1; then
    REL_PATH="site/scripts/${SCRIPT_NAME}.sh"
    if ! git -C "$SCRIPT_DIR/../.." diff --quiet "origin/$BRANCH" -- "$REL_PATH" 2>/dev/null; then
        echo "WARNING: $REL_PATH on your local branch differs from origin/$BRANCH."
        echo "The VPS will run the version on origin/$BRANCH."
        printf "Continue? [y/N] "
        read -r REPLY
        case "$REPLY" in
            y|Y) ;;
            *) echo "Aborted."; exit 1 ;;
        esac
    fi
fi

REMOTE_URL="https://raw.githubusercontent.com/evanatpizzarobot/hunyamunya/${BRANCH}/site/scripts/${SCRIPT_NAME}.sh"

echo "Target: $VPS_HOST"
echo "Fetch:  $REMOTE_URL"
echo ""

ssh "$VPS_HOST" "curl -fsSL '$REMOTE_URL' | bash"
