# Generare Coduri de Activare

Acest script permite creatorului aplicației să genereze coduri de activare pentru înregistrarea utilizatorilor.

## ⚠️ IMPORTANT

**Scriptul trebuie să fie mutat în directorul backend** și configurat cu Prisma din backend, deoarece necesită acces direct la baza de date.

## Instalare

1. Mută fișierul `generate-activation-codes.js` în directorul backend (de exemplu `mondio-backend/scripts/generateActivationCodes.js`)

2. Asigură-te că backend-ul are Prisma configurat și că poate accesa baza de date

3. Adaugă scriptul în `package.json` al backend-ului:
```json
{
  "scripts": {
    "generate-codes": "node scripts/generateActivationCodes.js"
  }
}
```

## Utilizare

### Din directorul backend:

```bash
# Generează un singur cod
npm run generate-codes

# Generează 5 coduri
npm run generate-codes 5

# Generează 10 coduri
npm run generate-codes 10
```

Sau direct cu Node.js:
```bash
node scripts/generateActivationCodes.js 5
```

## Exemplu de output

```
🔄 Generare 5 coduri de activare...

✅ Cod 1/5: ABC12345
✅ Cod 2/5: XYZ67890
✅ Cod 3/5: DEF23456
✅ Cod 4/5: GHI78901
✅ Cod 5/5: JKL34567

============================================================
📋 CODURI GENERATE CU SUCCES
============================================================

1. ABC12345
2. XYZ67890
3. DEF23456
4. GHI78901
5. JKL34567

============================================================
Total: 5 coduri generate
============================================================

✅ Gata! Codurile au fost salvate în baza de date.
```

## Securitate

- Codurile sunt generate aleator cu 8 caractere alfanumerice (majuscule)
- Exclude caractere confuze: 0, O, I, 1
- Fiecare cod este unic în baza de date
- Codurile pot fi folosite o singură dată

## Distribuire

După generare, copiază codurile și distribuie-le utilizatorilor care doresc să se înregistreze. Utilizatorii vor introduce codul în formularul de înregistrare.
