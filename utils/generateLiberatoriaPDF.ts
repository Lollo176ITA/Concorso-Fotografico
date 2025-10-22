import jsPDF from 'jspdf';

interface LiberatoriaData {
  nomeMinore: string;
  cognomeMinore: string;
  codiceFiscale: string;
  dataNascita: string;
  luogoNascita: string;
}

export function generateLiberatoriaPDF(data: LiberatoriaData) {
  const doc = new jsPDF();
  
  // Margini e configurazione
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - (margin * 2);
  let y = margin;

  // Titolo
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('LIBERATORIA PER LA PARTECIPAZIONE DI MINORI AL', margin, y);
  y += 7;
  doc.text('CONCORSO FOTOGRAFICO', margin, y);
  y += 15;

  // Reset font
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  // Paragrafo 1
  const text1 = 'Il/La sottoscritto/a ________________________________,';
  doc.text(text1, margin, y);
  y += 7;

  const text2 = `nato/a a ____________________________ il __/__/______, residente in`;
  doc.text(text2, margin, y);
  y += 7;

  doc.text('______________________________________,', margin, y);
  y += 10;

  doc.text('in qualità di genitore o tutore legale del minore', margin, y);
  y += 10;

  // Dati del minore
  doc.setFont('helvetica', 'bold');
  doc.text(`Nome e Cognome del minore: ${data.nomeMinore} ${data.cognomeMinore},`, margin, y);
  y += 7;

  const dataNascitaFormatted = new Date(data.dataNascita).toLocaleDateString('it-IT');
  doc.text(`nato/a a ${data.luogoNascita} il ${dataNascitaFormatted},`, margin, y);
  y += 10;

  // AUTORIZZA
  doc.setFont('helvetica', 'bold');
  doc.text('AUTORIZZA', margin, y);
  doc.setFont('helvetica', 'normal');
  y += 7;

  const autorizzaText = 'la partecipazione del proprio figlio/a al concorso fotografico promosso dalla Città metropolitana di Roma Capitale, e la pubblicazione delle fotografie realizzate dal minore sui canali ufficiali dell\'Ente (social network, newsletter, mostre o pubblicazioni digitali e cartacee) connessi all\'iniziativa.';
  const autorizzaLines = doc.splitTextToSize(autorizzaText, maxWidth);
  doc.text(autorizzaLines, margin, y);
  y += autorizzaLines.length * 5 + 10;

  // DICHIARA
  doc.setFont('helvetica', 'bold');
  doc.text('Il/la sottoscritto/a dichiara di:', margin, y);
  doc.setFont('helvetica', 'normal');
  y += 10;

  // Elenco puntato
  const dichiarazioni = [
    'essere consapevole che le immagini inviate potranno essere pubblicate a titolo gratuito, nel rispetto della finalità educativa, culturale e promozionale dell\'iniziativa;',
    'conservare la piena titolarità dei diritti d\'autore delle fotografie realizzate dal minore, concedendo alla Città metropolitana di Roma Capitale una licenza d\'uso gratuita e non esclusiva per la pubblicazione, diffusione e valorizzazione delle immagini nell\'ambito delle attività istituzionali e promozionali dell\'Ente;',
    'aver preso visione e accettato l\'informativa sul trattamento dei dati personali, resa ai sensi del Regolamento (UE) 2016/679 (GDPR);',
    'manlevare la Città metropolitana di Roma Capitale da qualsiasi responsabilità derivante dall\'uso delle fotografie inviate, qualora esse violino diritti di terzi.'
  ];

  dichiarazioni.forEach((dichiarazione) => {
    // Controlla se c'è spazio sulla pagina
    if (y > 250) {
      doc.addPage();
      y = margin;
    }

    doc.text('•', margin, y);
    const lines = doc.splitTextToSize(dichiarazione, maxWidth - 5);
    doc.text(lines, margin + 5, y);
    y += lines.length * 5 + 5;
  });

  y += 10;

  // Firma
  if (y > 240) {
    doc.addPage();
    y = margin;
  }

  doc.text('Luogo ____________________________', margin, y);
  y += 10;

  doc.text('Data __/__/______', margin, y);
  y += 15;

  doc.text('Firma del genitore/tutore ____________________________', margin, y);
  y += 15;

  doc.text('Firma del minore (se di età superiore a 14 anni) ____________________________', margin, y);

  // Download PDF
  const fileName = `Liberatoria_Minore_${data.cognomeMinore}_${data.nomeMinore}.pdf`;
  doc.save(fileName);
}
