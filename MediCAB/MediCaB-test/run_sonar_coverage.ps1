# ====================================================================
# MediCAB — Script PowerShell de Couverture SonarQube
# ====================================================================
param (
    [switch]$ScanWithSonar
)

$ErrorActionPreference = "Continue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host " [MediCAB-QA] Génération des Rapports de Couverture SonarQube" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan

$PythonExe = Join-Path $ScriptDir "..\MediCaB-backend\.venv\Scripts\python.exe"
if (-not (Test-Path $PythonExe)) {
    Write-Error "Environnement virtuel introuvable : $PythonExe"
    exit 1
}

$ReportsDir = Join-Path $ScriptDir "reports"
if (-not (Test-Path $ReportsDir)) {
    New-Item -ItemType Directory -Path $ReportsDir | Out-Null
}

Write-Host "`n[1/2] Exécution des tests unitaires Backend + Calcul Couverture..." -ForegroundColor Yellow
& $PythonExe -m pytest unit_backend/ `
    --cov=../MediCaB-backend/accounts `
    --cov=../MediCaB-backend/clinic `
    --cov=../MediCaB-ai `
    --cov-report=xml:reports/coverage.xml `
    --cov-report=term

Write-Host "`n[2/2] Exécution des tests unitaires Frontend (Vitest) + Couverture..." -ForegroundColor Yellow
$FrontendDir = Join-Path $ScriptDir "..\MediCaB-frontend"
Push-Location $FrontendDir
try {
    & npx vitest run --coverage
} finally {
    Pop-Location
}

Write-Host "`n====================================================================" -ForegroundColor Green
Write-Host " [SUCCÈS] Tous les rapports de couverture SonarQube sont prêts :" -ForegroundColor Green
Write-Host "  - Backend (Python)  : MediCAB\MediCaB-test\reports\coverage.xml" -ForegroundColor White
Write-Host "  - Frontend (Vitest) : MediCAB\MediCaB-frontend\coverage\lcov.info" -ForegroundColor White
Write-Host "  - Fichier Config    : MediCAB\MediCaB-test\sonar-project.properties" -ForegroundColor White
Write-Host "====================================================================" -ForegroundColor Green
