#!/usr/bin/env bash
# Wrapper to invoke the canonical PowerShell bootstrapper.

set -euo pipefail

if command -v pwsh >/dev/null 2>&1; then
  pwsh -File "$(dirname "$0")/install_dependencies.ps1" "$@"
else
  echo "PowerShell (pwsh) is required to run install_dependencies.ps1" >&2
  exit 1
fi

