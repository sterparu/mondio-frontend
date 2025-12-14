# Mondio Frontend

Aplicație web pentru gestionarea antrenamentelor câinilor, construită cu React, Vite și Tailwind CSS.

## Caracteristici

- 🔐 Autentificare și înregistrare utilizatori
- 🐕 Gestionare câini (adaugare, vizualizare)
- 🏋️ Gestionare antrenamente personalizate
- 📊 Creare și vizualizare sesiuni de antrenament cu scoruri
- 🎨 Interfață modernă și responsive cu Tailwind CSS

## Tehnologii

- **React 19** - Framework UI
- **Vite** - Build tool și dev server
- **Tailwind CSS 4** - Stilizare
- **React Router** - Navigare între pagini
- **Axios** - Client HTTP pentru API calls

## Instalare

```bash
npm install
```

## Configurare

Asigură-te că backend-ul (`mondio-backend`) rulează pe `http://localhost:3000`.

Frontend-ul este configurat să folosească un proxy Vite pentru a comunica cu backend-ul.

## Rulare în development

```bash
npm run dev
```

Aplicația va rula pe `http://localhost:5173` (sau alt port disponibil).

## Build pentru producție

```bash
npm run build
```

## Structura proiectului

```
src/
├── components/       # Componente reutilizabile (Layout, ProtectedRoute)
├── contexts/         # Context providers (AuthContext)
├── pages/            # Pagini principale (Login, Register, Dashboard, etc.)
├── services/         # Servicii API (authService, dogService, etc.)
├── App.jsx           # Componenta principală cu routing
└── main.jsx          # Entry point
```

## API Endpoints

Aplicația comunică cu backend-ul prin următoarele endpoint-uri:

- `POST /api/register` - Înregistrare utilizator
- `POST /api/login` - Autentificare
- `GET /api/dogs` - Listă câini (autentificat)
- `POST /api/dogs` - Adaugă câine (autentificat)
- `GET /api/trainings` - Listă antrenamente (autentificat)
- `POST /api/trainings` - Creează antrenament (autentificat)
- `GET /api/sessions` - Listă sesiuni (autentificat)
- `POST /api/sessions` - Creează sesiune (autentificat)

## Deploy

Pentru instrucțiuni complete de deploy, vezi:
- [DEPLOY.md](./DEPLOY.md) - Ghid complet de deploy
- [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) - Ghid rapid
- [HEROKU_BACKEND_SETUP.md](./HEROKU_BACKEND_SETUP.md) - Setup detaliat backend

## Autentificare

Token-urile JWT sunt stocate în `localStorage` și sunt adăugate automat la fiecare request către API.

## Note

- Asigură-te că backend-ul rulează înainte de a porni frontend-ul
- Token-urile sunt persistate în browser, deci utilizatorii rămân autentificați după refresh
