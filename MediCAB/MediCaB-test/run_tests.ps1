param(
    [string]$Type = "all",      # "all", "e2e", "unit-backend", "unit-frontend"
    [string]$Marker = "",
    [switch]$Headed = $false
)

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  🏥 MediCAB — Suite Complète de Tests QA" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$root = $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }
Set-Location $root

$env:NODE_OPTIONS = "--use-system-ca"
$python = "..\MediCaB-backend\.venv\Scripts\python.exe"

# 1. Tests Unitaires Frontend (Vitest)
if ($Type -in @("all", "unit-frontend")) {
    Write-Host "`n[1/2] Exécution des Tests Unitaires Frontend (Vitest)..." -ForegroundColor Yellow
    Push-Location "..\MediCaB-frontend"
    npm run test:unit
    Pop-Location
}

# 2. Tests Pytest (E2E Playwright + Unit Backend)
if ($Type -in @("all", "e2e", "unit-backend")) {
    $targetDir = ""
    if ($Type -eq "e2e") { $targetDir = "tests" }
    elseif ($Type -eq "unit-backend") { $targetDir = "unit_backend" }

    Write-Host "`n[2/2] Exécution des Tests Pytest ($Type)..." -ForegroundColor Yellow
    $argsList = @("-m", "pytest")
    if ($targetDir) { $argsList += $targetDir }
    if ($Marker) { $argsList += "-m"; $argsList += $Marker }
    if ($Headed) { $argsList += "--headed" }

    & $python @argsList
}

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "  ✅ Campagne de test terminée !" -ForegroundColor Green
Write-Host "  Rapport HTML Pytest : $root\reports\report.html" -ForegroundColor White
Write-Host "========================================================`n" -ForegroundColor Green
