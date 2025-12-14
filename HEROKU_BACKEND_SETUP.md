# Setup Backend pe Heroku

Acest document descrie pașii detaliați pentru deploy-ul backend-ului pe Heroku.

## 📋 Fișiere Necesare în Backend

### 1. `Procfile` (în root-ul backend-ului)

```
web: node src/index.js
```

Sau dacă folosești un alt entry point:
```
web: node dist/index.js
```

### 2. `package.json` - Scripts

Asigură-te că ai următoarele scripts:

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

### 3. Variabile de Mediu în Heroku

Setare via CLI:
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-jwt-key-min-32-chars
heroku config:set DATABASE_URL=$(heroku config:get DATABASE_URL)
heroku config:set CLOUDFLARE_R2_ENDPOINT=your-r2-endpoint
heroku config:set CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key
heroku config:set CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-key
heroku config:set CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name
heroku config:set CLOUDFLARE_R2_PUBLIC_URL=your-public-url
heroku config:set CORS_ORIGIN=https://your-app.vercel.app
```

### 4. Configurare CORS în Backend

În fișierul principal al backend-ului (ex: `src/index.js`):

```javascript
import cors from '@fastify/cors';

// ...

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

### 5. Health Check Endpoint

Adaugă un endpoint pentru health check:

```javascript
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});
```

## 🚀 Pași de Deploy

### Pasul 1: Pregătire Git Repository

```bash
cd mondio-backend

# Dacă nu există deja
git init
git add .
git commit -m "Initial commit"
```

### Pasul 2: Creare Aplicație Heroku

```bash
# Login
heroku login

# Creează aplicația
heroku create mondio-backend

# Sau cu un nume specific
heroku create your-app-name
```

### Pasul 3: Adaugă PostgreSQL

```bash
# Adaugă addon PostgreSQL (gratuit pentru început)
heroku addons:create heroku-postgresql:mini

# Verifică că DATABASE_URL este setat automat
heroku config:get DATABASE_URL
```

### Pasul 4: Setare Variabile de Mediu

```bash
# Setează toate variabilele necesare (vezi secțiunea de mai sus)
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
# ... restul variabilelor
```

### Pasul 5: Deploy

```bash
# Adaugă remote Heroku
heroku git:remote -a mondio-backend

# Deploy
git push heroku main

# Sau dacă ești pe alt branch
git push heroku your-branch:main
```

### Pasul 6: Verificare

```bash
# Verifică logs
heroku logs --tail

# Testează health check
curl https://mondio-backend.herokuapp.com/health

# Deschide în browser
heroku open
```

## 🔧 Troubleshooting

### Problema: Build fails

**Soluție**: Verifică că `postinstall` script funcționează și că Prisma poate genera client-ul.

### Problema: Database connection fails

**Soluție**: 
- Verifică că `DATABASE_URL` este setat: `heroku config:get DATABASE_URL`
- Verifică că migrations rulează: `heroku run npm run prisma:migrate`

### Problema: CORS errors

**Soluție**: 
- Verifică că `CORS_ORIGIN` include URL-ul Vercel
- Verifică logs: `heroku logs --tail`

### Problema: Port binding

**Soluție**: Asigură-te că serverul ascultă pe `process.env.PORT`:

```javascript
const PORT = process.env.PORT || 3000;
await fastify.listen({ port: PORT, host: '0.0.0.0' });
```

## 📝 Comenzi Utile

```bash
# Verifică config
heroku config

# Verifică logs
heroku logs --tail

# Rulează comenzi în dyno
heroku run npm run prisma:migrate
heroku run node scripts/generateActivationCodes.js 5

# Restart aplicația
heroku restart

# Verifică status
heroku ps

# Deschide console
heroku run bash
```

## ✅ Checklist Pre-Deploy

- [ ] `Procfile` creat și corect
- [ ] `package.json` are script `start`
- [ ] `package.json` are `engines` specificate
- [ ] `postinstall` script rulează migrations
- [ ] CORS configurat corect
- [ ] Health check endpoint adăugat
- [ ] Toate variabilele de mediu setate
- [ ] Database migrations testate local
- [ ] Server ascultă pe `process.env.PORT`
