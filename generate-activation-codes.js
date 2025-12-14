#!/usr/bin/env node

/**
 * Script pentru generarea codurilor de activare
 * 
 * Utilizare:
 *   node generate-activation-codes.js [număr_coduri]
 * 
 * Exemplu:
 *   node generate-activation-codes.js 5
 * 
 * Va genera 5 coduri de activare și le va salva direct în baza de date.
 */

import { PrismaClient } from '@prisma/client';
import readline from 'readline';

const prisma = new PrismaClient();

// Funcție pentru generare cod
function generateActivationCode() {
  // Generează un cod de 8 caractere alfanumerice (majuscule)
  // Exclude caractere confuze: 0, O, I, 1
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Funcție pentru a verifica dacă codul există deja
async function codeExists(code) {
  const existing = await prisma.activationCode.findUnique({
    where: { code },
  });
  return !!existing;
}

// Funcție pentru generare cod unic
async function generateUniqueCode() {
  let code;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 100;

  while (!isUnique && attempts < maxAttempts) {
    code = generateActivationCode();
    const exists = await codeExists(code);
    if (!exists) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Nu s-a putut genera un cod unic după ' + maxAttempts + ' încercări');
  }

  return code;
}

// Funcție pentru a crea coduri în baza de date
async function createActivationCodes(count) {
  const codes = [];
  
  console.log(`\n🔄 Generare ${count} coduri de activare...\n`);

  for (let i = 0; i < count; i++) {
    try {
      const code = await generateUniqueCode();
      
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

// Funcție pentru a afișa codurile generate
function displayCodes(codes) {
  if (codes.length === 0) {
    console.log('\n⚠️  Nu s-au generat coduri.');
    return;
  }

  console.log('\n' + '='.repeat(60));
  console.log('📋 CODURI GENERATE CU SUCCES');
  console.log('='.repeat(60));
  console.log('\nCopiază codurile de mai jos și distribuie-le utilizatorilor:\n');
  
  codes.forEach((code, index) => {
    console.log(`${index + 1}. ${code.code}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log(`Total: ${codes.length} coduri generate`);
  console.log('='.repeat(60) + '\n');
}

// Funcție pentru a confirma acțiunea
function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes' || answer === '');
    });
  });
}

// Funcție principală
async function main() {
  try {
    // Obține numărul de coduri din argumente
    const countArg = process.argv[2];
    const count = countArg ? parseInt(countArg, 10) : 1;

    if (isNaN(count) || count < 1) {
      console.error('❌ Eroare: Numărul de coduri trebuie să fie un număr pozitiv');
      console.log('\nUtilizare: node generate-activation-codes.js [număr_coduri]');
      console.log('Exemplu: node generate-activation-codes.js 5');
      process.exit(1);
    }

    if (count > 100) {
      console.log('⚠️  Ai cerut să generezi mai mult de 100 de coduri.');
      const confirmed = await askConfirmation('Ești sigur? (y/n): ');
      if (!confirmed) {
        console.log('Operațiune anulată.');
        process.exit(0);
      }
    }

    // Generează codurile
    const codes = await createActivationCodes(count);

    // Afișează rezultatele
    displayCodes(codes);

    console.log('✅ Gata! Codurile au fost salvate în baza de date.\n');
  } catch (error) {
    console.error('\n❌ Eroare:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Rulează scriptul
main();
