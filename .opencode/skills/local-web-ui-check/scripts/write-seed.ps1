# Requires PowerShell 7+.
# Builds build/__verify-seed.json - the localStorage "@settings" value the web build expects -
# from the settings of the locally installed Electron app. Never prints tokens.
param(
    [string]$SettingsPath = (Join-Path $env:APPDATA "flowerpot\settings.json"),
    [string]$OutPath = "build\__verify-seed.json"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $SettingsPath)) {
    throw "Flowerpot settings not found: $SettingsPath"
}

$raw = Get-Content $SettingsPath -Raw | ConvertFrom-Json
if (-not $raw.flowerpot) {
    throw "No 'flowerpot' entry in $SettingsPath"
}

$fullOutPath = if ([System.IO.Path]::IsPathRooted($OutPath)) {
    $OutPath
} else {
    Join-Path (Get-Location).Path $OutPath
}

$outDir = Split-Path $fullOutPath -Parent
if (-not (Test-Path $outDir)) {
    throw "Output directory does not exist: $outDir (run 'npm run build:renderer' first)"
}

# WebStore expects this exact shape; flowerpot must stay a JSON *string*
$seed = [ordered]@{
    windowDim      = $raw.windowDim
    windowPos      = $raw.windowPos
    autostart      = $raw.autostart
    locale         = $raw.locale
    installationID = $raw.installationID
    flowerpot      = $raw.flowerpot
}

$json = $seed | ConvertTo-Json -Depth 100 -Compress
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($fullOutPath, $json, $utf8NoBom)

$fp = $raw.flowerpot | ConvertFrom-Json

[pscustomobject]@{
    Seed          = $fullOutPath
    Bytes         = $json.Length
    Accounts      = @($fp.accounts).Count
    EnabledQueries = @($fp.queries | Where-Object { $_.enabled }).Count
    EnabledProjects = @($fp.projects | Where-Object { $_.enabled }).Count
    Theme         = $fp.theme
    ColorScheme   = $fp.colorScheme
    Locale        = $raw.locale
} | Format-List
