import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ codiceFiscale: string; type: string; path: string[] }> }
) {
  try {
    // Verifica autenticazione - supporta sia header che query param
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const queryToken = searchParams.get('token');
    
    let token = '';
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (queryToken) {
      token = queryToken;
    }
    
    if (!token || token.length < 10) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { codiceFiscale, type, path: pathSegments } = params;

    // Valida il tipo (solo immagini o documenti)
    if (type !== 'immagini' && type !== 'documenti') {
      return NextResponse.json(
        { error: 'Tipo non valido' },
        { status: 400 }
      );
    }

    // Decodifica tutti i segmenti del path
    const decodedSegments = pathSegments.map(segment => decodeURIComponent(segment));

    // Costruisce il path completo
    const filePath = path.join(
      process.cwd(),
      'submissions',
      codiceFiscale,
      type,
      ...decodedSegments
    );

    console.log('Tentativo di accesso al file:', filePath);

    // Verifica che il file esista
    if (!fs.existsSync(filePath)) {
      console.error('File non trovato:', filePath);
      return NextResponse.json(
        { error: 'File non trovato', requestedPath: decodedSegments.join('/') },
        { status: 404 }
      );
    }

    // Verifica che sia un file e non una directory
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      return NextResponse.json(
        { error: 'Il path specificato non è un file' },
        { status: 400 }
      );
    }

    // Leggi il file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Determina il content type
    const filename = decodedSegments[decodedSegments.length - 1];
    let contentType = 'application/octet-stream';
    const ext = path.extname(filename).toLowerCase();
    
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
    };
    
    if (mimeTypes[ext]) {
      contentType = mimeTypes[ext];
    }

    // Restituisci il file
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Errore nel recupero del file:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero del file' },
      { status: 500 }
    );
  }
}
