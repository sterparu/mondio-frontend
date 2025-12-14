# Ghid de Deploy - Mondio

Acest ghid te va ajuta să deploy-ezi aplicația Mondio cu backend-ul pe Heroku și frontend-ul pe Vercel.

## 📋 Prezentare Generală

- **Backend**: Heroku (Node.js/Fastify)
- **Frontend**: Vercel (React/Vite)
- **Database**: PostgreSQL (Heroku Postgres)
- **Storage**: Cloudflare R2 (pentru imagini și video-uri)

---

## 🚀 Partea 1: Deploy Backend pe Heroku

> **NOTĂ**: 
> - Pentru **baza de date Heroku Postgres** (recomandat): vezi [HEROKU_DEPLOY_HEROKU_DB.md](./HEROKU_DEPLOY_HEROKU_DB.md)
> - Pentru **baza de date externă** (AWS RDS sau altă): vezi [HEROKU_DEPLOY_EXISTING_DB.md](./HEROKU_DEPLOY_EXISTING_DB.md)

### 1.1 Pregătire Backend

Asigură-te că backend-ul are următoarele fișiere:

#### `Procfile` (în root-ul backend-ului)
```
web: node src/index.js
```

#### `package.json` scripts
```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy",
    "postinstall": "npm run prisma:generate && npm run prisma:migrate"
  }
}
```

### 1.2 Creare Aplicație Heroku

```bash
# Instalează Heroku CLI dacă nu ai
# https://devcenter.heroku.com/articles/heroku-cli

# Login în Heroku
heroku login

# Navighează în directorul backend
cd mondio-backend

# Creează aplicația Heroku
heroku create mondio-backend

# Adaugă addon pentru PostgreSQL
heroku addons:create heroku-postgresql:mini

# Verifică variabilele de mediu
heroku config
```

### 1.3 Configurare Variabile de Mediu

```bash
# Setează variabilele de mediu necesare
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-jwt-key-change-this
heroku config:set DATABASE_URL=$(heroku config:get DATABASE_URL)

# Cloudflare R2 (pentru storage)
heroku config:set CLOUDFLARE_R2_ENDPOINT=your-r2-endpoint
heroku config:set CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key
heroku config:set CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-key
heroku config:set CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name
heroku config:set CLOUDFLARE_R2_PUBLIC_URL=your-public-url

# CORS - permite request-uri de la Vercel
heroku config:set CORS_ORIGIN=https://your-app.vercel.app
```

### 1.4 Deploy Backend

```bash
# Asigură-te că ești pe branch-ul corect
git init  # dacă nu există deja
git add .
git commit -m "Prepare for Heroku deploy"

# Adaugă remote Heroku
heroku git:remote -a mondio-backend

# Deploy
git push heroku main

# Verifică logs
heroku logs --tail
```

### 1.5 Verificare Backend

```bash
# Testează endpoint-ul
curl https://mondio-backend.herokuapp.com/health

# Deschide aplicația în browser
heroku open
```

---

## 🌐 Partea 2: Deploy Frontend pe Vercel

### 2.1 Pregătire Frontend

Asigură-te că ai următoarele fișiere în root-ul frontend-ului:
- ✅ `vercel.json` (deja creat)
- ✅ `.env.example` (deja creat)

### 2.2 Creare Proiect Vercel

#### Opțiunea 1: Via CLI

```bash
# Instalează Vercel CLI
npm i -g vercel

# Navighează în directorul frontend
cd mondio-frontend

# Login în Vercel
vercel login

# Deploy
vercel

# Pentru producție
vercel --prod
```

#### Opțiunea 2: Via Dashboard Vercel

