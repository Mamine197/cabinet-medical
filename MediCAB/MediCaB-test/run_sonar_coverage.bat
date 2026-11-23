@echo off
setlocal
cd /d "%~dp0"

echo ====================================================================
echo  [MediCAB-QA] Generation des Rapports de Couverture pour SonarQube
echo ====================================================================
echo.

set PYTHON_EXE=..\MediCaB-backend\.venv\Scripts\python.exe

if not exist "%PYTHON_EXE%" (
    echo [ERREUR] L'environnement virtuel backend est introuvable.
    exit /b 1
)

if not exist "reports" mkdir reports

echo [1/2] Execution des tests unitaires Backend + Calcul Couverture...
"%PYTHON_EXE%" -m pytest unit_backend/ --cov=../MediCaB-backend/accounts --cov=../MediCaB-backend/clinic --cov=../MediCaB-ai --cov-report=xml:reports/coverage.xml --cov-report=term
if %ERRORLEVEL% neq 0 (
    echo [ATTENTION] Certains tests backend ont signale des anomalies.
)

echo.
echo [2/2] Execution des tests unitaires Frontend (Vitest) + Couverture...
cd ..\MediCaB-frontend
call npx vitest run --coverage
cd ..\MediCaB-test

echo.
echo ====================================================================
echo  [SUCCES] Rapports de couverture SonarQube prets :
echo   - Backend (Python)  : MediCaB-test/reports/coverage.xml
echo   - Frontend (Vitest) : MediCaB-frontend/coverage/lcov.info
echo ====================================================================
echo.
pause
