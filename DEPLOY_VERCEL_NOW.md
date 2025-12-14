# 🚀 Deploy Frontend pe Vercel - ACUM

## 📋 Informații Importante

**URL Backend Heroku**: `https://cryptic-coast-64248-eu-2796fcaf3115.herokuapp.com`

## ⚡ Deploy Rapid (5 minute)

### Pasul 1: Conectează Repository-ul

1. Mergi pe [vercel.com](https://vercel.com)
2. Sign up / Login cu **GitHub**
3. Click **"Add New Project"**
4. Dacă repository-ul nu apare:
   - Click **"Import Git Repository"**
   - Selectează repository-ul `mondio-frontend` sau conectează-l

### Pasul 2: Configurează Proiectul

Când apare ecranul de configurare:

**Framework Preset**: Selectează **Vite** (sau lasă pe **Other**)

**Root Directory**: Lasă gol (sau `./`)

**Build Command**: `npm run build`

**Output Directory**: `dist`

**Install Command**: `npm install`

### Pasul 3: Adaugă Environment Variable

**IMPORTANT**: Înainte de a da click pe "Deploy", adaugă variabila de mediu:

1. Click pe **"Environment Variables"** (sau **"Advanced"** → **"Environment Variables"**)
2. Adaugă:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://cryptic-coast-64248-eu-2796fcaf3115.herokuapp.com`
   - **Environment**: Selectează **Production** (și opțional **Preview** și **Development**)
3. Click **"Add"**

### Pasul 4: Deploy

1. Click **"Deploy"**
2. Așteaptă ~2-3 minute pentru build și deploy
3. După ce se termină, vei primi un URL (ex: `https://mondio-frontend.vercel.app`)

### Pasul 5: Verificare

1. Deschide URL-ul Vercel în browser
2. Încearcă să te înregistrezi
3. Verifică console-ul browser (F12) pentru erori
4. Verifică Network tab pentru request-uri către backend

## 🔧 Configurare CORS în Backend

Asigură-te că backend-ul permite request-uri de la Vercel. Backend-ul ar trebui să aibă în `src/index.js`:

```javascript
await app.register(cors, { 
  origin: [
    'http://localhost:5173',
    'https://your-app.vercel.app',  // Înlocuiește cu URL-ul tău Vercel
    /\.vercel\.app$/  // Permite toate subdomeniile Vercel
  ],
  credentials: true
});
```

După deploy, actualizează `CORS_ORIGIN` în Heroku:

```bash
heroku config:set CORS_ORIGIN=https://your-app.vercel.app --app cryptic-coast-64248-eu
```

## ✅ Checklist

- [ ] Repository conectat în Vercel
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Environment Variable `VITE_API_URL` setată
- [ ] Deploy finalizat
- [ ] CORS configurat în backend pentru URL-ul Vercel

## 🐛 Troubleshooting

### Problema: Request-uri către backend eșuează

**Soluție**: 
- Verifică că `VITE_API_URL` este setat corect în Vercel
- Verifică că backend-ul rulează: `curl https://cryptic-coast-64248-eu-2796fcaf3115.herokuapp.com/health`
- Verifică CORS în backend

### Problema: 404 pe rute React Router

**Soluție**: Verifică că `vercel.json` are `rewrites` configurate corect (deja configurat)

---

**Succes cu deploy-ul! 🚀**
