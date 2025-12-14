# Deploy Frontend pe Vercel

## 📋 Informații Backend

**URL Backend Heroku**: `https://cryptic-coast-64248-eu-2796fcaf3115.herokuapp.com`

## 🚀 Deploy Rapid

### Opțiunea 1: Via Dashboard Vercel (Recomandat)

1. Mergi pe [vercel.com](https://vercel.com) și conectează-te cu GitHub
2. Click **"Add New Project"**
3. Selectează repository-ul `mondio-frontend`
4. Configurează:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (lasă gol)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Adaugă **Environment Variable**:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://cryptic-coast-64248-eu-2796fcaf3115.herokuapp.com`
6. Click **"Deploy"**

### Opțiunea 2: Via CLI

```bash
cd mondio-frontend

# Login în Vercel
vercel login

# Deploy cu variabila de mediu
vercel --prod --env VITE_API_URL=https://cryptic-coast-64248-eu-2796fcaf3115.herokuapp.com
```

## ✅ Verificare

După deploy, testează:
1. Deschide URL-ul Vercel în browser
2. Încearcă să te înregistrezi
3. Verifică console-ul browser pentru erori
4. Verifică Network tab pentru request-uri către backend

## 🔧 Configurare CORS în Backend

Asigură-te că backend-ul permite request-uri de la Vercel. Backend-ul ar trebui să aibă:

```javascript
await app.register(cors, { 
  origin: [
    'http://localhost:5173',
    'https://your-app.vercel.app',
    /\.vercel\.app$/
  ]
});
```

---

**Succes cu deploy-ul! 🚀**