1. Mergi pe [vercel.com](https://vercel.com)
2. Sign up / Login cu GitHub
3. Click "Add New Project"
4. Importă repository-ul GitHub
5. Configurează:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (sau lăsă gol)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 2.3 Configurare Variabile de Mediu în Vercel

În dashboard-ul Vercel:

1. Mergi la **Settings** → **Environment Variables**
2. Adaugă:

```
VITE_API_URL=https://mondio-backend.herokuapp.com
```

**IMPORTANT**: 
- Asigură-te că URL-ul backend-ului nu are `/api` la final
- Backend-ul ar trebui să fie accesibil direct la `https://mondio-backend.herokuapp.com`

### 2.4 Redeploy după Configurare

După ce ai setat variabilele de mediu, redeploy-ează:

```bash
vercel --prod
```

Sau din dashboard: **Deployments** → **Redeploy**

---

## 🔧 Partea 3: Configurare CORS în Backend

Asigură-te că backend-ul permite request-uri de la domeniul Vercel:

```javascript
// În backend, configurare CORS
import cors from '@fastify/cors';

await fastify.register(cors, {
  origin: [
    'http://localhost:5173', // Development
    'https://your-app.vercel.app', // Production Vercel
    /\.vercel\.app$/, // Toate subdomeniile Vercel
  ],
  credentials: true,
});
```

---

## 📝 Checklist Pre-Deploy

### Backend (Heroku)
- [ ] `Procfile` creat
- [ ] `package.json` are script `start`
- [ ] Variabile de mediu setate (JWT_SECRET, DATABASE_URL, R2 credentials, CORS_ORIGIN)
- [ ] CORS configurat pentru domeniul Vercel
- [ ] Database migrations rulează automat (postinstall)
- [ ] Backend rulează și răspunde la request-uri

### Frontend (Vercel)
- [ ] `vercel.json` creat
- [ ] `.env.example` creat
- [ ] Variabila `VITE_API_URL` setată în Vercel
- [ ] Build funcționează local (`npm run build`)
- [ ] `src/services/api.js` folosește `import.meta.env.VITE_API_URL`

---

## 🧪 Testare după Deploy

### 1. Testează Backend
```bash
# Health check
curl https://mondio-backend.herokuapp.com/health

# Test endpoint
curl https://mondio-backend.herokuapp.com/api/register
```

### 2. Testează Frontend
1. Deschide aplicația Vercel în browser
2. Încearcă să te înregistrezi
3. Verifică console-ul browser pentru erori
4. Verifică Network tab pentru request-uri către backend

### 3. Debugging

#### Backend logs (Heroku)
```bash
heroku logs --tail
```

#### Frontend logs (Vercel)
- Mergi la **Deployments** → Click pe deployment → **Functions** tab
- Sau verifică console-ul browser

---

## 🔄 Update-uri Viitoare

### Backend
```bash
cd mondio-backend
git add .
git commit -m "Update backend"
git push heroku main
```

### Frontend
```bash
cd mondio-frontend
git add .
git commit -m "Update frontend"
git push origin main
# Vercel va detecta automat și va redeploy
```

Sau manual:
```bash
vercel --prod
```

---

## 🐛 Probleme Comune

### 1. CORS Errors
**Soluție**: Verifică că `CORS_ORIGIN` în Heroku include URL-ul Vercel

### 2. 404 pe rute React Router
**Soluție**: Verifică că `vercel.json` are `rewrites` configurate corect

### 3. API calls nu funcționează
**Soluție**: 
- Verifică că `VITE_API_URL` este setat corect în Vercel
- Verifică că backend-ul este accesibil public
- Verifică CORS în backend

### 4. Database migrations nu rulează
**Soluție**: Verifică că `postinstall` script rulează și că `DATABASE_URL` este setat

---

## 📞 Suport

Dacă întâmpini probleme:
1. Verifică logs în Heroku (`heroku logs --tail`)
2. Verifică logs în Vercel (dashboard)
3. Verifică console-ul browser pentru erori
4. Verifică Network tab pentru request-uri failed

---

## ✅ După Deploy

1. Testează toate funcționalitățile
2. Verifică că PWA funcționează (service worker)
3. Testează pe mobile
4. Configurează domeniu custom (opțional)
5. Configurează monitoring (opțional)

**Succes cu deploy-ul! 🚀**
