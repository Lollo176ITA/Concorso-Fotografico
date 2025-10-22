import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

    // Leggi le immagini
    const imagesPath = path.join(submissionPath, 'immagini');
    const images: { name: string; path: string; size: number }[] = [];
    
    if (fs.existsSync(imagesPath)) {
      const files = fs.readdirSync(imagesPath);
      files.forEach((file) => {
        const filePath = path.join(imagesPath, file);
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
          images.push({
            name: file,
            path: `/api/backoffice/files/${codiceFiscale}/immagini/${encodeURIComponent(file)}`,
            size: stat.size,
          });
        }
      });
    }

    // Leggi i documenti
    const documentiPath = path.join(submissionPath, 'documenti');
    const documenti: { name: string; path: string; size: number }[] = [];
    
    if (fs.existsSync(documentiPath)) {
      const files = fs.readdirSync(documentiPath);
      files.forEach((file) => {
        const filePath = path.join(documentiPath, file);
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
          documenti.push({
            name: file,
            path: `/api/backoffice/files/${codiceFiscale}/documenti/${encodeURIComponent(file)}`,
            size: stat.size,
          });
        }
      });
    }

    return NextResponse.json({ images, documenti });
  } catch (error) {
    console.error('Errore nel recupero dei file:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei file' },
      { status: 500 }
    );
  }
}
