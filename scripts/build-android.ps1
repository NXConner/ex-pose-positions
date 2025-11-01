param(
  [string]$KeystorePath = "release.keystore",
  [string]$KeystoreAlias = "app",
  [string]$KeystorePass = "",
  [string]$BuildTools = "33.0.2"
)

Write-Host "==> Building web" -ForegroundColor Cyan
npm run build

Write-Host "==> Sync Capacitor" -ForegroundColor Cyan
pnpm run cap:sync

Write-Host "==> Assembling Android debug/release" -ForegroundColor Cyan
Push-Location android
./gradlew assembleDebug
./gradlew assembleRelease

$unsigned = "app/build/outputs/apk/release/app-release-unsigned.apk"
$aligned = "app-release-aligned.apk"
$signed = "app-release-signed.apk"

if (-not (Test-Path $unsigned)) { Write-Error "Unsigned release APK not found: $unsigned"; Pop-Location; exit 1 }

if (-not $env:ANDROID_HOME) { Write-Warning "ANDROID_HOME not set; trying default"; $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk" }

# Check if keystore exists in current dir or parent
if (-not (Test-Path $KeystorePath)) {
  $parentKeystore = "..\$KeystorePath"
  if (Test-Path $parentKeystore) { $KeystorePath = $parentKeystore }
  else { Write-Warning "Keystore not found. Skipping signing. Create one with: keytool -genkeypair -v -keystore release.keystore -alias app -keyalg RSA -keysize 4096 -validity 3650" }
}

$zipalign = Join-Path $env:ANDROID_HOME "build-tools/$BuildTools/zipalign.exe"
$apksigner = Join-Path $env:ANDROID_HOME "build-tools/$BuildTools/apksigner.bat"

if (-not (Test-Path $zipalign)) { Write-Warning "zipalign not found at $zipalign. Skipping alignment." }
else {
  Write-Host "==> Aligning APK" -ForegroundColor Cyan
  & $zipalign -v 4 $unsigned $aligned
  if (-not $?) { Write-Warning "zipalign failed" }
}

if (-not (Test-Path $apksigner)) { Write-Warning "apksigner not found at $apksigner. Skipping signing." }
elseif (-not (Test-Path $KeystorePath)) { Write-Warning "Keystore not found. Skipping signing." }
else {
  Write-Host "==> Signing APK" -ForegroundColor Cyan
  if ($KeystorePass -eq "") {
    & $apksigner sign --ks $KeystorePath --ks-key-alias $KeystoreAlias --out $signed $aligned
  } else {
    & $apksigner sign --ks $KeystorePath --ks-key-alias $KeystoreAlias --ks-pass pass:$KeystorePass --key-pass pass:$KeystorePass --out $signed $aligned
  }
  if (-not $?) { Write-Warning "apksigner failed" }
}

Write-Host "==> Artifacts:" -ForegroundColor Green
if (Test-Path "app/build/outputs/apk/debug/app-debug.apk") { Get-Item "app/build/outputs/apk/debug/app-debug.apk" | % { Write-Host $_.FullName } }
if (Test-Path $unsigned) { Get-Item $unsigned | % { Write-Host $_.FullName } }
if (Test-Path $aligned) { Get-Item $aligned | % { Write-Host $_.FullName } }
if (Test-Path $signed) { Get-Item $signed | % { Write-Host $_.FullName } }

Pop-Location

