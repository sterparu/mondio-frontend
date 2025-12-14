# Deploy Backend pe Heroku cu Baza de Date Existente (AWS RDS)

Acest ghid te va ajuta să deploy-ezi backend-ul pe Heroku folosind baza de date PostgreSQL existentă de pe AWS RDS.

## 📋 Informații Baza de Date

```
Host: c3nv2ev86aje4j.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com
Port: 5432
Database: dcopvb5ov5forc
Username: ueafl9c65qahsv
Password: p9f631751626505172c11279de0437957bfafd2bb69c40e0b6510ee317dc6e19e
```

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
    "postinstall": "npm run prisma:generate"
  },
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

**NOTĂ**: Am eliminat `prisma:migrate` din `postinstall` pentru a evita migrațiile automate. Vei rula manual migrațiile când e necesar.

### Pasul 2: Creare Aplicație Heroku

```bash
# Navighează în directorul backend
cd mondio-backend

# Login în Heroku (dacă nu ești deja logat)
heroku login

# Creează aplicația Heroku
heroku create mondio-backend

# Sau cu un nume specific
heroku create your-app-name
```

### Pasul 3: Configurare Baza de Date

**IMPORTANT**: Nu adăuga Heroku Postgres addon! Vom folosi baza de date existentă.

```bash
# Setează DATABASE_URL cu baza de date existentă
heroku config:set DATABASE_URL="postgres://ueafl9c65qahsv:p9f631751626505172c11279de0437957bfafd2bb69c40e0b6510ee317dc6e19e@c3nv2ev86aje4j.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/dcopvb5ov5forc"
```

### Pasul 4: Configurare Variabile de Mediu

```bash
# Setează toate variabilele necesare
heroku config:set NODE_ENV=production

# JWT Secret (generează unul nou sau folosește unul existent)
heroku config:set JWT_SECRET=$(openssl rand -base64 32)

# Cloudflare R2 (pentru storage imagini/video)
heroku config:set CLOUDFLARE_R2_ENDPOINT=your-r2-endpoint
heroku config:set CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key
heroku config:set CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-key
heroku config:set CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name
heroku config:set CLOUDFLARE_R2_PUBLIC_URL=your-public-url

# CORS - permite request-uri de la Vercel (actualizează cu URL-ul tău Vercel)
heroku config:set CORS_ORIGIN=https://your-app.vercel.app

# Verifică toate variabilele
heroku config
```

### Pasul 5: Configurare AWS RDS Security Groups

**CRITIC**: Trebuie să permiți conexiuni de la Heroku la AWS RDS.

1. Mergi în AWS Console → RDS → Databases
2. Selectează baza de date
3. Click pe "Connectivity & security" tab
4. Click pe Security Group (ex: `sg-xxxxx`)
5. Click "Edit inbound rules"
6. Adaugă o regulă:
   - **Type**: PostgreSQL
   - **Protocol**: TCP
   - **Port**: 5432
   - **Source**: `0.0.0.0/0` (sau mai restrictiv, IP-urile Heroku)
   
   **NOTĂ**: Pentru securitate mai bună, poți restricționa la IP-urile Heroku:
   - Heroku IP ranges: https://help.heroku.com/JS13Y81I/how-do-i-use-heroku-s-ip-ranges
   - Sau folosește `0.0.0.0/0` temporar pentru testare

### Pasul 6: Testare Conexiune Locală (Opțional)

Înainte de deploy, testează conexiunea local:

```bash
# Creează un fișier .env.local în backend
echo 'DATABASE_URL="postgres://ueafl9c65qahsv:p9f631751626505172c11279de0437957bfafd2bb69c40e0b6510ee317dc6e19e@c3nv2ev86aje4j.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/dcopvb5ov5forc"' > .env.local

# Testează conexiunea cu Prisma
npx prisma db pull
npx prisma generate
```

### Pasul 7: Deploy Backend

```bash
# Asigură-te că ești pe branch-ul corect
git init  # dacă nu există deja
git add .
git commit -m "Prepare for Heroku deploy"

# Adaugă remote Heroku
heroku git:remote -a mondio-backend

# Deploy
git push heroku main

# Sau dacă ești pe alt branch
git push heroku your-branch:main
```

### Pasul 8: Rulează Migrații

După deploy, rulează migrațiile manual:

```bash
# Conectează-te la dyno și rulează migrații
heroku run npm run prisma:migrate

# Sau direct
heroku run npx prisma migrate deploy
```

### Pasul 9: Verificare

```bash
# Verifică logs
heroku logs --tail

# Testează health check (dacă ai implementat)
curl https://mondio-backend.herokuapp.com/health

# Testează un endpoint
curl https://mondio-backend.herokuapp.com/api/register
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

## 🔒 Securitate

### Recomandări:

1. **Security Groups**: Restricționează accesul la RDS doar la IP-urile Heroku
2. **JWT Secret**: Folosește un secret puternic și unic
3. **Environment Variables**: Nu commit-a niciodată credențialele în Git
4. **Database Password**: Consideră să rotești parola periodic

## 🐛 Troubleshooting

### Problema: Cannot connect to database

**Soluții**:
1. Verifică Security Groups în AWS RDS
2. Verifică că `DATABASE_URL` este setat corect: `heroku config:get DATABASE_URL`
3. Testează conexiunea: `heroku run npx prisma db pull`
4. Verifică logs: `heroku logs --tail`

### Problema: Prisma migrations fail

**Soluții**:
1. Verifică că schema Prisma este corectă
2. Rulează manual: `heroku run npx prisma migrate deploy`
3. Verifică că baza de date are permisiunile necesare

### Problema: CORS errors

**Soluții**:
1. Verifică că `CORS_ORIGIN` este setat corect
2. Verifică configurarea CORS în backend
3. Verifică logs pentru detalii: `heroku logs --tail`

## 📝 Checklist Pre-Deploy

- [ ] `Procfile` creat și corect
- [ ] `package.json` are script `start`
- [ ] `DATABASE_URL` setat cu baza de date existentă
- [ ] AWS RDS Security Groups configurate pentru Heroku
- [ ] Toate variabilele de mediu setate (JWT_SECRET, R2, CORS_ORIGIN)
- [ ] CORS configurat în backend
- [ ] Health check endpoint adăugat (opțional dar recomandat)
- [ ] Server ascultă pe `process.env.PORT`

## ✅ După Deploy

1. Testează conexiunea la baza de date
2. Rulează migrațiile
3. Testează endpoint-urile API
4. Verifică logs pentru erori
5. Configurează frontend-ul să folosească URL-ul Heroku

## 🔗 Link-uri Utile

- [Heroku Dashboard](https://dashboard.heroku.com)
- [AWS RDS Console](https://console.aws.amazon.com/rds/)
- [Heroku IP Ranges](https://help.heroku.com/JS13Y81I/how-do-i-use-heroku-s-ip-ranges)

---

**Succes cu deploy-ul! 🚀**
