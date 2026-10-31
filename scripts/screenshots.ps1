# Maakt storescreenshots (1280x800) van de demo met verzonnen gegevens,
# via Microsoft Edge in headless modus. Gebruik: ./scripts/screenshots.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$edge = @(
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw "Microsoft Edge niet gevonden" }

$out = Join-Path $root "store\screenshots"
New-Item -ItemType Directory -Force $out | Out-Null
$profile = Join-Path $env:TEMP "mylearnq-plus-shots"
$demo = "file:///" + ((Join-Path $root "store\demo\demo.html") -replace "\\", "/")

$shots = [ordered]@{
  "1-overzicht"   = "view=dashboard"
  "2-challenges"  = "view=challenges"
  "3-challenge"   = "view=challenges&click=" + [uri]::EscapeDataString('[data-ch="2"]')
  "4-check-in"    = "view=checkin&theme=light"
  "5-chat"        = "view=chat&click=" + [uri]::EscapeDataString('[data-room="demo"]')
  "6-aanpassen"   = "view=dashboard&theme=light&accent=%233563c9&click=" + [uri]::EscapeDataString('[data-act="customize"]')
}

foreach ($name in $shots.Keys) {
  $file = Join-Path $out "$name.png"
  $args = @(
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
    "--user-data-dir=$profile", "--allow-file-access-from-files",
    "--window-size=1280,800", "--virtual-time-budget=8000",
    "--screenshot=$file", "$demo`?$($shots[$name])"
  )
  Start-Process -FilePath $edge -ArgumentList $args -Wait -WindowStyle Hidden
  Write-Host "Gemaakt: $file"
}
