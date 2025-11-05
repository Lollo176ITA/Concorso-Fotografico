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

export async function generateAllegato1PDF(data: PartecipanteData): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 5;
  let y = 15;

  // Estrai il sesso dal codice fiscale
  const sesso = getSessoFromCF(data.codiceFiscale);
  const articolo = sesso === 'F' ? 'La sottoscritta' : 'Il sottoscritto';
  const natoA = sesso === 'F' ? 'Nata' : 'Nato';

  // Helper function to add text
  const addText = (text: string, x: number, yPos: number, options?: any) => {
    doc.text(text, x, yPos, options);
  };

  // Helper function to add wrapped text
  const addWrappedText = (text: string, x: number, yPos: number, maxWidth: number, align: 'left' | 'justify' = 'left') => {
    const lines = doc.splitTextToSize(text, maxWidth);
    if (align === 'justify') {
      lines.forEach((line: string, index: number) => {
        doc.text(line, x, yPos + (index * lineHeight));
      });
    } else {
      doc.text(lines, x, yPos);
    }
    return lines.length * lineHeight;
  };

  // Funzione per aggiungere il logo centrato
  const addCenteredLogo = async (yPos: number) => {
    try {
      const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Logo non caricato'));
        img.src = '/logo.png';
      });
      
      const logoWidth = 60;
      const logoHeight = 20;
      const logoX = (pageWidth - logoWidth) / 2;
      doc.addImage(logoImg, 'PNG', logoX, yPos, logoWidth, logoHeight);
      return logoHeight;
    } catch (error) {
      console.log('Logo non disponibile, continuo senza logo');
      return 0;
    }
  };

  // Aggiungi logo centrato
  const addedLogoHeight = await addCenteredLogo(y);
  y += addedLogoHeight + 10;

  // Title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  addText('ALLEGATO 1', pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Destinatario
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  addText('Alla Città metropolitana di Roma Capitale', pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Dati del partecipante
  doc.setFontSize(10);
  const nomeCognome = `${data.nome} ${data.cognome}`;
  addText(`${articolo} `, margin, y);
  doc.line(margin + doc.getTextWidth(`${articolo} `), y + 0.5, pageWidth - margin, y + 0.5);
  doc.setFont('helvetica', 'bold');
  addText(nomeCognome, margin + doc.getTextWidth(`${articolo} `) + 2, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  addText(`${natoA} a `, margin, y);
  doc.line(margin + doc.getTextWidth(`${natoA} a `), y + 0.5, margin + 90, y + 0.5);
  doc.setFont('helvetica', 'bold');
  addText(data.luogoNascita, margin + doc.getTextWidth(`${natoA} a `) + 2, y);
  
  doc.setFont('helvetica', 'normal');
  const residenzaX = margin + 95;
  addText('e residente a ', residenzaX, y);
  doc.line(residenzaX + doc.getTextWidth('e residente a '), y + 0.5, pageWidth - margin, y + 0.5);
  doc.setFont('helvetica', 'bold');
  addText(data.residenzaComune, residenzaX + doc.getTextWidth('e residente a ') + 2, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  addText('in Via/Piazza ', margin, y);
  doc.line(margin + doc.getTextWidth('in Via/Piazza '), y + 0.5, margin + 120, y + 0.5);
  doc.setFont('helvetica', 'bold');
  addText(data.residenzaIndirizzo, margin + doc.getTextWidth('in Via/Piazza ') + 2, y);
  
  doc.setFont('helvetica', 'normal');
  const telX = margin + 125;
  addText('tel. ', telX, y);
  doc.line(telX + doc.getTextWidth('tel. '), y + 0.5, pageWidth - margin, y + 0.5);
  doc.setFont('helvetica', 'bold');
  addText(data.telefono, telX + doc.getTextWidth('tel. ') + 2, y);
  y += 15;

  // CHIEDE
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  addText('CHIEDE', pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  y += addWrappedText(
    'di essere ammess__ a partecipare al concorso fotografico.',
    margin,
    y,
    pageWidth - margin * 2,
    'justify'
  );
  y += 10;

  // A tal fine, DICHIARA
  doc.setFont('helvetica', 'normal');
  addText('A tal fine,', pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFont('helvetica', 'bold');
  addText('DICHIARA', pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  // Checkbox dipendente
  const checkboxSize = 3;
  const checkboxMargin = margin + 5;
  
  const textNoDipendente = 'Di non essere dipendente di Città metropolitana di Roma Capitale o di Capitale Lavoro SpA: ';
  addText(textNoDipendente, margin, y);
  const checkboxXNoDip = margin + doc.getTextWidth(textNoDipendente);
  addText('__', checkboxXNoDip, y);
  if (data.dipendente === 'no') {
    doc.setFont('helvetica', 'bold');
    addText('X', checkboxXNoDip + 1, y);
    doc.setFont('helvetica', 'normal');
  }
  y += 8;

  addText('Ovvero di essere dipendente:', margin, y);
  y += 6;

  const textCittaMet = 'di Città metropolitana di Roma Capitale ';
  addText(textCittaMet, checkboxMargin, y);
  const checkboxXCitta = checkboxMargin + doc.getTextWidth(textCittaMet);
  addText('__', checkboxXCitta, y);
  if (data.dipendente === 'cittametropolitana') {
    doc.setFont('helvetica', 'bold');
    addText('X', checkboxXCitta + 1, y);
    doc.setFont('helvetica', 'normal');
  }
  y += 6;

  const textCapLavoro = 'di Capitale Lavoro SpA ';
  addText(textCapLavoro, checkboxMargin, y);
  const checkboxXCapLav = checkboxMargin + doc.getTextWidth(textCapLavoro);
  addText('__', checkboxXCapLav, y);
  if (data.dipendente === 'capitalelavoro') {
    doc.setFont('helvetica', 'bold');
    addText('X', checkboxXCapLav + 1, y);
    doc.setFont('helvetica', 'normal');
  }
  y += 10;

  // Dichiarazioni
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');

  const dichiarazioni = [
    'Che le foto presentate sono state interamente ideate e scattate da sé stesso e assicura che sulle stesse non gravino diritti di nessun genere a favore di terzi, lasciando indenne la Città metropolitana di Roma Capitale da qualsivoglia responsabilità che dovesse sorgere in merito;',
    'Che le foto caricate ai fini della partecipazione al Concorso: (i) non contengono materiale osceno, esplicitamente sessuale, violento, offensivo diffamatorio; (ii) non contengono materiale discriminante per sesso, etnia e religione; (iii) non contengono materiale politico;',
    'Sotto la propria responsabilità, ai sensi e per gli effetti degli artt. 46 e 47 del D.P.R. 28 dicembre 2000, n. 445, di aver preso visione e di accettare tutte le clausole contenute nel bando senza condizione alcuna;',
    'Di autorizzare la Città metropolitana di Roma Capitale al trattamento dei dati personali per la sola espletazione delle pratiche relative al concorso ai sensi del Decreto Legislativo 196/2003.',
  ];

  dichiarazioni.forEach((dichiarazione) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    y += addWrappedText(dichiarazione, margin, y, pageWidth - margin * 2, 'justify');
    y += 6;
  });

  y += 10;

  // Data e Firma
  const oggi = new Date().toLocaleDateString('it-IT', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  addText('Data', margin, y);
  doc.line(margin + 15, y + 0.5, margin + 60, y + 0.5);
  addText(oggi, margin + 18, y);
  y += 15;

  addText('Firma ', margin, y);
  doc.line(margin + 15, y + 0.5, pageWidth - margin, y + 0.5);
  y += 15;

  // Nuova Pagina - Informativa Privacy
  doc.addPage();
  
  // Logo centrato nella seconda pagina
  y = 15;
  const secondLogoHeight = await addCenteredLogo(y);
  y += secondLogoHeight + 10;

  // Titolo Privacy
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  addText("Informativa sulla Privacy ai sensi dell'art. 13 del Regolamento UE 679/2016", pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  // Punti della privacy
  const privacyPoints = [
    "Ai sensi dell'art. 13 del Regolamento UE n. 679/2016 si fornisce l'informativa riguardante il trattamento dei dati personali che sarà effettuato da questa Amministrazione relativamente al seminario \"La patente a crediti nei cantieri: il punto sulle novità e le applicazioni pratiche\", realizzata sulla base di quanto previsto dall'art. 5 dello Statuto della Città metropolitana di Roma Capitale.",
    
    "Il Titolare del trattamento è la Città metropolitana di Roma Capitale – Via Quattro Novembre, 119a – 00187 Roma",
    
    "Il Responsabile della protezione dei dati può essere contattato all'indirizzo e-mail dpo@cittametropolitanaroma.it",
    
    "Il Responsabile interno del trattamento dei dati è il Direttore del Dipartimento VII, Roma – Viale Giorgio Ribotta, 41 – 00144, PEC: svileconom@pec.cittametropolitanaroma.it",
    
    "Il Responsabile esterno del trattamento designato è la società Capitale Lavoro S.p.A. – Viale Giorgio Ribotta, 41 – 00144 – Roma",
    
    "I Responsabili del trattamento nominati/autorizzati sono i dipendenti/collaboratori della Città Metropolitana di Roma Capitale – Viale Giorgio Ribotta, 41 – 00144 – Roma, assegnati all'organizzazione e allo svolgimento del concorso fotografico sulla base di uno specifico atto e nominati con apposita lettera di incarico. Sono altresì nominati/autorizzati al trattamento i dipendenti/collaboratori di Capitale Lavoro S.p.A. – Viale Giorgio Ribotta, 41 – 00144 – Roma, che agiscono sulla base di specifiche istruzioni fornite dal Responsabile interno del trattamento circa le finalità e le modalità del trattamento stesso",
    
    "Il trattamento dei dati sarà esclusivamente finalizzato alla partecipazione al concorso fotografico. Le basi giuridiche individuate per le finalità su indicate sono l'art. 9 dello Statuto della Città metropolitana di Roma Capitale",
    
    "Le informazioni trattate sono dati personali (comuni) quali ad esempio i dati anagrafici e di contatto e pertanto diversi da quelli rientranti nelle categorie particolari di dati ex art. 9 Reg UE 679/2016 (dati sensibili) e nella categoria di dati relativi a condanne penali e reati ex art. 10 Reg UE 679/2016 (dati giudiziari)",
    
    "I dati forniti saranno trattati su supporto cartaceo e con l'ausilio di strumenti informatici dal personale dell'Amministrazione e dal personale del Responsabile esterno Capitale Lavoro S.p.A.; il trattamento sarà effettuato nel rispetto delle misure di sicurezza di cui al Regolamento UE n. 679/2016 e secondo le istruzioni impartite dal Responsabile del Trattamento ai propri incaricati. In particolare i dati saranno trattati in modo lecito e secondo correttezza; raccolti e registrati per scopi determinati, espliciti e legittimi, ed utilizzati in altre operazioni del trattamento in termini compatibili con tali scopi, esatti e, se necessario, aggiornati, pertinenti, completi e non eccedenti rispetto alle finalità per le quali sono raccolti o successivamente trattati",
    
    "Le fotografie inviate potranno essere utilizzate dalla Città metropolitana di Roma per finalità divulgative, promozionali e istituzionali. In particolare, a titolo esemplificativo ma non esaustivo, tali materiali potranno essere pubblicati sul sito web ufficiale dell'ente, sui social media o su materiali stampati. La partecipazione al concorso implica il consenso implicito all'uso di tali dati e materiali come descritto. I partecipanti hanno il diritto di richiedere l'accesso, la rettifica o la cancellazione dei propri dati personali, contattando gli uffici competenti secondo quanto previsto dalla normativa vigente in materia di protezione dei dati personali",
    
    "Il conferimento dei dati obbligatori è richiesto per la partecipazione al concorso",
    
    "I dati forniti o registrati saranno trattati e conservati per il periodo di tempo necessario al conseguimento delle finalità per cui sono stati raccolti",
    
    "I dati forniti non saranno oggetto di profilazione (processi decisionali automatizzati consistenti nell'utilizzo di informazioni per valutare determinati aspetti relativi alla persona, per analizzare o prevedere aspetti riguardanti il rendimento professionale, la situazione economica, la salute, le preferenze personali, gli interessi, l'affidabilità, il comportamento, l'ubicazione o gli spostamenti)",
    
    "L'interessato potrà esercitare: i diritti di cui agli articoli 15 e ss. del Regolamento UE n. 679/2016 (diritto di accesso ai propri dati personali e loro rettifica, diritto alla cancellazione degli stessi/diritto all'oblio diritto di limitazione del trattamento o di opposizione al trattamento) c/o l'ufficio del Direttore del Dipartimento agli indirizzi indicati al punto 4, e il diritto di reclamo presso l'Autorità Garante per la Privacy (ai sensi dell'art. 77 del Regolamento UE n. 679/2016) o altra Autorità di Controllo, o potrà adire le opportune sedi giudiziarie ai sensi dell'art. 79 del Regolamento stesso."
  ];

  privacyPoints.forEach((point, index) => {
    if (y > 255) {
      doc.addPage();
      // Logo centrato nella nuova pagina
      y = 15;
      addCenteredLogo(y).then(h => {
        y += h + 10;
      });
      y = 45; // Spazio per il logo
    }
    doc.setFont('helvetica', 'normal');
    addText(`${index + 1})`, margin, y);
    y += addWrappedText(point, margin + 5, y, pageWidth - margin * 2 - 5, 'justify');
    y += 5;
  });

  // Download PDF
  const fileName = `Allegato1_${data.cognome}_${data.nome}_${Date.now()}.pdf`;
  doc.save(fileName);
}
