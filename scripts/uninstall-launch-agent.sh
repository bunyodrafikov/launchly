#!/usr/bin/env bash
set -euo pipefail

label="startup-dashboard"
plist="$HOME/Library/LaunchAgents/$label.plist"

launchctl bootout "gui/$(id -u)" "$plist" >/dev/null 2>&1 || true
rm -f "$plist"
echo "Uninstalled. Logs in ~/Library/Logs/startup-dashboard were left in place."
