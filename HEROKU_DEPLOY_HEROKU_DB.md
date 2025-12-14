# Deploy Backend pe Heroku cu Baza de Date Heroku Postgres

Acest ghid te va ajuta să deploy-ezi backend-ul pe Heroku folosind baza de date PostgreSQL existentă de pe Heroku (Heroku Postgres).

## 📋 Prezentare

Heroku oferă un addon PostgreSQL care setează automat variabila `DATABASE_URL`. Nu trebuie să configurezi manual conexiunea la bază de date.

## 🚀 Pași de Deploy

### Pasul 1: Pregătire Backend

Asigură-te că backend-ul are următoarele fișiere:

#### `Procfile` (în root-ul backend-ului)
```
web: node src/index.js
```

#### `package.json` - Scripts
```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy",
    "postinstall": "npm run prisma:generate && npm run prisma:migrate"
  },
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

### Pasul 2: Verificare Aplicație Heroku Existente

```bash
# Navighează în directorul backend
cd mondio-backend

# Verifică dacă aplicația există
heroku apps:info

# Sau verifică aplicațiile tale
heroku apps
```

### Pasul 3: Verificare Baza de Date Existente

```bash
# Verifică dacă există addon PostgreSQL
heroku addons

# Verifică DATABASE_URL (setat automat de Heroku)
heroku config:get DATABASE_URL

# Dacă nu există addon PostgreSQL, adaugă-l:
heroku addons:create heroku-postgresql:mini
# Sau pentru plan mai mare:
heroku addons:create heroku-postgresql:standard-0
```

**IMPORTANT**: Când adaugi addon-ul PostgreSQL, Heroku setează automat `DATABASE_URL`. Nu trebuie să-l setezi manual!

### Pasul 4: Configurare Variabile de Mediu

```bash
# Setează variabilele necesare (DATABASE_URL este deja setat de Heroku)
heroku config:set NODE_ENV=production

# JWT Secret (generează unul nou sau folosește unul existent)
heroku config:set JWT_SECRET=$(openssl rand -base64 32)

# Cloudflare R2 (pentru storage imagini/video)
heroku config:set CLOUDFLARE_R2_ENDPOINT=your-r2-endpoint
heroku config:set CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key
heroku config:set CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-key
heroku config:set CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name
heroku config:set CLOUDFLARE_R2_PUBLIC_URL=your-public-url

# CORS - permite request-uri de la Vercel
heroku config:set CORS_ORIGIN=https://your-app.vercel.app

# Verifică toate variabilele
heroku config
```

### Pasul 5: Deploy Backend

```bash
# Asigură-te că ești pe branch-ul corect
git add .
git commit -m "Prepare for Heroku deploy"

# Adaugă remote Heroku (dacă nu există deja)
heroku git:remote -a your-app-name

# Deploy
git push heroku main

# Sau dacă ești pe alt branch
git push heroku your-branch:main
```

### Pasul 6: Verificare Migrații

După deploy, migrațiile ar trebui să ruleze automat prin `postinstall`. Dacă nu, rulează manual:

```bash
# Verifică logs pentru migrații
heroku logs --tail

# Dacă migrațiile nu au rulat, rulează manual:
heroku run npm run prisma:migrate

# Sau direct:
heroku run npx prisma migrate deploy
```

### Pasul 7: Verificare

```bash
# Verifică logs
heroku logs --tail

# Testează health check (dacă ai implementat)
curl https://your-app-name.herokuapp.com/health

# Testează un endpoint
curl https://your-app-name.herokuapp.com/api/register
```

## 🔧 Configurare Backend pentru CORS

Asigură-te că backend-ul permite request-uri de la Vercel:

```javascript
// În src/index.js sau fișierul principal
import cors from '@fastify/cors';

await fastify.register(cors, {
  origin: (origin, cb) => {
    const allowedOrigins = [
      'http://localhost:5173', // Development Vite
      'http://localhost:3000', // Development alt port
      process.env.CORS_ORIGIN, // Production Vercel
      /\.vercel\.app$/, // Toate subdomeniile Vercel
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return cb(null, true);

    const originAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      }
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });

    if (originAllowed) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
});
```

## 📊 Verificare Baza de Date

```bash
# Conectează-te la baza de date prin CLI
heroku pg:psql

# Sau rulează o comandă SQL
heroku pg:psql -c "SELECT COUNT(*) FROM users;"

# Verifică informații despre baza de date
heroku pg:info
```

## 🔄 Backup Baza de Date

```bash
# Creează backup
heroku pg:backups:capture

# Listează backup-uri
heroku pg:backups

# Descarcă backup
heroku pg:backups:download
```

## 🐛 Troubleshooting

### Problema: DATABASE_URL nu este setat

**Soluție**: 
```bash
# Adaugă addon PostgreSQL
heroku addons:create heroku-postgresql:mini

# Verifică că este setat
heroku config:get DATABASE_URL
```

### Problema: Cannot connect to database

**Soluții**:
1. Verifică că `DATABASE_URL` este setat: `heroku config:get DATABASE_URL`
2. Verifică că Prisma poate conecta: `heroku run npx prisma db pull`
3. Verifică logs: `heroku logs --tail`

### Problema: Migrații nu rulează

**Soluții**:
1. Verifică că `postinstall` script este în `package.json`
2. Verifică logs pentru erori: `heroku logs --tail`
3. Rulează manual: `heroku run npm run prisma:migrate`

### Problema: CORS errors

**Soluții**:
1. Verifică că `CORS_ORIGIN` este setat corect
2. Verifică configurarea CORS în backend
3. Verifică logs pentru detalii: `heroku logs --tail`

## 📝 Checklist Pre-Deploy

- [ ] `Procfile` creat și corect
- [ ] `package.json` are script `start`
- [ ] `package.json` are `engines` specificate
- [ ] `postinstall` script rulează migrations
- [ ] Addon PostgreSQL adăugat (sau există deja)
- [ ] `DATABASE_URL` este setat automat de Heroku
- [ ] Toate variabilele de mediu setate (JWT_SECRET, R2, CORS_ORIGIN)
- [ ] CORS configurat în backend
- [ ] Health check endpoint adăugat (opțional dar recomandat)
- [ ] Server ascultă pe `process.env.PORT`

## ✅ După Deploy

1. Verifică că migrațiile au rulat cu succes
2. Testează conexiunea la baza de date
3. Testează endpoint-urile API
4. Verifică logs pentru erori
5. Configurează frontend-ul să folosească URL-ul Heroku

## 🔗 Link-uri Utile

- [Heroku Dashboard](https://dashboard.heroku.com)
- [Heroku Postgres Documentation](https://devcenter.heroku.com/articles/heroku-postgresql)
- [Heroku Postgres Plans](https://elements.heroku.com/addons/heroku-postgresql)

---

**Succes cu deploy-ul! 🚀**
