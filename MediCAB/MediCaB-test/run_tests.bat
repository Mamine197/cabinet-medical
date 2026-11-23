@echo off
chcp 65001 >nul
echo ========================================================
echo   🏥 MediCAB — Suite Globale de Tests (Vitest + Pytest + Playwright)
echo ========================================================

cd /d "%~dp0"
set NODE_OPTIONS=--use-system-ca

echo.
echo [1/2] Lancement des Tests Unitaires Frontend (Vitest)...
cd ..\MediCaB-frontend
call npm run test:unit
cd ..\MediCaB-test

echo.
echo [2/2] Lancement des Tests Pytest (Unitaires Backend + E2E Playwright)...
..\MediCaB-backend\.venv\Scripts\python.exe -m pytest %*

echo.
echo ========================================================
echo   Rapport HTML généré : reports\report.html
echo ========================================================
pause
