# Backend MediCAB — Django + MySQL

Ce backend ajoute une API REST pour l'authentification et l'administration des comptes.
Il ne migre PAS les autres modules Angular (patients, rendez-vous, facturation, stock) :
ils restent dans leur stockage local actuel. Ne l'utilisez pas avec de vraies données médicales.

## 1. Préparer MySQL
Dans MySQL Workbench ou le client MySQL, exécuter :
```sql
CREATE DATABASE medicab_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
Créer idéalement un utilisateur MySQL dédié au lieu d'utiliser `root`.

## 2. Installer Django (Windows PowerShell)
```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
```
Renseigner le mot de passe MySQL dans `.env`. Installer au besoin les outils de compilation requis par `mysqlclient`; sur Windows, utiliser un environnement Python compatible et les roues binaires disponibles.

## 3. Démarrer
```powershell
python manage.py makemigrations accounts
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
API disponible sur `http://127.0.0.1:8000/api/`.

## 4. Routes API
- `POST /api/auth/register/` : inscription (les inscriptions publiques ne peuvent pas choisir Administrateur)
- `POST /api/auth/login/` : connexion, renvoie `token` et `user`
- `POST /api/auth/logout/` : invalide le token
- `GET /api/auth/me/` : profil connecté
- `GET/POST /api/users/` : liste/création, administrateur uniquement
- `GET/PUT/PATCH/DELETE /api/users/<id>/` : gestion utilisateurs, administrateur uniquement
- `GET /api/roles/` : liste des rôles
- `/api/permissions/` et `/api/role-permissions/` : gestion des permissions, administrateur uniquement

Pour les routes protégées, envoyer l'en-tête :
`Authorization: Token VOTRE_TOKEN`

## Important
- L'API Django est créée et configurée pour MySQL. Le frontend Angular de cette archive n'est pas encore relié à ces endpoints : la connexion/inscription locale existante doit être remplacée par des appels HttpClient et l'écran générique Utilisateurs doit être branché sur `/api/users/`. Les autres écrans Angular ne sont pas modifiés.
- En production, définir une vraie `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=0`, HTTPS, des règles CORS limitées au domaine réel et une politique de sauvegarde. Pour une application médicale, prévoir une analyse de sécurité et de conformité avant tout usage réel.
