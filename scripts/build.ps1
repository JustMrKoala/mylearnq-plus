# Maakt een zip van de extensie die je kunt uploaden naar de Edge Add-ons store
# (of de Chrome Web Store). Gebruik: ./scripts/build.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root "extension"
$manifest = Get-Content (Join-Path $src "manifest.json") -Raw | ConvertFrom-Json
$version = $manifest.version

$dist = Join-Path $root "dist"
New-Item -ItemType Directory -Force $dist | Out-Null
$zip = Join-Path $dist "mylearnq-plus-$version.zip"
if (Test-Path $zip) { Remove-Item $zip -Confirm:$false }

# manifest.json moet in de hoofdmap van de zip staan, niet in een submap.
# tar (ingebouwd in Windows 10 en nieuwer) schrijft paden met "/", wat stores
# verwachten; Compress-Archive van PowerShell 5.1 gebruikt "\" en dat gaat mis.
Push-Location $src
$tar = Join-Path $env:SystemRoot "System32\tar.exe"
try { & $tar -a -c -f $zip * } finally { Pop-Location }
if ($LASTEXITCODE -ne 0) { throw "tar is mislukt" }
Write-Host "Gemaakt: $zip"
