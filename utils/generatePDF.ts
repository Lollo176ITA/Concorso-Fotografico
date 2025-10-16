import { jsPDF } from 'jspdf';
import { getSessoFromCF } from './codiceFiscale';

interface PartecipanteData {
  nome: string;
  cognome: string;
  email: string;
  codiceFiscale: string;
  dataNascita: string;
  luogoNascita: string;
  residenzaComune: string;
  residenzaIndirizzo: string;
  telefono: string;
  dipendente: 'no' | 'cittametropolitana' | 'capitalelavoro';
}

export function generateAllegato1PDF(data: PartecipanteData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const lineHeight = 7;
  let y = 20;

  // Estrai il sesso dal codice fiscale
  const sesso = getSessoFromCF(data.codiceFiscale);
  const articolo = sesso === 'F' ? 'La sottoscritta' : 'Il sottoscritto';

  // Helper function to add text
  const addText = (text: string, x: number, yPos: number, options?: any) => {
    doc.text(text, x, yPos, options);
  };

  // Helper function to add wrapped text
  const addWrappedText = (text: string, x: number, yPos: number, maxWidth: number) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, yPos);
    return lines.length * lineHeight;
  };

  // Title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  addText('ALLEGATO 1', pageWidth / 2, y, { align: 'center' });
  y += lineHeight * 2;

  addText('Alla Città metropolitana di Roma Capitale', margin, y);
  y += lineHeight * 2;

  // Dati partecipante
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  
  const nomeCompleto = `${data.nome} ${data.cognome}`;
  addText(`${articolo}: ${nomeCompleto}`, margin, y);
  y += lineHeight * 1.5;

  addText(`Nato/a a: ${data.luogoNascita} il ${new Date(data.dataNascita).toLocaleDateString('it-IT')}`, margin, y);
  y += lineHeight;

  addText(`Residente a: ${data.residenzaComune}`, margin, y);
  y += lineHeight;

  addText(`In Via/Piazza: ${data.residenzaIndirizzo}`, margin, y);
  y += lineHeight;

  addText(`Tel: ${data.telefono}`, margin, y);
  y += lineHeight;

  addText(`Email: ${data.email}`, margin, y);
  y += lineHeight;

  addText(`Codice Fiscale: ${data.codiceFiscale}`, margin, y);
  y += lineHeight * 2;

  // CHIEDE
  doc.setFont('helvetica', 'bold');
  addText('CHIEDE', pageWidth / 2, y, { align: 'center' });
  y += lineHeight * 1.5;

  doc.setFont('helvetica', 'normal');
  y += addWrappedText(
    'di essere ammesso/a a partecipare al concorso fotografico "Scattiamo in Provincia".',
    margin,
    y,
    pageWidth - margin * 2
  );
  y += lineHeight;

  // A tal fine DICHIARA
  doc.setFont('helvetica', 'bold');
  addText('A tal fine, DICHIARA', pageWidth / 2, y, { align: 'center' });
  y += lineHeight * 1.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  // Dichiarazione dipendente
  let dipendenteText = '';
  if (data.dipendente === 'no') {
    dipendenteText = 'Di non essere dipendente di Città metropolitana di Roma Capitale o di Capitale Lavoro SpA: [X]';
  } else if (data.dipendente === 'cittametropolitana') {
    dipendenteText = 'Di essere dipendente di Città metropolitana di Roma Capitale: [X]';
  } else {
    dipendenteText = 'Di essere dipendente di Capitale Lavoro SpA: [X]';
  }
  
  y += addWrappedText(dipendenteText, margin, y, pageWidth - margin * 2);
  y += lineHeight;

  // Check if we need a new page
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  // Altre dichiarazioni
  const dichiarazioni = [
    'Che le foto presentate sono state interamente ideate e scattate da sé stesso e assicura che sulle stesse non gravino diritti di nessun genere a favore di terzi, lasciando indenne la Città metropolitana di Roma Capitale da qualsivoglia responsabilità che dovesse sorgere in merito;',
    'Che le foto caricate ai fini della partecipazione al Concorso: (i) non contengono materiale osceno, esplicitamente sessuale, violento, offensivo diffamatorio; (ii) non contengono materiale discriminante per sesso, etnia e religione; (iii) non contengono materiale politico;',
    'Sotto la propria responsabilità, ai sensi e per gli effetti degli artt. 46 e 47 del D.P.R. 28 dicembre 2000, n. 445, di aver preso visione e di accettare tutte le clausole contenute nel bando senza condizione alcuna;',
    'Di autorizzare la Città metropolitana di Roma Capitale al trattamento dei dati personali per la sola espletazione delle pratiche relative al concorso ai sensi del Decreto Legislativo 196/2003 e del Regolamento UE 679/2016.',
  ];

  dichiarazioni.forEach((dichiarazione) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    y += addWrappedText(dichiarazione, margin, y, pageWidth - margin * 2);
    y += lineHeight * 0.5;
  });

  y += lineHeight * 2;

  // Data e Firma
  const oggi = new Date().toLocaleDateString('it-IT');
  addText(`Data: ${oggi}`, margin, y);
  y += lineHeight * 3;

  addText('Firma: ___________________________________', margin, y);
  y += lineHeight * 3;

  // Informativa Privacy - nuova pagina
  doc.addPage();
  y = 20;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  addText("Informativa sulla Privacy ai sensi dell'art. 13 del Regolamento UE 679/2016", pageWidth / 2, y, {
    align: 'center',
  });
  y += lineHeight * 2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const privacyPoints = [
    "Ai sensi dell'art. 13 del Regolamento UE n. 679/2016 si fornisce l'informativa riguardante il trattamento dei dati personali che sarà effettuato da questa Amministrazione relativamente al concorso fotografico 'Scattiamo in Provincia', realizzata sulla base di quanto previsto dall'art. 5 dello Statuto della Città metropolitana di Roma Capitale.",
    'Il Titolare del trattamento è la Città metropolitana di Roma Capitale – Via Quattro Novembre, 119a – 00187 Roma',
    "Il Responsabile della protezione dei dati può essere contattato all'indirizzo e-mail dpo@cittametropolitanaroma.it",
    'Il Responsabile interno del trattamento dei dati è il Direttore del Dipartimento VII, Roma – Viale Giorgio Ribotta, 41 – 00144, PEC: svileconom@pec.cittametropolitanaroma.it',
    'Il Responsabile esterno del trattamento designato è la società Capitale Lavoro S.p.A. – Viale Giorgio Ribotta, 41 – 00144 – Roma',
    'Il trattamento dei dati sarà esclusivamente finalizzato alla partecipazione al concorso fotografico.',
    'Le fotografie inviate potranno essere utilizzate dalla Città metropolitana di Roma per finalità divulgative, promozionali e istituzionali.',
    'Il conferimento dei dati obbligatori è richiesto per la partecipazione al concorso.',
    "L'interessato potrà esercitare i diritti di cui agli articoli 15 e ss. del Regolamento UE n. 679/2016.",
  ];

  privacyPoints.forEach((point) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    y += addWrappedText(`• ${point}`, margin, y, pageWidth - margin * 2);
    y += lineHeight * 0.3;
  });

  // Download PDF
  const fileName = `Allegato1_${data.codiceFiscale}_${Date.now()}.pdf`;
  doc.save(fileName);
}
