# Requires PowerShell 7+.
# Crops a screenshot taken with chrome-devtools take_screenshot.
# X/Y/Width/Height are page geometry in CSS pixels (getBoundingClientRect), not image pixels.
param(
    [Parameter(Mandatory)][string]$InputPath,
    [Parameter(Mandatory)][string]$OutputPath,
    [Parameter(Mandatory)][double]$X,
    [Parameter(Mandatory)][double]$Y,
    [Parameter(Mandatory)][double]$Width,
    [Parameter(Mandatory)][double]$Height,
    [double]$Dpr = 1.5
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Image]::FromFile((Resolve-Path $InputPath).Path)

try {
    $rect = [System.Drawing.Rectangle]::new(
        [int]($X * $Dpr),
        [int]($Y * $Dpr),
        [int]($Width * $Dpr),
        [int]($Height * $Dpr)
    )
    $rect = [System.Drawing.Rectangle]::Intersect(
        $rect,
        [System.Drawing.Rectangle]::new(0, 0, $src.Width, $src.Height)
    )

    if ($rect.Width -le 0 -or $rect.Height -le 0) {
        throw "Crop rectangle is outside the image ($($src.Width)x$($src.Height))."
    }

    $bmp = [System.Drawing.Bitmap]::new($rect.Width, $rect.Height)

    try {
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        try {
            $g.DrawImage(
                $src,
                [System.Drawing.Rectangle]::new(0, 0, $rect.Width, $rect.Height),
                $rect,
                [System.Drawing.GraphicsUnit]::Pixel
            )
        } finally {
            $g.Dispose()
        }

        $fullOutPath = if ([System.IO.Path]::IsPathRooted($OutputPath)) {
            $OutputPath
        } else {
            Join-Path (Get-Location).Path $OutputPath
        }

        $bmp.Save($fullOutPath, [System.Drawing.Imaging.ImageFormat]::Png)
        "Cropped $($rect.Width)x$($rect.Height) px -> $fullOutPath"
    } finally {
        $bmp.Dispose()
    }
} finally {
    $src.Dispose()
}
