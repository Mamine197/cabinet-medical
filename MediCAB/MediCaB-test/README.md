# 🧪 MediCAB — Framework de Tests Automatisés (Pytest + Playwright)

> Framework d'assurance qualité (QA) et de tests de bout en bout (E2E) pour l'ERP médical **MediCAB**, fondé sur le patron **Page Object Model (POM)**, **Pytest** et **Playwright**.

---

## 🏗️ Architecture du Dossier `MediCaB-test/`

```text
MediCaB-test/
│
├── 📂 pages/                      # 📄 Page Object Model (POM)
│   ├── base_page.py               # Méthodes génériques de navigation et d'attente
│   ├── login_page.py              # Mire de connexion et gestion des erreurs
│   ├── dashboard_page.py          # Grille d'apps Odoo, recherche et déconnexion
│   └── ai_page.py                 # Centre Copilot IA (SOAP, CNSS, No-Show)
│
├── 📂 tests/                      # 🧪 Scénarios de tests automatisés
│   ├── test_01_auth_smoke.py      # Tests de fumée : login, rejets et logout
│   ├── test_02_rbac_matrix.py     # Matrice des droits & étanchéité Secret Médical (IHM + API)
│   └── test_03_ai_clinical_features.py # Validation des fonctionnalités IA et calculs AMO
│
├── 📂 reports/                    # 📊 Rapports d'exécution HTML
│   └── report.html                # Rapport interactif complet avec statuts et durées
│
├── 📜 conftest.py                 # Fixtures Pytest partagées (navigateurs, comptes de test)
├── 📜 pytest.ini                  # Configuration des marqueurs, base_url et reporting
├── 📜 requirements.txt            # Dépendances de test (pytest, playwright, pytest-html)
├── 🚀 run_tests.bat               # Script de lancement rapide Windows (double-clic)
└── 🚀 run_tests.ps1               # Script PowerShell avec options (-Headed, -Marker)
```

---

## 🚀 Comment Lancer les Tests

### 1. Prérequis
Assurez-vous que l'application MediCAB est bien lancée :
- Frontend : `http://localhost:4200`
- Backend API : `http://127.0.0.1:8000`
- Microservice IA : `http://127.0.0.1:8001`

### 2. Exécution Rapide en 1 Clic
Double-cliquez sur `run_tests.bat` ou exécutez dans PowerShell :
```powershell
.\run_tests.ps1
```

### 3. Exécution avec Navigateur Visible (Mode Headed)
Idéal pour voir le navigateur exécuter les actions en direct :
```powershell
.\run_tests.ps1 -Headed
```

### 4. Filtrer par Tag / Marqueur
- **Uniquement les tests de fumée (Smoke) :**
  ```powershell
  .\run_tests.ps1 -Marker "smoke"
  ```
- **Uniquement les tests de sécurité & contrôle d'accès (RBAC) :**
  ```powershell
  .\run_tests.ps1 -Marker "rbac"
  ```
- **Uniquement les tests IA :**
  ```powershell
  .\run_tests.ps1 -Marker "ai"
  ```

---

## 📊 Consultation des Rapports de Test

Après chaque exécution, ouvrez simplement le rapport HTML généré :
`MediCAB/MediCaB-test/reports/report.html` dans n'importe quel navigateur pour consulter les statuts détaillés, les temps d'exécution et les logs.
