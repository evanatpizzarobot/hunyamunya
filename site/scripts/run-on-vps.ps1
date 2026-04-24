# Run a vps-*.sh install/maintenance script on the production VPS as root,
# from your local Windows machine. PowerShell-native version of run-on-vps.sh.
#
# Usage:
#   .\site\scripts\run-on-vps.ps1 vps-stats-install
#
# Examples:
#   .\site\scripts\run-on-vps.ps1 vps-stats-install
#   .\site\scripts\run-on-vps.ps1 vps-cache-control-patch
#
# The wrapper SSHes to the VPS and runs:
#   curl -fsSL https://raw.githubusercontent.com/.../<branch>/site/scripts/<name>.sh | bash
#
# Env overrides:
#   $env:HMR_VPS_HOST           - SSH target (default: root@208.111.40.106)
#   $env:HMR_VPS_SCRIPT_BRANCH  - branch to fetch script from (default: main)
#
# Requires:
#   - SSH access as root to the VPS (your laptop's pubkey already in
#     /root/.ssh/authorized_keys on the VPS).
#   - The target script committed and pushed to the configured branch on
#     GitHub.

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$ScriptName
)

$ErrorActionPreference = "Stop"

$VpsHost = if ($env:HMR_VPS_HOST) { $env:HMR_VPS_HOST } else { "root@208.111.40.106" }
$Branch  = if ($env:HMR_VPS_SCRIPT_BRANCH) { $env:HMR_VPS_SCRIPT_BRANCH } else { "main" }
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not $ScriptName) {
    Write-Output "Usage: .\site\scripts\run-on-vps.ps1 <script-name>"
    Write-Output ""
    Write-Output "Available scripts:"
    Get-ChildItem -Path $ScriptDir -Filter "vps-*.sh" | ForEach-Object {
        Write-Output ("  " + $_.BaseName)
    }
    exit 1
}

$ScriptName = $ScriptName -replace '\.sh$', ''
$LocalScript = Join-Path $ScriptDir "$ScriptName.sh"

if (-not (Test-Path $LocalScript)) {
    Write-Error "$LocalScript not found"
    exit 1
}

# Warn when local copy differs from origin/$Branch (the VPS fetches from
# GitHub raw, not from your working tree).
$RepoRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$RelPath = "site/scripts/$ScriptName.sh"
Push-Location $RepoRoot
try {
    git diff --quiet "origin/$Branch" -- $RelPath 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Output "WARNING: $RelPath on your local branch differs from origin/$Branch."
        Write-Output "The VPS will run the version on origin/$Branch."
        $reply = Read-Host "Continue? [y/N]"
        if ($reply -notmatch '^[Yy]$') {
            Write-Output "Aborted."
            exit 1
        }
    }
} finally {
    Pop-Location
}

$RemoteUrl = "https://raw.githubusercontent.com/evanatpizzarobot/hunyamunya/$Branch/site/scripts/$ScriptName.sh"

Write-Output "Target: $VpsHost"
Write-Output "Fetch:  $RemoteUrl"
Write-Output ""

ssh $VpsHost "curl -fsSL '$RemoteUrl' | bash"
exit $LASTEXITCODE
