# Deploy Backend pe Heroku - Baza de Date Existente

Acest ghid te va ajuta să deploy-ezi backend-ul pe Heroku folosind baza de date PostgreSQL existentă.

## 📋 Informații Baza de Date

```
Host: c2kr68lb6hupmq.cluster-czz5s0kz4scl.eu-west-1.rds.amazonaws.com
Port: 5432
Database: db8am1840r23b2
Username: ual3hulp62rphd
Password: pbfc981d479b03f25d64586b861c18a10701be2c53445b8821747e551682e70a4
URI: postgres://ual3hulp62rphd:pbfc981d479b03f25d64586b861c18a10701be2c53445b8821747e551682e70a4@c2kr68lb6hupmq.cluster-czz5s0kz4scl.eu-west-1.rds.amazonaws.com:5432/db8am1840r23b2
```

**Aplicația Heroku**: `cryptic-coast-64248-eu`

## 🚀 Deploy Rapid

### Pasul 1: Setează DATABASE_URL

```bash
# Navighează în directorul backend
cd mondio-backend

# Setează DATABASE_URL cu baza de date existentă
heroku config:set DATABASE_URL="postgres://ual3hulp62rphd:pbfc981d479b03f25d64586b861c18a10701be2c53445b8821747e551682e70a4@c2kr68lb6hupmq.cluster-czz5s0kz4scl.eu-west-1.rds.amazonaws.com:5432/db8am1840r23b2" --app cryptic-coast-64248-eu
```

### Pasul 2: Setează Alte Variabile de Mediu

```bash
# Setează variabilele necesare
heroku config:set NODE_ENV=production --app cryptic-coast-64248-eu

# JWT Secret (generează unul nou)
heroku config:set JWT_SECRET=$(openssl rand -base64 32) --app cryptic-coast-64248-eu

# Cloudflare R2 (pentru storage imagini/video)
heroku config:set CLOUDFLARE_R2_ENDPOINT=your-r2-endpoint --app cryptic-coast-64248-eu
heroku config:set CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key --app cryptic-coast-64248-eu
heroku config:set CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-key --app cryptic-coast-64248-eu
heroku config:set CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name --app cryptic-coast-64248-eu
heroku config:set CLOUDFLARE_R2_PUBLIC_URL=your-public-url --app cryptic-coast-64248-eu

# CORS - permite request-uri de la Vercel
heroku config:set CORS_ORIGIN=https://your-app.vercel.app --app cryptic-coast-64248-eu

# Verifică toate variabilele
heroku config --app cryptic-coast-64248-eu
```

### Pasul 3: Verifică Procfile

Asigură-te că există `Procfile` în root-ul backend-ului:

```
web: node src/index.js
```

### Pasul 4: Deploy

```bash
# Adaugă remote Heroku (dacă nu există deja)
heroku git:remote -a cryptic-coast-64248-eu

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# Sau dacă ești pe alt branch
git push heroku your-branch:main
```

### Pasul 5: Verificare

```bash
# Verifică logs
heroku logs --tail --app cryptic-coast-64248-eu

# Testează health check (dacă ai implementat)
curl https://cryptic-coast-64248-eu.herokuapp.com/health

# Rulează migrații (dacă e necesar)
heroku run npm run prisma:migrate --app cryptic-coast-64248-eu
```

## ⚠️ IMPORTANT: AWS RDS Security Groups

**CRITIC**: Trebuie să permiți conexiuni de la Heroku la AWS RDS.

1. Mergi în **AWS Console** → **RDS** → **Databases**
2. Selectează baza de date
3. Click pe **"Connectivity & security"** tab
4. Click pe **Security Group** (ex: `sg-xxxxx`)
5. Click **"Edit inbound rules"**
6. Adaugă o regulă:
   - **Type**: PostgreSQL
   - **Protocol**: TCP
   - **Port**: 5432
   - **Source**: `0.0.0.0/0` (sau mai restrictiv, IP-urile Heroku)
   
   **NOTĂ**: Pentru securitate mai bună, poți restricționa la IP-urile Heroku:
   - Heroku IP ranges: https://help.heroku.com/JS13Y81I/how-do-i-use-heroku-s-ip-ranges
   - Sau folosește `0.0.0.0/0` temporar pentru testare

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

## 🐛 Troubleshooting

### Problema: Cannot connect to database

**Soluții**:
1. Verifică Security Groups în AWS RDS (permite conexiuni de la Heroku)
2. Verifică că `DATABASE_URL` este setat corect: `heroku config:get DATABASE_URL --app cryptic-coast-64248-eu`
3. Testează conexiunea: `heroku run npx prisma db pull --app cryptic-coast-64248-eu`
4. Verifică logs: `heroku logs --tail --app cryptic-coast-64248-eu`

### Problema: Prisma migrations fail

**Soluții**:
1. Verifică că schema Prisma este corectă
2. Rulează manual: `heroku run npx prisma migrate deploy --app cryptic-coast-64248-eu`
3. Verifică că baza de date are permisiunile necesare

### Problema: CORS errors

**Soluții**:
1. Verifică că `CORS_ORIGIN` este setat corect
2. Verifică configurarea CORS în backend
3. Verifică logs pentru detalii: `heroku logs --tail --app cryptic-coast-64248-eu`

## 📝 Checklist Pre-Deploy

- [ ] `Procfile` creat și corect (`web: node src/index.js`)
- [ ] `package.json` are script `start`
- [ ] `DATABASE_URL` setat cu baza de date existentă
- [ ] AWS RDS Security Groups configurate pentru Heroku
- [ ] Toate variabilele de mediu setate (JWT_SECRET, R2, CORS_ORIGIN)
- [ ] CORS configurat în backend
- [ ] Health check endpoint adăugat (opțional dar recomandat)
- [ ] Server ascultă pe `process.env.PORT`

## ✅ După Deploy

1. Testează conexiunea la baza de date
2. Rulează migrațiile (dacă e necesar)
3. Testează endpoint-urile API
4. Verifică logs pentru erori
5. Configurează frontend-ul să folosească URL-ul Heroku

## 🔗 Link-uri Utile

- [Heroku Dashboard](https://dashboard.heroku.com/apps/cryptic-coast-64248-eu)
- [AWS RDS Console](https://console.aws.amazon.com/rds/)
- [Heroku IP Ranges](https://help.heroku.com/JS13Y81I/how-do-i-use-heroku-s-ip-ranges)

---

**Succes cu deploy-ul! 🚀**
