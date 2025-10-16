import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import CryptoJS from 'crypto-js';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Estrai i dati
    const nome = formData.get('nome') as string;
    const cognome = formData.get('cognome') as string;
    const codiceFiscale = (formData.get('codiceFiscale') as string).toUpperCase();
    const dataNascita = formData.get('dataNascita') as string;
    const isMinorenne = formData.get('isMinorenne') === 'true';

    // Validazione base
    if (!nome || !cognome || !codiceFiscale || !dataNascita) {
      return NextResponse.json(
        { error: 'Tutti i campi sono obbligatori' },
        { status: 400 }
      );
    }

    if (codiceFiscale.length !== 16) {
      return NextResponse.json(
        { error: 'Codice fiscale non valido' },
        { status: 400 }
      );
    }

    // Crea la struttura delle cartelle
    const baseDir = join(process.cwd(), 'submissions');
    const userDir = join(baseDir, codiceFiscale);
    const documentiDir = join(userDir, 'documenti');
    const immaginiDir = join(userDir, 'immagini');

    // Crea le directory
    await mkdir(baseDir, { recursive: true });
    await mkdir(userDir, { recursive: true });
    await mkdir(documentiDir, { recursive: true });
    await mkdir(immaginiDir, { recursive: true });

    // Array per salvare gli hash MD5
    const fileHashes: { filename: string; hash: string; size: number }[] = [];

    // Salva il documento se presente
    const documento = formData.get('documento') as File | null;
    if (isMinorenne && documento) {
      const bytes = await documento.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const docPath = join(documentiDir, documento.name);
      await writeFile(docPath, buffer);

      // Calcola MD5
      const wordArray = CryptoJS.lib.WordArray.create(buffer);
      const hash = CryptoJS.MD5(wordArray).toString();
      
      fileHashes.push({
        filename: `documenti/${documento.name}`,
        hash,
        size: documento.size,
      });
    }

    // Salva le immagini
    const images = formData.getAll('images') as File[];
    
    if (images.length === 0) {
      return NextResponse.json(
        { error: 'Devi caricare almeno una foto' },
        { status: 400 }
      );
    }

    for (const image of images) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const imagePath = join(immaginiDir, image.name);
      await writeFile(imagePath, buffer);

      // Calcola MD5
      const wordArray = CryptoJS.lib.WordArray.create(buffer);
      const hash = CryptoJS.MD5(wordArray).toString();
      
      fileHashes.push({
        filename: `immagini/${image.name}`,
        hash,
        size: image.size,
      });
    }

    // Crea il file log con gli hash MD5
    const timestamp = new Date().toISOString();
    let logContent = `=================================================
CONCORSO FOTOGRAFICO 2025 - LOG PARTECIPANTE
=================================================

DATI PARTECIPANTE:
------------------
Nome: ${nome}
Cognome: ${cognome}
Codice Fiscale: ${codiceFiscale}
Data di Nascita: ${dataNascita}
Minorenne: ${isMinorenne ? 'Sì' : 'No'}

DATA E ORA INVIO:
-----------------
${timestamp}

FILE CARICATI (MD5 HASH):
-------------------------
`;

    fileHashes.forEach((file, index) => {
      logContent += `
${index + 1}. ${file.filename}
   MD5: ${file.hash}
   Dimensione: ${(file.size / 1024 / 1024).toFixed(2)} MB
`;
    });

    logContent += `
=================================================
Totale file: ${fileHashes.length}
=================================================
`;

    const logPath = join(userDir, 'log.txt');
    await writeFile(logPath, logContent, 'utf-8');

    // Crea anche un file JSON con i dati
    const jsonData = {
      partecipante: {
        nome,
        cognome,
        codiceFiscale,
        dataNascita,
        isMinorenne,
      },
      timestamp,
      files: fileHashes,
    };

    const jsonPath = join(userDir, 'dati.json');
    await writeFile(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Registrazione completata con successo',
      codiceFiscale,
      filesCount: fileHashes.length,
    });
  } catch (error) {
    console.error('Errore durante il salvataggio:', error);
    return NextResponse.json(
      { error: 'Errore durante il salvataggio dei dati' },
      { status: 500 }
    );
  }
}
