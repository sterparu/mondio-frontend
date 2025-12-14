#!/bin/bash

# Script pentru deploy backend pe Heroku cu baza de date existentă
# Utilizare: ./deploy-backend.sh

set -e  # Oprește scriptul la prima eroare

echo "🚀 Deploy Backend pe Heroku"
echo "============================"
echo ""

# Culori pentru output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verifică dacă Heroku CLI este instalat
if ! command -v heroku &> /dev/null; then
    echo -e "${RED}❌ Heroku CLI nu este instalat!${NC}"
    echo "Instalează-l de la: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Verifică dacă ești logat în Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Nu ești logat în Heroku. Te rog să te loghezi...${NC}"
    heroku login
fi

# Numele aplicației (poți modifica)
APP_NAME="mondio-backend"

echo -e "${YELLOW}📋 Configurare aplicație: ${APP_NAME}${NC}"
echo ""

# Verifică dacă aplicația există
if heroku apps:info $APP_NAME &> /dev/null; then
    echo -e "${GREEN}✅ Aplicația $APP_NAME există deja${NC}"
else
    echo -e "${YELLOW}📦 Creare aplicație nouă...${NC}"
    heroku create $APP_NAME
fi

echo ""
echo -e "${YELLOW}🔧 Configurare variabile de mediu...${NC}"

# Verifică dacă există addon PostgreSQL
echo "Verificare addon PostgreSQL..."
if ! heroku addons -a $APP_NAME | grep -q "postgres"; then
    echo -e "${YELLOW}⚠️  Nu există addon PostgreSQL. Adaugă unul...${NC}"
    read -p "Vrei să adaugi addon PostgreSQL? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Adaugă addon PostgreSQL (mini plan)..."
        heroku addons:create heroku-postgresql:mini -a $APP_NAME
        echo -e "${GREEN}✅ Addon PostgreSQL adăugat. DATABASE_URL este setat automat.${NC}"
    else
        echo -e "${YELLOW}⚠️  Sari peste adăugarea addon-ului. Asigură-te că DATABASE_URL este setat.${NC}"
    fi
else
    echo -e "${GREEN}✅ Addon PostgreSQL există. DATABASE_URL este setat automat.${NC}"
fi

# Verifică DATABASE_URL
if heroku config:get DATABASE_URL -a $APP_NAME &> /dev/null; then
    echo -e "${GREEN}✅ DATABASE_URL este setat${NC}"
else
    echo -e "${RED}❌ DATABASE_URL nu este setat! Adaugă addon PostgreSQL sau setează-l manual.${NC}"
fi

# Setează NODE_ENV
heroku config:set NODE_ENV=production -a $APP_NAME

# Generează JWT_SECRET dacă nu există
if ! heroku config:get JWT_SECRET -a $APP_NAME &> /dev/null; then
    echo "Generare JWT_SECRET..."
    JWT_SECRET=$(openssl rand -base64 32)
    heroku config:set JWT_SECRET="$JWT_SECRET" -a $APP_NAME
    echo -e "${GREEN}✅ JWT_SECRET generat și setat${NC}"
else
    echo -e "${YELLOW}⚠️  JWT_SECRET există deja. Lasă-l neschimbat.${NC}"
fi

echo ""
echo -e "${YELLOW}📝 Variabile de mediu care trebuie setate manual:${NC}"
echo "  - CLOUDFLARE_R2_ENDPOINT"
echo "  - CLOUDFLARE_R2_ACCESS_KEY_ID"
echo "  - CLOUDFLARE_R2_SECRET_ACCESS_KEY"
echo "  - CLOUDFLARE_R2_BUCKET_NAME"
echo "  - CLOUDFLARE_R2_PUBLIC_URL"
echo "  - CORS_ORIGIN (URL-ul Vercel)"
echo ""

read -p "Vrei să setezi CORS_ORIGIN acum? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Introdu URL-ul Vercel (ex: https://mondio.vercel.app): " CORS_ORIGIN
    if [ ! -z "$CORS_ORIGIN" ]; then
        heroku config:set CORS_ORIGIN="$CORS_ORIGIN" -a $APP_NAME
        echo -e "${GREEN}✅ CORS_ORIGIN setat: $CORS_ORIGIN${NC}"
    fi
fi

echo ""
echo -e "${YELLOW}📦 Pregătire deploy...${NC}"

# Verifică dacă există Procfile
if [ ! -f "Procfile" ]; then
    echo -e "${YELLOW}⚠️  Procfile nu există. Creez unul...${NC}"
    echo "web: node src/index.js" > Procfile
    echo -e "${GREEN}✅ Procfile creat${NC}"
fi

# Verifică dacă există git repository
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Nu există git repository. Inițializez...${NC}"
    git init
    git add .
    git commit -m "Initial commit for Heroku deploy"
fi

echo ""
echo -e "${YELLOW}🚀 Deploy pe Heroku...${NC}"

# Adaugă remote Heroku dacă nu există
if ! git remote | grep -q heroku; then
    heroku git:remote -a $APP_NAME
fi

# Deploy
git add .
git commit -m "Deploy to Heroku" || echo "Nu sunt modificări de commit"
git push heroku main || git push heroku HEAD:main

echo ""
echo -e "${GREEN}✅ Deploy finalizat!${NC}"
echo ""
echo -e "${YELLOW}📋 Următorii pași:${NC}"
echo "  1. Verifică logs: heroku logs --tail -a $APP_NAME"
echo "  2. Rulează migrații: heroku run npm run prisma:migrate -a $APP_NAME"
echo "  3. Testează: curl https://$APP_NAME.herokuapp.com/health"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
echo "  - DATABASE_URL este setat automat de Heroku când adaugi addon PostgreSQL"
echo "  - Setează restul variabilelor de mediu (R2, etc.)"
echo "  - Configurează CORS în backend pentru domeniul Vercel"
echo "  - Verifică că migrațiile rulează după deploy"
echo ""
