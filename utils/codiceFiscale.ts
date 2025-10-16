/**
 * Utility per validazione e estrazione dati dal Codice Fiscale italiano
 */

// Mappa mesi del codice fiscale
const MESI_CF: { [key: string]: number } = {
  A: 1, B: 2, C: 3, D: 4, E: 5, H: 6,
  L: 7, M: 8, P: 9, R: 10, S: 11, T: 12,
};

export interface DatiCodiceFiscale {
  valid: boolean;
  sesso: 'M' | 'F' | null;
  dataNascita: string | null; // formato YYYY-MM-DD
  errors: string[];
}

/**
 * Estrae e valida i dati dal codice fiscale
 */
export function estraiDatiCodiceFiscale(cf: string): DatiCodiceFiscale {
  const result: DatiCodiceFiscale = {
    valid: false,
    sesso: null,
    dataNascita: null,
    errors: [],
  };

  // Normalizza il codice fiscale
  cf = cf.toUpperCase().trim();

  // Verifica lunghezza
  if (cf.length !== 16) {
    result.errors.push('Il codice fiscale deve essere di 16 caratteri');
    return result;
  }

  // Verifica formato base
  const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
  if (!cfRegex.test(cf)) {
    result.errors.push('Formato codice fiscale non valido');
    return result;
  }

  try {
    // Estrai anno (posizioni 6-7)
    let anno = parseInt(cf.substring(6, 8), 10);
    const annoCorrente = new Date().getFullYear();
    const annoCorrenteBreve = annoCorrente % 100;
    
    // Determina il secolo (se anno > anno corrente, è del secolo scorso)
    if (anno > annoCorrenteBreve) {
      anno += 1900;
    } else {
      anno += 2000;
    }

    // Estrai mese (posizione 8)
    const letteraMese = cf.charAt(8);
    const mese = MESI_CF[letteraMese];
    
    if (!mese) {
      result.errors.push('Mese non valido nel codice fiscale');
      return result;
    }

    // Estrai giorno e sesso (posizioni 9-10)
    let giorno = parseInt(cf.substring(9, 11), 10);
    let sesso: 'M' | 'F';
    
    if (giorno > 40) {
      // Se > 40, è femmina (sottrai 40)
      giorno -= 40;
      sesso = 'F';
    } else {
      sesso = 'M';
    }

    // Verifica validità data
    const data = new Date(anno, mese - 1, giorno);
    if (
      data.getFullYear() !== anno ||
      data.getMonth() !== mese - 1 ||
      data.getDate() !== giorno
    ) {
      result.errors.push('Data di nascita non valida nel codice fiscale');
      return result;
    }

    // Formatta data in YYYY-MM-DD
    const meseStr = mese.toString().padStart(2, '0');
    const giornoStr = giorno.toString().padStart(2, '0');
    const dataNascita = `${anno}-${meseStr}-${giornoStr}`;

    // Verifica carattere di controllo (posizione 15)
    const carattereControllo = cf.charAt(15);
    const carattereCalcolato = calcolaCarattereControllo(cf.substring(0, 15));
    
    if (carattereControllo !== carattereCalcolato) {
      result.errors.push('Carattere di controllo non valido');
      return result;
    }

    // Popola risultato
    result.valid = true;
    result.sesso = sesso;
    result.dataNascita = dataNascita;
  } catch (error) {
    result.errors.push('Errore durante l\'elaborazione del codice fiscale');
    return result;
  }

  return result;
}

/**
 * Calcola il carattere di controllo del codice fiscale
 */
function calcolaCarattereControllo(cf15: string): string {
  const DISPARI: { [key: string]: number } = {
    '0': 1, '1': 0, '2': 5, '3': 7, '4': 9, '5': 13, '6': 15, '7': 17, '8': 19, '9': 21,
    'A': 1, 'B': 0, 'C': 5, 'D': 7, 'E': 9, 'F': 13, 'G': 15, 'H': 17, 'I': 19, 'J': 21,
    'K': 2, 'L': 4, 'M': 18, 'N': 20, 'O': 11, 'P': 3, 'Q': 6, 'R': 8, 'S': 12, 'T': 14,
    'U': 16, 'V': 10, 'W': 22, 'X': 25, 'Y': 24, 'Z': 23,
  };

  const PARI: { [key: string]: number } = {
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7, 'I': 8, 'J': 9,
    'K': 10, 'L': 11, 'M': 12, 'N': 13, 'O': 14, 'P': 15, 'Q': 16, 'R': 17, 'S': 18, 'T': 19,
    'U': 20, 'V': 21, 'W': 22, 'X': 23, 'Y': 24, 'Z': 25,
  };

  const CONTROLLO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let somma = 0;
  for (let i = 0; i < 15; i++) {
    const char = cf15.charAt(i);
    if (i % 2 === 0) {
      // Posizione dispari (0-based, quindi pari nel codice fiscale 1-based)
      somma += DISPARI[char] || 0;
    } else {
      // Posizione pari (0-based, quindi dispari nel codice fiscale 1-based)
      somma += PARI[char] || 0;
    }
  }

  return CONTROLLO[somma % 26];
}

/**
 * Verifica se i dati forniti corrispondono al codice fiscale
 */
export function verificaDatiCodiceFiscale(
  cf: string,
  dataNascita: string
): { valid: boolean; errors: string[] } {
  const datiCF = estraiDatiCodiceFiscale(cf);
  const errors: string[] = [];

  if (!datiCF.valid) {
    return { valid: false, errors: datiCF.errors };
  }

  // Verifica data di nascita
  if (datiCF.dataNascita !== dataNascita) {
    errors.push(
      `La data di nascita non corrisponde al codice fiscale. Dal CF risulta: ${formatDate(
        datiCF.dataNascita!
      )}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Formatta una data in formato italiano
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT');
}

/**
 * Ottieni il sesso dal codice fiscale
 */
export function getSessoFromCF(cf: string): 'M' | 'F' | null {
  const dati = estraiDatiCodiceFiscale(cf);
  return dati.sesso;
}

/**
 * Ottieni la data di nascita dal codice fiscale
 */
export function getDataNascitaFromCF(cf: string): string | null {
  const dati = estraiDatiCodiceFiscale(cf);
  return dati.dataNascita;
}
