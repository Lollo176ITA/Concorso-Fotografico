# Concorso Fotografico 2025

Applicazione web moderna per la gestione delle iscrizioni al concorso fotografico.

## 🚀 Caratteristiche

- **Landing Page** accattivante con presentazione del concorso
- **Form di Registrazione** completo con validazione
- **Upload Immagini** fino a 24 foto (max 3MB ciascuna)
- **Gestione Minorenni** con upload obbligatorio del documento
- **Validazione Dati** in tempo reale con Zod
- **Struttura File System** automatica per ogni partecipante
- **Hash MD5** per l'integrità dei file
- **Design Responsive** ottimizzato per mobile e desktop

## 📋 Tecnologie Utilizzate

- **Next.js 14** - Framework React
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling moderno
- **React Hook Form** - Gestione form
- **Zod** - Validazione schema
- **Crypto-JS** - Hash MD5
- **Lucide React** - Icone

## 🛠️ Installazione

1. Installa le dipendenze:
```bash
npm install
```

2. Avvia il server di sviluppo:
```bash
npm run dev
```

3. Apri il browser su [http://localhost:3000](http://localhost:3000)

## 📁 Struttura Cartelle

Ogni partecipante avrà una struttura così organizzata:

```
submissions/
└── {CODICE_FISCALE}/
    ├── documenti/
    │   └── documento_identita.pdf
    ├── immagini/
    │   ├── foto1.jpg
    │   ├── foto2.jpg
    │   └── ...
    ├── log.txt          # File con hash MD5 di tutti i file
    └── dati.json        # Dati partecipante in formato JSON
```

## 📝 File Log

Il file `log.txt` contiene:
- Dati del partecipante
- Timestamp dell'invio
- Hash MD5 di ogni file caricato
- Dimensione dei file

Esempio:
```
=================================================
CONCORSO FOTOGRAFICO 2025 - LOG PARTECIPANTE
=================================================

DATI PARTECIPANTE:
------------------
Nome: Mario
Cognome: Rossi
Codice Fiscale: RSSMRA85M01H501Z
Data di Nascita: 1985-08-01
Minorenne: No

DATA E ORA INVIO:
-----------------
2025-10-16T10:30:45.123Z

FILE CARICATI (MD5 HASH):
-------------------------

1. immagini/foto1.jpg
   MD5: 5d41402abc4b2a76b9719d911017c592
   Dimensione: 2.45 MB

...
```

## 🎨 Personalizzazione

Per personalizzare i colori, modifica il file `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    // Modifica questi valori per cambiare il tema
  },
},
```

## 🔒 Validazione

### Campi Obbligatori:
- Nome (min 2 caratteri)
- Cognome (min 2 caratteri)
- Codice Fiscale (esattamente 16 caratteri)
- Data di Nascita
- Almeno 1 foto (max 24)

### Validazione File:
- **Immagini**: JPG, PNG, WebP
- **Documenti**: PDF, JPG, PNG
- **Dimensione massima**: 3MB per file

### Regole Speciali:
- I minorenni devono caricare un documento di identità

## 🚀 Deploy

Per il deploy in produzione:

```bash
npm run build
npm start
```

Oppure usa piattaforme come Vercel, Netlify, o deploy su un server Node.js.

## 📄 Licenza

© 2025 Concorso Fotografico. Tutti i diritti riservati.
