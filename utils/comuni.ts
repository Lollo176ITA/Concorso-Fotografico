import comuniData from '../comuni.json';

interface Comune {
  nome: string;
  codice: string;
  provincia: {
    codice: string;
    nome: string;
  };
  sigla: string;
}

// Estrai tutti i nomi dei comuni dal JSON
const tuttiComuniDaJSON = (comuniData as Comune[]).map(comune => comune.nome);

// Comuni della Città metropolitana di Roma Capitale (filtrati dal JSON)
export const comuniRomaMetropolitana = (comuniData as Comune[])
  .filter(comune => comune.provincia.nome === 'Roma')
  .map(comune => comune.nome);

// Tutti i comuni italiani per il luogo di nascita
export const tuttiComuni = tuttiComuniDaJSON;
