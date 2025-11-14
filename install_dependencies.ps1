<#
    Intimacy Companion Suite – Dependency Bootstrapper

    Usage:
      pwsh -File ./install_dependencies.ps1 [-SkipPlaywright] [-NoHusky]

    - Safe to re-run (idempotent).
    - Installs pnpm dependencies, Playwright browsers, and prepares Husky hooks.
#>

[CmdletBinding()]
param(
    [switch] $SkipPlaywright,
    [switch] $NoHusky
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Section {
    param([string] $Message)
    Write-Host "`n==== $Message ====" -ForegroundColor Cyan
}

function Assert-Command {
    param(
        [Parameter(Mandatory)] [string] $Name,
        [string] $InstallHint
    )
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        if ($InstallHint) {
            throw "Required command '$Name' not found. Install hint: $InstallHint"
        }
        throw "Required command '$Name' not found."
    }
}

Write-Section "Environment checks"
Assert-Command -Name "node" -InstallHint "https://nodejs.org/en/download"
Assert-Command -Name "pnpm" -InstallHint "npm install -g pnpm"

$nodeVersion = (node -v)
if (-not ($nodeVersion -match '^v1[68-9]')) {
    Write-Warning "Node version $nodeVersion detected. Recommended >= 18 LTS."
}

Write-Section "Install JavaScript dependencies"
pnpm install

if (-not $SkipPlaywright) {
    Write-Section "Install Playwright browsers"
    pnpm exec playwright install --with-deps
}

if (-not $NoHusky) {
    Write-Section "Configure Husky git hooks"
    if (-not (Test-Path ".husky")) {
        pnpm exec husky install
    } else {
        pnpm exec husky install | Out-Null
    }
}

Write-Section "Bootstrap complete"
Write-Host "Run 'pnpm lint' and 'pnpm test' to validate setup." -ForegroundColor Green

