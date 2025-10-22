import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ codiceFiscale: string }> }
) {
  try {
    // Verifica autenticazione semplice
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    // Verifica semplice che il token esista e non sia vuoto
    if (!token || token.length < 10) {
      return NextResponse.json(
        { error: 'Token non valido' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const codiceFiscale = params.codiceFiscale;
    const submissionPath = path.join(process.cwd(), 'submissions', codiceFiscale);

    if (!fs.existsSync(submissionPath)) {
      return NextResponse.json(
        { error: 'Candidatura non trovata' },
        { status: 404 }
      );
    }

    // Crea un archivio ZIP in memoria
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    const chunks: Buffer[] = [];

    archive.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    // Promessa per attendere la fine dell'archiviazione
    const archivePromise = new Promise<Buffer>((resolve, reject) => {
      archive.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      archive.on('error', (err: Error) => {
        reject(err);
      });
    });

    // Aggiungi tutti i file all'archivio
    const addFolderToArchive = (folderPath: string, archivePath: string) => {
      if (!fs.existsSync(folderPath)) return;

      const files = fs.readdirSync(folderPath);
      files.forEach((file) => {
        const filePath = path.join(folderPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isFile()) {
          archive.file(filePath, { name: path.join(archivePath, file) });
        }
      });
    };

    // Aggiungi dati.json
    const datiPath = path.join(submissionPath, 'dati.json');
    if (fs.existsSync(datiPath)) {
      archive.file(datiPath, { name: 'dati.json' });
    }

    // Aggiungi log.txt
    const logPath = path.join(submissionPath, 'log.txt');
    if (fs.existsSync(logPath)) {
      archive.file(logPath, { name: 'log.txt' });
    }

    // Aggiungi immagini
    addFolderToArchive(path.join(submissionPath, 'immagini'), 'immagini');

    // Aggiungi documenti
    addFolderToArchive(path.join(submissionPath, 'documenti'), 'documenti');

    // Finalizza l'archivio
    await archive.finalize();

    // Attendi il buffer completo
    const zipBuffer = await archivePromise;

    // Restituisci il file ZIP
    return new NextResponse(new Blob([new Uint8Array(zipBuffer)]), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${codiceFiscale}.zip"`,
      },
    });
  } catch (error) {
    console.error('Errore nel download dei file:', error);
    return NextResponse.json(
      { error: 'Errore nel download dei file' },
      { status: 500 }
    );
  }
}
