# 🏥 MediCAB — Système Intelligent de Gestion de Cabinet Médical

> Plateforme moderne de gestion médicale conçue selon le style **Odoo ERP**, intégrant un backend robuste **Django 5.2**, une base de données **PostgreSQL 15**, une interface utilisateur réactive **Angular 19** et un microservice d'**Intelligence Artificielle clinique hybride (FastAPI + Ollama / Gemini + Scikit-Learn)**.

---

## 🏗️ Architecture Globale du Projet

```
cabinet-medical/
│
├── 📂 MediCAB/
│   ├── 📂 MediCaB-backend/        # ⚙️ Serveur API REST (Django 5.2 + DRF + PostgreSQL)
│   ├── 📂 MediCaB-frontend/       # 🖥️ Interface Utilisateur (Angular 19 Standalone - Style Odoo)
│   └── 📂 MediCaB-ai/             # 🧠 Microservice d'IA Clinique (FastAPI + NLP + ML)
│
├── 📜 start.sh                    # 🚀 Script de démarrage automatique en 1 clic
├── 📜 GUIDE_DEMARRAGE.md          # 📖 Guide pas à pas d'installation et de configuration
├── 📜 README.md                   # 📋 Présentation et structure détaillée du projet
└── 📜 .gitignore                  # 🔒 Exclusion des fichiers volumineux et sensibles
```

---

## 📁 Rôle Détaillé de Chaque Dossier & Fichier

### 1. ⚙️ Backend Django (`MediCAB/MediCaB-backend/`)
Fournit l'ensemble des APIs REST, la persistance relationnelle sous PostgreSQL, la sécurité et le contrôle d'accès basé sur les rôles (RBAC).

