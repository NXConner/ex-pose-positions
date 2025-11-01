param(
  [switch]$WithEmulator = $false,
  [switch]$WithLoad = $false
)

function ExecOrWarn($cmd, $args) {
  try {
    & $cmd $args
    if ($LASTEXITCODE -ne 0) { throw "Command failed: $cmd $args" }
  } catch {
    Write-Warning $_
  }
}

Write-Host "==> Checking pnpm" -ForegroundColor Cyan
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Write-Error "pnpm is required. Install from https://pnpm.io/installation"
  exit 1
}

Write-Host "==> Installing dependencies" -ForegroundColor Cyan
ExecOrWarn pnpm "install"

Write-Host "==> Running unit tests (Vitest)" -ForegroundColor Cyan
ExecOrWarn pnpm "test"

Write-Host "==> Installing Playwright browsers" -ForegroundColor Cyan
ExecOrWarn pnpm "e2e:install"

Write-Host "==> Running E2E tests (Playwright)" -ForegroundColor Cyan
ExecOrWarn pnpm "e2e"

if ($WithLoad) {
  Write-Host "==> Running k6 smoke test" -ForegroundColor Cyan
  if (Get-Command k6 -ErrorAction SilentlyContinue) {
    ExecOrWarn pnpm "k6"
  } else {
    Write-Warning "k6 not found; skipping load test. Install from https://k6.io/"
  }
}

if ($WithEmulator) {
  Write-Host "==> Starting Firebase Emulator (foreground)" -ForegroundColor Cyan
  if (Get-Command firebase -ErrorAction SilentlyContinue) {
    firebase emulators:start
  } else {
    Write-Warning "Firebase CLI not found; skipping emulator. Install: npm i -g firebase-tools"
  }
}

Write-Host "==> Done" -ForegroundColor Green

