# Requires PowerShell 7+.
# Removes the temporary seed and stops the local servers used by the check.
param(
    [int[]]$Ports = @(5009, 5010),
    [string]$SeedPath = "build\__verify-seed.json"
)

$ErrorActionPreference = "Stop"

$fullSeedPath = if ([System.IO.Path]::IsPathRooted($SeedPath)) {
    $SeedPath
} else {
    Join-Path (Get-Location).Path $SeedPath
}

if (Test-Path $fullSeedPath) {
    Remove-Item $fullSeedPath -Force
    "Removed $fullSeedPath"
} else {
    "No seed file at $fullSeedPath"
}

foreach ($port in $Ports) {
    $listeners = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if (-not $listeners) {
        "Port $port is free"
        continue
    }

    foreach ($processId in ($listeners.OwningProcess | Select-Object -Unique)) {
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        "Stopped pid $processId on port $port"
    }
}

# The browser profile keeps the seeded PATs until they are cleared from the page itself:
# localStorage.removeItem("@settings") for the served origin, then navigate to about:blank.
"Browser side: run localStorage.removeItem('@settings') and open about:blank"