| Fichier / Dossier | Rôle & Responsabilité |
|---|---|
| `config/settings.py` | Configuration globale Django (CORS, JWT/Token, variables d'environnement, dialecte PostgreSQL `django.db.backends.postgresql`). |
| `config/urls.py` | Routeur racine des API (`/api/auth/`, `/api/data/`, `/api/ai/`, etc.). |
| `accounts/models.py` | Modèle d'authentification personnalisé `User` (rôles: Administrateur, Médecin, Secrétaire), `PermissionFeature`, `RolePermission` et `AuditLog` (traçabilité de toutes les actions). |
| `accounts/views.py` | Contrôleurs pour l'inscription, connexion, annuaire du personnel et historique d'audit. |
| `accounts/serializers.py` | Sérialisation et validation métier (sécurité de l'inscription, hashage Argon2/PBKDF2). |
| `accounts/management/commands/seed_data.py` | Initialisation automatique des comptes de démo, des rôles et des données de test. |
| `clinic/models.py` | Modèles relationnels médicaux complets : `Patient`, `DossierMedical`, `RendezVous`, `Consultation`, `Prescription`, `LignePrescription`, `Facture`, `Paiement`. |
| `clinic/permissions.py` | Matrice de secret médical et RBAC (accès réservé aux praticiens pour les dossiers cliniques). |
| `clinic/serializers.py` | Validation d'intégrité relationnelle et **règle anti-collision des rendez-vous** (CA-03/EF-17). |
| `clinic/views.py` | Endpoints CRUD génériques et passerelle proxy sécurisée vers l'IA (`AIProxyView`). |
| `requirements.txt` | Dépendances Python : Django, DRF, psycopg2-binary, django-cors-headers, python-dotenv. |
| `.env` / `.env.example` | Paramètres d'environnement (Secret key, port PostgreSQL 5433, etc.). |

---

### 2. 🖥️ Frontend Angular (`MediCAB/MediCaB-frontend/`)
Interface ergonomique reproduisant l'expérience utilisateur des ERP médicaux modernes (Odoo 17/18).

| Fichier / Dossier | Rôle & Responsabilité |
|---|---|
| `src/main.ts` | Point d'entrée Angular 19, amorçage de l'application avec `provideHttpClient()`. |
| `src/app/app.component.ts` | Contrôleur principal : navigation modulaire Odoo, gestion des rôles, formulaires dynamiques, KPIs temps réel et appels API. |
| `src/app/app.component.html` | Template HTML complet : grille des applications Odoo, fenêtres modales, formulaires de saisie, vue calendrier et centre d'IA. |
| `src/app/services/auth.service.ts` | Service central HTTP : appels vers Django REST API, gestion du token d'authentification et requêtes IA. |
| `src/app/core/models/` | Interfaces TypeScript définissant les contrats de données (`Patient`, `Consultation`, `RendezVous`). |
| `angular.json` | Configuration de compilation de l'application Angular et des assets graphiques. |

---

### 3. 🧠 Microservice d'IA Clinique (`MediCAB/MediCaB-ai/`)
Microservice haute performance développé avec **FastAPI** pour assister les professionnels de santé et les patients.

| Fichier / Dossier | Rôle & Responsabilité |
|---|---|
| `main.py` | Serveur FastAPI exposant les 4 moteurs d'IA clinique sur le port 8001. |
| **Assistant Consultation SOAP** | Synthétise les notes cliniques brutes en format standardisé **SOAP** (Subjectif, Objectif, Analyse, Plan) et suggère des posologies de médicaments. |
| **Chatbot & Triage Patient** | Analyse sémantique des symptômes en NLP, classification de l'urgence médicale (Vert, Jaune, Rouge), avertissement CNDP légal et proposition de prise de rendez-vous. |
| **Simulateur CNSS / AMO Maroc** | Calcul automatique du Tarif National de Référence (TNR), taux de remboursement légal (70%), ticket modérateur patient (30%), prise en charge ALD à 100% et impression de feuille de soins. |
| **Prédiction No-Show (Scikit-Learn)** | Modèle d'arbre de décision prédisant la probabilité d'absence d'un patient à son rendez-vous selon l'âge, l'historique et le délai. |
| **Architecture Hybride** | Bascule automatique : Ollama local ➔ Clé API Gemini ➔ Moteur de règles cliniques expertes. |

---

## 🚀 Démarrage Rapide

### Prérequis
* **Python** >= 3.10
* **Node.js** >= 18 & **npm**
* **PostgreSQL** 14/15/16

### Lancement Automatique en 1 Commande
Le script `start.sh` démarre automatiquement les 3 services :
```bash
./start.sh
```

### URLs d'accès
* 🖥️ **Application Web :** [http://localhost:4200](http://localhost:4200)
* ⚙️ **API Django :** [http://localhost:8000/api/](http://localhost:8000/api/)
* 🧠 **Documentation IA (Swagger) :** [http://localhost:8001/docs](http://localhost:8001/docs)

---

## 👥 Comptes de Démonstration

| Rôle | Adresse E-mail | Mot de passe | Accès autorisés |
|---|---|---|---|
| **Administrateur** | `admin@medicab.ma` | `adminpassword123` | Accès complet, gestion des utilisateurs, journal d'audit, KPIs |
| **Médecin** | `medecin@medicab.ma` | `medecinpassword123` | Consultations, dossiers médicaux, ordonnances, assistant IA SOAP |
| **Secrétaire** | `secretaire@medicab.ma` | `secretairepassword123` | Accueil, rendez-vous, facturation, encaissements, triage patient |

---

## 🛡️ Sécurité & Conformité Réglementaire
* **Secret Médical** : Cloisonnement strict des données cliniques et diagnostics via des permissions côté serveur.
* **Anti-collision d'agenda** : Validation stricte empêchant les conflits d'horaires sur un même praticien.
* **Traçabilité CNDP** : Journal d'audit horodaté pour chaque action métier et consultation IA.
* **Conformité AMO / CNSS** : Respect strict du référentiel de tarification national marocain (TNR).
