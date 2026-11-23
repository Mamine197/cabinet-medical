# 🏥 MediCAB — Guide de Démarrage Rapide

Ce document résume les corrections apportées et explique comment lancer l'application sur votre Mac.

---

## 🛠️ Synthèse des corrections appliquées

1. **Environnement virtuel macOS propre** :
   - Suppression de l'ancien `.venv` Windows (contenant `.exe` et scripts PowerShell incompatibles).
   - Création d'un venv macOS natif (`python3 -m venv .venv`).
   - Compilation et installation réussie de `mysqlclient` et toutes les dépendances via Homebrew (`pkg-config`).
   - Installation de `python-dotenv` pour charger automatiquement les variables d'environnement.

2. **Sécurité et validation Backend (Django REST)** :
   - **Protection contre l'escalade de privilèges** : Inscription publique (`/api/auth/register/`) sécurisée pour empêcher qu'un tiers s'octroie des droits indus.
   - **Correction d'erreur DRF** : Remplacement de `Response` par `JsonResponse` dans la méthode `dispatch()` de `clinic/views.py`.
   - **Support multi-bases de données** : Possibilité d'exécuter l'application soit sur **MySQL**, soit sur **SQLite** via `DB_ENGINE` dans `.env`.

3. **Frontend (Angular 19)** :
   - Réinstallation des binaires natifs pour macOS ARM64 (`@esbuild/darwin-arm64`).
   - Compilation TypeScript / HTML vérifiée avec succès (`ng build` validé).
   - Amélioration de `loadAdminData()` avec `forkJoin` pour garantir le chargement asynchrone synchrone des rôles et permissions.
   - Sécurisation du `switchRole()` en mode démo.

4. **Données de démarrage (Seed Data)** :
   - Commande d'initialisation créée : `python manage.py seed_data`.
   - Permissions, liaisons rôles-permissions et comptes de test prêts à l'emploi.

---

## 🚀 Comment lancer le projet

Dans votre terminal :

```bash
cd /Users/mamina107/Documents/ats-intelligent-backend/MediCAB/MediCAB-Frontend-Backend
./start.sh
```

Le script vous proposera :
- **1) SQLite** : Démarre immédiatement sans configuration de base de données.
- **2) MySQL** : Utilise votre serveur MySQL local (vous demandera votre mot de passe root et créera `medicab_db` automatiquement).

---

## 🔑 Identifiants des comptes de test

| Profil | Email | Mot de passe |
|---|---|---|
| **Administrateur** | `admin@medicab.ma` | `adminpassword123` |
| **Médecin** | `medecin@medicab.ma` | `medecinpassword123` |
| **Secrétaire** | `secretaire@medicab.ma` | `secretairepassword123` |

---

## 🌐 Adresses utiles

- **Frontend Angular** : [http://localhost:4200](http://localhost:4200)
- **API Django REST** : [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)
- **Administration Django** : [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)
