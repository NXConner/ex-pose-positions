# bootstrap.ps1 - PowerShell bootstrap script (Windows)
Write-Host "Bootstrap start: $(Get-Date)"

# Exit on error
$ErrorActionPreference = "Stop"

# Check Node
try {
    $nodeVersion = node -v
    Write-Host "Node version: $nodeVersion"
} catch {
    Write-Error "Node is not installed or not in PATH. Install Node (>=18) then re-run."
    exit 1
}

# Install dependencies (creates package-lock.json)
Write-Host "Running npm install..."
npm install

# Generate thumbnails if script present
if (Test-Path "./scripts/generate-thumbnails.js") {
    Write-Host "Generating thumbnails..."
    node ./scripts/generate-thumbnails.js
} else {
    Write-Host "Thumbnail generation script not found. Skipping."
}

# Import and normalize positions.zip if present and script exists
if ((Test-Path "./scripts/import-positions.js") -and (Test-Path "./positions.zip")) {
    Write-Host "Importing positions.zip..."
    node ./scripts/import-positions.js
} else {
    Write-Host "Import script or positions.zip not found. Skipping."
}

# Validate data.json (optional)
if (Test-Path "./scripts/validate-data.js") {
    Write-Host "Validating data.json..."
    node ./scripts/validate-data.js
} else {
    Write-Host "Data validation script not found. Skipping."
}

# Lint / Typecheck / Test / Build (best-effort; some scripts may be missing)
Write-Host "Running lint..."
try { npm run lint } catch { Write-Warning "lint step failed (eslint may not be installed). Continuing..." }

Write-Host "Running typecheck..."
try { npm run typecheck } catch { Write-Warning "typecheck step failed. Continuing..." }

Write-Host "Running tests..."
try { npm run test } catch { Write-Warning "test step failed or not configured. Continuing..." }

Write-Host "Running build..."
try { npm run build } catch { Write-Warning "build failed. Inspect output." }

Write-Host "Bootstrap complete. Start dev server with: npm run dev"