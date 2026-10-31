# Maakt de extensie-iconen, het storelogo en de promotegels uit store/brand,
# via Microsoft Edge in headless modus. Gebruik: ./scripts/brand.ps1

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$edge = @(
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw "Microsoft Edge niet gevonden" }

$profile = Join-Path $env:TEMP "mylearnq-plus-brand"
$page = "file:///" + ((Join-Path $root "store\brand\brand.html") -replace "\\", "/")

function Render($kind, $width, $height, $file) {
  $args = @(
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
    "--user-data-dir=$profile", "--allow-file-access-from-files",
    "--default-background-color=00000000", "--force-device-scale-factor=1",
    "--window-size=$width,$height", "--virtual-time-budget=3000",
    "--screenshot=$file", "$page`?kind=$kind"
  )
  Start-Process -FilePath $edge -ArgumentList $args -Wait -WindowStyle Hidden
  Write-Host "Gemaakt: $file"
}

# Kleine formaten worden uit een groot exemplaar verkleind voor scherpe randen
function Resize($source, $size, $file) {
  $src = [System.Drawing.Image]::FromFile($source)
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.DrawImage($src, 0, 0, $size, $size)
  $bmp.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose(); $src.Dispose()
  Write-Host "Gemaakt: $file"
}

$big = Join-Path $env:TEMP "mylearnq-plus-icon-1024.png"
Render "icon" 1024 1024 $big
foreach ($size in 16, 48, 128) {
  Resize $big $size (Join-Path $root "extension\icons\icon$size.png")
}

$images = Join-Path $root "store\images"
Resize $big 300 (Join-Path $images "logo-300.png")
Render "small" 440 280 (Join-Path $images "promo-440x280.png")
Render "large" 1400 560 (Join-Path $images "promo-1400x560.png")
