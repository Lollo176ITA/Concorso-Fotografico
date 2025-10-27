import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
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

    // Leggi tutte le candidature dalla cartella submissions
    const submissionsPath = path.join(process.cwd(), 'submissions');
    
    if (!fs.existsSync(submissionsPath)) {
      return NextResponse.json({ submissions: [] });
    }

    const folders = fs.readdirSync(submissionsPath);
    const submissions = [];

    for (const folder of folders) {
      const folderPath = path.join(submissionsPath, folder);
      const datiPath = path.join(folderPath, 'dati.json');

      if (fs.existsSync(datiPath)) {
        try {
          const datiContent = fs.readFileSync(datiPath, 'utf-8');
          const dati = JSON.parse(datiContent);

          // Conta le immagini
          const imagesPath = path.join(folderPath, 'immagini');
          let imagesCount = 0;
          if (fs.existsSync(imagesPath)) {
            imagesCount = fs.readdirSync(imagesPath).length;
          }

          // Verifica presenza documenti
          const documentiPath = path.join(folderPath, 'documenti');
          let hasLiberatoria = false;
          let hasAllegato1 = false;
          
          if (fs.existsSync(documentiPath)) {
            const documenti = fs.readdirSync(documentiPath);
            hasAllegato1 = documenti.some(file => file.startsWith('Allegato1'));
            hasLiberatoria = documenti.some(file => file.startsWith('Liberatoria'));
          }

          // Estrai i dati del partecipante dal JSON
          const partecipante = dati.partecipante || {};
          
          submissions.push({
            nome: partecipante.nome,
            cognome: partecipante.cognome,
            email: partecipante.email,
            codiceFiscale: partecipante.codiceFiscale,
            telefono: partecipante.telefono,
            dataNascita: partecipante.dataNascita,
            luogoNascita: partecipante.luogoNascita,
            residenzaComune: partecipante.residenzaComune,
            residenzaIndirizzo: partecipante.residenzaIndirizzo,
            dipendente: partecipante.dipendente,
            timestamp: dati.timestamp,
            imagesCount,
            hasLiberatoria,
            hasAllegato1,
          });
        } catch (error) {
          console.error(`Errore lettura dati per ${folder}:`, error);
        }
      }
    }

    // Ordina per timestamp decrescente
    submissions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Errore nel recupero delle candidature:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle candidature' },
      { status: 500 }
    );
  }
}
