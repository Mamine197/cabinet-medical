# 🧪 MediCAB — Framework de Tests Automatisés & Qualité de Code (Pytest + Playwright + Vitest + SonarQube)

> Framework d'assurance qualité (QA), de tests de bout en bout (E2E), de tests unitaires et d'analyse de couverture SonarQube pour l'ERP médical **MediCAB**, fondé sur le patron **Page Object Model (POM)**.

---

## 🏗️ Architecture Complète du Dossier `MediCaB-test/`

```text
MediCaB-test/
│
├── 📂 pages/                             # 📄 Page Object Model (POM)
│   ├── base_page.py                      # Méthodes génériques de navigation et d'attente
│   ├── login_page.py                     # Mire de connexion et gestion des erreurs de saisie
│   ├── dashboard_page.py                 # Grille d'apps Odoo, recherche et déconnexion
│   └── ai_page.py                        # Centre Copilot IA (SOAP, CNSS AMO, No-Show)
│
├── 📂 tests/                             # 🧪 Scénarios de tests E2E Playwright
│   ├── test_01_auth_smoke.py             # Tests de fumée : login, rejets et logout
│   ├── test_02_rbac_matrix.py            # Matrice des droits & étanchéité Secret Médical (IHM + API)
│   ├── test_03_ai_clinical_features.py   # Validation des fonctionnalités IA et calculs AMO
│   ├── test_04_patients_module.py        # Gestion des fiches patients et vues kanban/liste
│   ├── test_05_appointments_planning.py  # Planning et grille de rendez-vous
│   ├── test_06_consultations_clinical.py # Dossier clinique, antécédents et constantes
│   ├── test_07_billing_and_kpis.py       # Facturation médicale et paiements
│   ├── test_08_search_and_navigation.py  # Recherche instantanée et panneau de discussion
│   ├── test_09_auth_negative.py          # Tests négatifs : mauvais mot de passe pour les 3 rôles
│   └── test_10_full_patient_journey.py   # 🌟 Le Grand Parcours Patient complet enchaîné de A à Z
│
├── 📂 unit_backend/                      # ⚙️ Tests unitaires Backend & Algorithmes
│   ├── test_django_models_unit.py        # Règle anti-collision rendez-vous (EF-17), rôles & Audit
│   └── test_ai_microservice_unit.py      # SOAP draft, Triage NLP, Calcul AMO, Modèle No-Show
│
├── 📂 reports/                           # 📊 Rapports d'exécution & Couverture Sonar
│   ├── report.html                       # Rapport HTML interactif Playwright & Pytest
│   └── coverage.xml                      # Rapport XML de couverture de code pour SonarQube
│
├── 📜 sonar-project.properties           # 🔍 Configuration officielle SonarQube & SonarCloud
├── 📜 conftest.py                        # Fixtures Pytest partagées (navigateurs, comptes de test)
├── 📜 pytest.ini                         # Configuration des marqueurs, base_url et reporting
├── 📜 requirements.txt                   # Dépendances QA (pytest, playwright, pytest-cov, etc.)
├── 🚀 run_tests.bat                      # Lancement des tests E2E (double-clic)
├── 🚀 run_tests.ps1                      # Lancement PowerShell (-Headed, -Marker)
├── 🚀 run_sonar_coverage.bat             # 🎯 Génération de la couverture SonarQube en 1 clic
└── 🚀 run_sonar_coverage.ps1             # Script PowerShell de calcul de couverture SonarQube
```

---

## 🚀 Comment Lancer les Tests

### 1. Prérequis
Assurez-vous que l'application MediCAB est lancée :
- Frontend : `http://localhost:4200`
- Backend API : `http://127.0.0.1:8000`
- Microservice IA : `http://127.0.0.1:8001`

### 2. Exécution Rapide de Tous les Tests (E2E & Backend)
Double-cliquez sur `run_tests.bat` ou exécutez dans PowerShell :
```powershell
.\run_tests.ps1
```

### 3. Exécution avec Navigateur Visible (Mode Headed)
Idéal pour les démonstrations devant le professeur :
```powershell
.\run_tests.ps1 -Headed
```

---

## 🔍 Intégration SonarQube & SonarCloud

Le dossier `MediCaB-test` contient tout le nécessaire pour l'analyse de qualité de code :

### 1. Générer les rapports de couverture de code
Exécutez simplement :
```powershell
.\run_sonar_coverage.ps1
```
Ce script lance automatiquement les tests unitaires Python (`pytest-cov`) et TypeScript (`vitest --coverage`) pour générer :
- `reports/coverage.xml` (Backend Django & IA FastAPI)
- `../MediCaB-frontend/coverage/lcov.info` (Frontend Angular)

### 2. Lancer l'analyse SonarScanner
Si vous disposez du SonarScanner CLI :
```powershell
sonar-scanner
```
Les fichiers sont configurés dans `sonar-project.properties` pour remonter automatiquement les métriques, la couverture et le Quality Gate.
