import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, access } from 'fs/promises';
import { join } from 'path';
import CryptoJS from 'crypto-js';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Estrai i dati
    const nome = formData.get('nome') as string;
    const cognome = formData.get('cognome') as string;
    const email = formData.get('email') as string;
    const codiceFiscale = (formData.get('codiceFiscale') as string).toUpperCase();
    const dataNascita = formData.get('dataNascita') as string;
    const luogoNascita = formData.get('luogoNascita') as string;
    const residenzaComune = formData.get('residenzaComune') as string;
    const residenzaIndirizzo = formData.get('residenzaIndirizzo') as string;
    const telefono = formData.get('telefono') as string;
    const dipendente = formData.get('dipendente') as string;

    // Validazione base
    if (!nome || !cognome || !email || !codiceFiscale || !dataNascita || !luogoNascita || !residenzaComune || !residenzaIndirizzo || !telefono || !dipendente) {
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

    // Verifica se il codice fiscale è già stato utilizzato
    try {
      await access(userDir);
      // Se non viene lanciata un'eccezione, la directory esiste già
      return NextResponse.json(
        { error: 'Questo codice fiscale ha già inviato una candidatura' },
        { status: 409 } // 409 Conflict
      );
    } catch (error) {
      // La directory non esiste, si può procedere
    }
    const documentiDir = join(userDir, 'documenti');
    const immaginiDir = join(userDir, 'immagini');

    // Crea le directory
    await mkdir(baseDir, { recursive: true });
    await mkdir(userDir, { recursive: true });
    await mkdir(documentiDir, { recursive: true });
    await mkdir(immaginiDir, { recursive: true });

    // Crea le sottocartelle per ogni categoria di foto
    const categorie = ['TL', 'RA', 'WL', 'PA', 'ME', 'AM', 'EN'];
    for (const categoria of categorie) {
      await mkdir(join(immaginiDir, categoria), { recursive: true });
    }

    // Array per salvare gli hash MD5
    const fileHashes: { filename: string; hash: string; size: number }[] = [];

    // Salva l'Allegato 1 firmato (OBBLIGATORIO)
    const allegato1 = formData.get('allegato1') as File | null;
    if (!allegato1) {
      return NextResponse.json(
        { error: 'L\'Allegato 1 firmato è obbligatorio' },
        { status: 400 }
      );
    }

    const allegato1Bytes = await allegato1.arrayBuffer();
    const allegato1Buffer = Buffer.from(allegato1Bytes);
    const allegato1Path = join(documentiDir, `Allegato1_firmato_${codiceFiscale}.pdf`);
    await writeFile(allegato1Path, allegato1Buffer);

    // Calcola MD5 Allegato 1
    const allegato1WordArray = CryptoJS.lib.WordArray.create(allegato1Buffer);
    const allegato1Hash = CryptoJS.MD5(allegato1WordArray).toString();
    
    fileHashes.push({
      filename: `documenti/Allegato1_firmato_${codiceFiscale}.pdf`,
      hash: allegato1Hash,
      size: allegato1.size,
    });

    // Salva la liberatoria se presente
    const liberatoria = formData.get('liberatoria') as File | null;
    if (liberatoria) {
      const bytes = await liberatoria.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const liberatoriaPath = join(documentiDir, `Liberatoria_firmata_${codiceFiscale}.pdf`);
      await writeFile(liberatoriaPath, buffer);

      // Calcola MD5
      const wordArray = CryptoJS.lib.WordArray.create(buffer);
      const hash = CryptoJS.MD5(wordArray).toString();
      
      fileHashes.push({
        filename: `documenti/Liberatoria_firmata_${codiceFiscale}.pdf`,
        hash,
        size: liberatoria.size,
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

    // Estrai i metadati delle immagini
    const imageMetadata: { categoria: string; comune: string; titolo: string; originalName: string }[] = [];
    let metadataIndex = 0;
    while (formData.has(`imageMetadata[${metadataIndex}]`)) {
      const metadata = JSON.parse(formData.get(`imageMetadata[${metadataIndex}]`) as string);
      imageMetadata.push(metadata);
      metadataIndex++;
    }

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const metadata = imageMetadata[i];
      
      if (!metadata || !metadata.categoria) {
        return NextResponse.json(
          { error: 'Metadati immagine mancanti o non validi' },
          { status: 400 }
        );
      }

      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Salva nella sottocartella della categoria
      const categoriaDir = join(immaginiDir, metadata.categoria);
      const imagePath = join(categoriaDir, image.name);
      await writeFile(imagePath, buffer);

      // Calcola MD5
      const wordArray = CryptoJS.lib.WordArray.create(buffer);
      const hash = CryptoJS.MD5(wordArray).toString();
      
      fileHashes.push({
        filename: `immagini/${metadata.categoria}/${image.name}`,
        hash,
        size: image.size,
      });
    }

    // Crea il file log con gli hash MD5
    const timestamp = new Date().toISOString();
    let logContent = `=================================================
SCATTIAMO IN PROVINCIA - LOG PARTECIPANTE
Concorso Fotografico - Città metropolitana di Roma Capitale
=================================================

DATI PARTECIPANTE:
------------------
Nome: ${nome}
Cognome: ${cognome}
Email: ${email}
Codice Fiscale: ${codiceFiscale}
Data di Nascita: ${dataNascita}
Luogo di Nascita: ${luogoNascita}
Residenza: ${residenzaComune}, ${residenzaIndirizzo}
Telefono: ${telefono}
Dipendente: ${dipendente === 'no' ? 'No' : dipendente === 'cittametropolitana' ? 'Città metropolitana di Roma Capitale' : 'Capitale Lavoro SpA'}

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
      concorso: 'Scattiamo in Provincia',
      organizzatore: 'Città metropolitana di Roma Capitale',
      partecipante: {
        nome,
        cognome,
        email,
        codiceFiscale,
        dataNascita,
        luogoNascita,
        residenzaComune,
        residenzaIndirizzo,
        telefono,
        dipendente,
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
