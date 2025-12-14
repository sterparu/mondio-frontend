# 🚀 Deploy Rapid - Backend pe Heroku cu Heroku Postgres

Ghid rapid pentru deploy-ul backend-ului folosind baza de date Heroku Postgres.

## ⚡ Quick Start (5 minute)

```bash
cd mondio-backend

# 1. Verifică aplicația Heroku
heroku apps

# 2. Adaugă PostgreSQL (dacă nu există)
heroku addons:create heroku-postgresql:mini

# 3. Setează variabilele
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set CORS_ORIGIN=https://your-app.vercel.app
# ... adaugă restul (R2 credentials, etc.)

# 4. Deploy
git push heroku main

# 5. Verifică
heroku logs --tail
curl https://your-app.herokuapp.com/health
```

## 📋 Checklist

- [ ] `Procfile` există (`web: node src/index.js`)
- [ ] `package.json` are `start` script
- [ ] Addon PostgreSQL adăugat
- [ ] `DATABASE_URL` setat automat (de Heroku)
- [ ] Variabile de mediu setate
- [ ] CORS configurat

## 🔗 Ghid Complet

Vezi [HEROKU_DEPLOY_HEROKU_DB.md](./HEROKU_DEPLOY_HEROKU_DB.md) pentru instrucțiuni detaliate.
