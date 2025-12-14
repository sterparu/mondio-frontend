# Implementare Coduri de Activare - Backend

Acest document descrie modificările necesare în backend pentru a implementa sistemul de coduri de activare.

## 1. Schema Prisma

Adaugă următorul model în `schema.prisma`:

```prisma
model ActivationCode {
  id        Int      @id @default(autoincrement())
  code      String   @unique
  used      Boolean  @default(false)
  usedBy    Int?     // ID-ul utilizatorului care a folosit codul
  createdAt DateTime @default(now())
  usedAt    DateTime?

  @@map("activation_codes")
}
```

Apoi rulează migrația:
```bash
npx prisma migrate dev --name add_activation_codes
```

## 2. Funcție pentru generare cod

Creează o funcție helper pentru generarea codurilor (de exemplu în `src/utils/activationCode.js`):

```javascript
export function generateActivationCode() {
  // Generează un cod de 8 caractere alfanumerice (majuscule)
  // Exclude caractere confuze: 0, O, I, 1
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
```

## 3. Script pentru generare coduri (pentru creator)

Am creat scriptul `generate-activation-codes.js` în root-ul proiectului frontend care poate fi folosit de creator pentru a genera coduri.

**Pentru backend**, creează un script similar în backend (de exemplu `scripts/generateActivationCodes.js`):

```javascript
import { PrismaClient } from '@prisma/client';
import { generateActivationCode } from '../src/utils/activationCode.js';

const prisma = new PrismaClient();

async function createActivationCodes(count) {
  const codes = [];
  
  console.log(`\n🔄 Generare ${count} coduri de activare...\n`);

  for (let i = 0; i < count; i++) {
    try {
      let code;
      let isUnique = false;
      
      // Generează cod până când este unic
      while (!isUnique) {
        code = generateActivationCode();
        const existing = await prisma.activationCode.findUnique({
          where: { code },
        });
        if (!existing) {
          isUnique = true;
        }
      }
      
      const activationCode = await prisma.activationCode.create({
        data: {
          code,
          used: false,
        },
      });

      codes.push(activationCode);
      console.log(`✅ Cod ${i + 1}/${count}: ${code}`);
    } catch (error) {
      console.error(`❌ Eroare la generarea codului ${i + 1}:`, error.message);
    }
  }

  return codes;
}

async function main() {
  const count = process.argv[2] ? parseInt(process.argv[2], 10) : 1;
  
  if (isNaN(count) || count < 1) {
    console.error('❌ Eroare: Numărul de coduri trebuie să fie un număr pozitiv');
    process.exit(1);
  }

  try {
    const codes = await createActivationCodes(count);
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 CODURI GENERATE CU SUCCES');
    console.log('='.repeat(60));
    codes.forEach((code, index) => {
      console.log(`${index + 1}. ${code.code}`);
    });
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('❌ Eroare:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

Adaugă în `package.json` un script pentru ușurință:
```json
{
  "scripts": {
    "generate-codes": "node scripts/generateActivationCodes.js"
  }
}
```

Utilizare:
```bash
npm run generate-codes 5  # Generează 5 coduri
```

## 4. Endpoint pentru listare coduri (doar trainer-i)

În fișierul de rute (de exemplu `src/routes/activationCodes.js`):

```javascript
import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function activationCodeRoutes(fastify: FastifyInstance) {
  // Middleware pentru a verifica dacă utilizatorul este trainer
  const requireTrainer = async (request, reply) => {
    try {
      const userId = request.user.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { trainerProfile: true },
      });
      
      if (!user || !user.trainerProfile) {
        return reply.code(403).send({ error: 'Doar trainer-ii pot vizualiza codurile de activare' });
      }
    } catch (error) {
      return reply.code(401).send({ error: 'Neautorizat' });
    }
  };

  // GET /activation-codes
  fastify.get('/', {
    preHandler: [fastify.authenticate, requireTrainer],
  }, async (request, reply) => {
    try {
      const codes = await prisma.activationCode.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return reply.send(codes);
    } catch (error) {
      console.error('Error fetching activation codes:', error);
      return reply.code(500).send({ error: 'Eroare la încărcarea codurilor' });
    }
  });

  // DELETE /activation-codes/:id
  fastify.delete('/:id', {
    preHandler: [fastify.authenticate, requireTrainer],
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      
      const code = await prisma.activationCode.findUnique({
        where: { id: parseInt(id) },
      });

      if (!code) {
        return reply.code(404).send({ error: 'Codul nu a fost găsit' });
      }

      if (code.used) {
        return reply.code(400).send({ error: 'Nu poți șterge un cod deja folosit' });
      }

      await prisma.activationCode.delete({
        where: { id: parseInt(id) },
      });

      return reply.code(200).send({ message: 'Cod șters cu succes' });
    } catch (error) {
      console.error('Error deleting activation code:', error);
      return reply.code(500).send({ error: 'Eroare la ștergerea codului' });
    }
  });
}
```

Înregistrează rutele în fișierul principal (de exemplu `src/index.js` sau `src/app.js`):

```javascript
import { activationCodeRoutes } from './routes/activationCodes.js';

// ...
fastify.register(activationCodeRoutes, { prefix: '/activation-codes' });
```

**IMPORTANT:** Nu crea endpoint pentru generare coduri prin API. Codurile trebuie generate doar prin script de către creator.

## 5. Modificare endpoint de înregistrare

Modifică endpoint-ul `/register` pentru a verifica codul de activare:

```javascript
fastify.post('/register', async (request, reply) => {
  const { email, password, activationCode } = request.body;

  // Validare
  if (!email || !password || !activationCode) {
    return reply.code(400).send({ 
      error: 'Email, parolă și cod de activare sunt obligatorii' 
    });
  }

  // Verifică codul de activare
  const code = await prisma.activationCode.findUnique({
    where: { code: activationCode },
  });

  if (!code) {
    return reply.code(400).send({ error: 'Cod de activare invalid' });
  }

  if (code.used) {
    return reply.code(400).send({ error: 'Cod de activare deja folosit' });
  }

  // Verifică dacă email-ul există deja
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return reply.code(400).send({ error: 'Email-ul este deja înregistrat' });
  }

  // Hash parola
  const hashedPassword = await bcrypt.hash(password, 10);

  // Creează utilizatorul
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  // Marchează codul ca folosit
  await prisma.activationCode.update({
    where: { id: code.id },
    data: {
      used: true,
      usedBy: user.id,
      usedAt: new Date(),
    },
  });

  return reply.code(201).send({
    message: 'Cont creat cu succes',
    user: {
      id: user.id,
      email: user.email,
    },
  });
});
```

## 6. Testare

După implementare, testează:

1. Generare coduri prin script (ca creator)
2. Listare coduri ca trainer
3. Listare coduri ca non-trainer (ar trebui să eșueze)
4. Înregistrare cu cod valid
5. Înregistrare cu cod invalid
6. Înregistrare cu cod deja folosit
7. Ștergere cod nefolosit (ca trainer)
8. Ștergere cod folosit (ar trebui să eșueze)

## Note

- Codurile sunt generate cu majuscule și cifre, excluzând caractere confuze (0, O, I, 1)
- Codurile au 8 caractere pentru un echilibru între securitate și ușurința de utilizare
- **Doar creatorul aplicației poate genera coduri** folosind scriptul dedicat
- Trainer-ii pot doar vizualiza și șterge codurile nefolosite
- Codurile folosite nu pot fi șterse pentru audit
