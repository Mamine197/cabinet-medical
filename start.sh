#!/usr/bin/env bash
# =============================================================
# MediCAB — Script de lancement automatisé (macOS)
# Usage : ./start.sh [sqlite|mysql] [mot_de_passe_mysql]
# =============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/MediCAB/MediCaB-backend"
FRONTEND_DIR="$SCRIPT_DIR/MediCAB/MediCaB-frontend"
AI_DIR="$SCRIPT_DIR/MediCAB/MediCaB-ai"
MODE="${1:-}"
MYSQL_PASS="${2:-}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          🏥  MediCAB — Lanceur Rapide              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"

# ─── Choix du moteur de base de données ──────────────────────
if [ -z "$MODE" ]; then
  echo -e "${YELLOW}Quel moteur de base de données souhaitez-vous utiliser ?${NC}"
  echo "  1) SQLite (Recommandé : Démarrage immédiat sans configuration)"
  echo "  2) MySQL (Production / Développement avec serveur MySQL)"
  read -p "Votre choix [1/2] (défaut: 1) : " CHOICE
  if [ "$CHOICE" = "2" ]; then
    MODE="mysql"
  else
    MODE="sqlite"
  fi
fi

ENV_FILE="$BACKEND_DIR/.env"

if [ "$MODE" = "sqlite" ]; then
  echo -e "${GREEN}Configuration avec SQLite (zéro configuration)...${NC}"
  cat << 'EOF' > "$ENV_FILE"
DJANGO_SECRET_KEY=medicab-secret-dev-key-change-in-production-2026
DJANGO_DEBUG=1
DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost
DB_ENGINE=sqlite
EOF
else
  if [ -z "$MYSQL_PASS" ]; then
    read -s -p "Entrez le mot de passe MySQL root : " MYSQL_PASS
    echo ""
  fi

  echo -e "${BLUE}📦 Préparation de la base MySQL...${NC}"
  mysql -u root -p"${MYSQL_PASS}" -e \
    "CREATE DATABASE IF NOT EXISTS medicab_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null \
    && echo -e "${GREEN}✅ Base medicab_db prête${NC}" \
    || echo -e "${YELLOW}⚠ Avertissement : Vérifiez les identifiants MySQL si la base n'existe pas.${NC}"

  cat << EOF > "$ENV_FILE"
DJANGO_SECRET_KEY=medicab-secret-dev-key-change-in-production-2026
DJANGO_DEBUG=1
DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost
DB_ENGINE=mysql
DB_NAME=medicab_db
DB_USER=root
DB_PASSWORD=${MYSQL_PASS}
DB_HOST=127.0.0.1
DB_PORT=3306
EOF
fi

echo -e "${GREEN}✅ Configuration environnement prête dans .env${NC}"

# ─── Vérification des migrations et seed ─────────────────────
echo -e "${BLUE}🗄 Application des migrations de base de données...${NC}"
cd "$BACKEND_DIR"
.venv/bin/python manage.py migrate --noinput
echo -e "${GREEN}✅ Migrations appliquées avec succès${NC}"

echo -e "${BLUE}🌱 Initialisation des rôles, permissions et données cliniques...${NC}"
.venv/bin/python manage.py seed_data

# ─── Démarrage des serveurs ──────────────────────────────────
cleanup() {
  echo -e "\n${YELLOW}Arrêt des serveurs en cours...${NC}"
  kill $(jobs -p) 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

echo -e "${BLUE}🤖 Démarrage du microservice FastAPI IA (http://127.0.0.1:8001)...${NC}"
cd "$AI_DIR"
"$BACKEND_DIR/.venv/bin/uvicorn" main:app --host 127.0.0.1 --port 8001 &
AI_PID=$!

sleep 1

echo -e "${BLUE}🚀 Démarrage du backend Django (http://127.0.0.1:8000)...${NC}"
cd "$BACKEND_DIR"
.venv/bin/python manage.py runserver 127.0.0.1:8000 &
BACKEND_PID=$!

sleep 2

echo -e "${BLUE}🌐 Démarrage du frontend Angular (http://localhost:4200)...${NC}"
cd "$FRONTEND_DIR"
npx ng serve --port 4200 &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           🎉 MediCAB est 100% en ligne !               ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  🌐 Frontend Angular : http://localhost:4200           ║${NC}"
echo -e "${GREEN}║  ⚙️  Backend Django   : http://127.0.0.1:8000/api/      ║${NC}"
echo -e "${GREEN}║  🤖 Microservice IA  : http://127.0.0.1:8001/docs      ║${NC}"
echo -e "${GREEN}║  🔒 Admin Django     : http://127.0.0.1:8000/admin/    ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Comptes de test pré-configurés :                      ║${NC}"
echo -e "${GREEN}║  • Admin     : admin@medicab.ma / adminpassword123     ║${NC}"
echo -e "${GREEN}║  • Médecin   : medecin@medicab.ma / medecinpassword123 ║${NC}"
echo -e "${GREEN}║  • Secrétaire: secretaire@medicab.ma / secretairepassword123 ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo -e "${YELLOW}Appuyez sur Ctrl+C dans ce terminal pour couper les serveurs.${NC}"

wait
