# 🚀 Deploy Rapid - Mondio

Ghid rapid pentru deploy-ul aplicației Mondio.

## ⚡ Quick Start

### Backend (Heroku) - 5 minute

```bash
cd mondio-backend

# 1. Creează aplicația
heroku create mondio-backend

# 2. Adaugă PostgreSQL
heroku addons:create heroku-postgresql:mini

# 3. Setează variabilele de mediu
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set CORS_ORIGIN=https://your-app.vercel.app
# ... adaugă restul variabilelor (R2, etc.)

# 4. Deploy
git push heroku main

# 5. Verifică
heroku logs --tail
curl https://mondio-backend.herokuapp.com/health
```

### Frontend (Vercel) - 3 minute

1. Mergi pe [vercel.com](https://vercel.com) și conectează GitHub repo
2. Click "Import Project"
3. Selectează repository-ul
4. Configurează:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Adaugă Environment Variable:
   - `VITE_API_URL` = `https://mondio-backend.herokuapp.com`
6. Click "Deploy"

## 📝 Checklist

### Backend
- [ ] `Procfile` există
- [ ] `package.json` are `start` script
- [ ] Variabile de mediu setate
- [ ] CORS configurat
- [ ] Health check endpoint

### Frontend
- [ ] `vercel.json` există
- [ ] `VITE_API_URL` setat în Vercel
- [ ] Build funcționează

## 🔗 Link-uri Utile

- **Heroku Dashboard**: https://dashboard.heroku.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Ghid Complet**: Vezi `DEPLOY.md`

## 🐛 Probleme?

Vezi `DEPLOY.md` pentru troubleshooting detaliat.
