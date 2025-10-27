'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft, Upload, X, CheckCircle, Loader2, Download, AlertCircle } from 'lucide-react';
import { generateAllegato1PDF } from '@/utils/generatePDF';
import AutocompleteInput from '@/components/AutocompleteInput';
import { tuttiComuni, comuniRomaMetropolitana } from '@/utils/comuni';
import { 
  estraiDatiCodiceFiscale, 
  verificaDatiCodiceFiscale,
  getSessoFromCF,
  getDataNascitaFromCF
} from '@/utils/codiceFiscale';

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
const MAX_IMAGES = 24;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ACCEPTED_DOC_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

const registrationSchema = z.object({
  nome: z.string().min(2, 'Il nome deve contenere almeno 2 caratteri'),
  cognome: z.string().min(2, 'Il cognome deve contenere almeno 2 caratteri'),
  email: z.string().email('Inserisci un indirizzo email valido'),
  codiceFiscale: z
    .string()
    .length(16, 'Il codice fiscale deve essere di 16 caratteri')
    .toUpperCase(),
  dataNascita: z.string().min(1, 'La data di nascita è obbligatoria'),
  luogoNascita: z.string().min(2, 'Il luogo di nascita è obbligatorio'),
  residenzaComune: z.string().min(2, 'Il comune di residenza è obbligatorio'),
  residenzaIndirizzo: z.string().min(5, "L'indirizzo di residenza è obbligatorio"),
  telefono: z.string().min(8, 'Il numero di telefono è obbligatorio'),
  dipendente: z.enum(['no', 'cittametropolitana', 'capitalelavoro'], {
    required_error: 'Seleziona una opzione',
  }),
  accettaTermini: z.boolean().refine((val) => val === true, {
    message: 'Devi accettare i termini e le condizioni',
  }),
  accettaPrivacy: z.boolean().refine((val) => val === true, {
    message: 'Devi accettare la privacy policy',
  }),
  dichiarazioneFoto: z.boolean().refine((val) => val === true, {
    message: 'Devi confermare di essere autore delle foto',
  }),
  dichiarazioneContenuti: z.boolean().refine((val) => val === true, {
    message: 'Devi confermare che i contenuti rispettano le regole',
  }),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function RegistrazionePage() {
  const [currentStep, setCurrentStep] = useState(1); // 1: Dati, 2: Allegato 1, 3: Foto
  const [images, setImages] = useState<File[]>([]);
  const [allegato1Firmato, setAllegato1Firmato] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState<RegistrationForm | null>(null);
  const [cfWarnings, setCfWarnings] = useState<string[]>([]);
  const [cfInfo, setCfInfo] = useState<{sesso: string | null, dataNascita: string | null, comune: string | null}>({
    sesso: null,
    dataNascita: null,
    comune: null
  });
  const [isUploadingAllegato, setIsUploadingAllegato] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
  });

  const dataNascita = watch('dataNascita');
  const codiceFiscale = watch('codiceFiscale');
  const luogoNascita = watch('luogoNascita');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        errors.push(`${file.name}: formato non valido`);
      } else if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: dimensione superiore a 3MB`);
      } else if (images.length + validFiles.length < MAX_IMAGES) {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      alert('Alcuni file non sono stati aggiunti:\n' + errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setImages([...images, ...validFiles]);
    }

    // Reset input
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const onSubmitFinal = async () => {
    if (!formData) return;

    if (images.length === 0) {
      alert('Devi caricare almeno una foto!');
      return;
    }

    if (!allegato1Firmato) {
      alert('Devi caricare il Modulo Concorso Fotografico firmato!');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const submitFormData = new FormData();
      submitFormData.append('nome', formData.nome);
      submitFormData.append('cognome', formData.cognome);
      submitFormData.append('email', formData.email);
      submitFormData.append('codiceFiscale', formData.codiceFiscale);
      submitFormData.append('dataNascita', formData.dataNascita);
      submitFormData.append('luogoNascita', formData.luogoNascita);
      submitFormData.append('residenzaComune', formData.residenzaComune);
      submitFormData.append('residenzaIndirizzo', formData.residenzaIndirizzo);
      submitFormData.append('telefono', formData.telefono);
      submitFormData.append('dipendente', formData.dipendente);

      images.forEach((image) => {
        submitFormData.append('images', image);
      });

      submitFormData.append('allegato1', allegato1Firmato);

      const response = await fetch('/api/submit', {
        method: 'POST',
        body: submitFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        // Gestisci specificamente l'errore di codice fiscale duplicato
        if (response.status === 409) {
          setSubmitError('Questo codice fiscale ha già inviato una candidatura. Ogni partecipante può inviare una sola candidatura.');
        } else {
          throw new Error(result.error || 'Errore durante l\'invio');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      setSubmitSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Errore:', error);
      setSubmitError(error instanceof Error ? error.message : 'Errore durante l\'invio del form');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = () => {
    if (formData) {
      generateAllegato1PDF(formData);
    }
  };

  const handleStep1Submit = (data: RegistrationForm) => {
    // Verifica che il codice fiscale non abbia errori
    if (cfWarnings.length > 0) {
      return;
    }
    
    setFormData(data);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep2Submit = () => {
    if (!allegato1Firmato) {
      alert('Devi caricare il Modulo Concorso Fotografico firmato prima di continuare!');
      return;
    }

    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const processAllegato1File = (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Il file deve essere in formato PDF');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert('Il file è troppo grande. Massimo 3MB');
      return;
    }
    
    // Simula il caricamento con un delay
    setIsUploadingAllegato(true);
    setTimeout(() => {
      setAllegato1Firmato(file);
      setIsUploadingAllegato(false);
    }, 1500); // 1.5 secondi di simulazione caricamento
  };

  const handleAllegato1Upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAllegato1File(file);
    }
  };

  const handleAllegato1DragOver = (e: React.DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAllegato1Drop = (e: React.DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAllegato1File(file);
    }
  };

  const removeAllegato1 = () => {
    setAllegato1Firmato(null);
    setIsUploadingAllegato(false);
  };

  // Effetto per la validazione del codice fiscale in tempo reale
  useEffect(() => {
    if (codiceFiscale && codiceFiscale.length === 16) {
      const datiCF = estraiDatiCodiceFiscale(codiceFiscale);
      
      if (datiCF.valid) {
        const sessoLabel = datiCF.sesso === 'M' ? 'Maschio' : datiCF.sesso === 'F' ? 'Femmina' : null;
        setCfInfo({ 
          sesso: sessoLabel, 
          dataNascita: datiCF.dataNascita, 
          comune: null 
        });

        // Auto-compila la data di nascita se non è già impostata
        if (datiCF.dataNascita && !dataNascita) {
          setValue('dataNascita', datiCF.dataNascita);
        }

        // Verifica congruenza dati
        const warnings: string[] = [];
        if (dataNascita && datiCF.dataNascita && datiCF.dataNascita !== dataNascita) {
          const dataFormattata = new Date(datiCF.dataNascita).toLocaleDateString('it-IT');
          warnings.push(` La data di nascita inserita non corrisponde al CF (dal CF: ${dataFormattata})`);
        }

        setCfWarnings(warnings);
      } else {
        setCfWarnings(datiCF.errors.map(err => `${err}`));
        setCfInfo({ sesso: null, dataNascita: null, comune: null });
      }
    } else {
      setCfWarnings([]);
      setCfInfo({ sesso: null, dataNascita: null, comune: null });
    }
  }, [codiceFiscale, dataNascita, setValue]);

  if (submitSuccess) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center px-3 py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card shadow text-center">
                <div className="card-body p-5">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4" 
                       style={{width: '80px', height: '80px', background: 'rgba(40, 167, 69, 0.1)'}}>
                    <CheckCircle size={40} color="#28a745" />
                  </div>
                  <h1 className="display-4 fw-bold mb-3">Candidatura Inviata!</h1>
                  <p className="text-muted mb-3">
                    La tua candidatura al concorso &quot;Scattiamo in Provincia&quot; è stata inviata con successo.
                  </p>
                  <Link href="/" className="btn btn-primary btn-lg">
                    Torna alla Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-vh-100 py-5 px-3">
      <div className="container">
        <Link
          href="/"
          className="d-inline-flex align-items-center text-primary text-decoration-none mb-4 fw-semibold"
        >
          <ArrowLeft size={20} className="me-2" />
          Torna alla Home
        </Link>

        <div className="card shadow">
          <div className="card-body p-4 p-md-5">
            <h1 className="display-4 fw-bold mb-2">Modulo di Registrazione</h1>
            <p className="text-muted mb-2">
              Concorso Fotografico &quot;Scattiamo in Provincia&quot;
            </p>
            <p className="text-muted mb-5">
              Compila tutti i campi per partecipare gratuitamente al concorso
            </p>

          {/* Timeline */}
          <div className="mb-5">
            <div className="d-flex align-items-center justify-content-between">
              {/* Step 1 */}
              <div className="d-flex flex-column align-items-center text-center" style={{flex: '0 0 auto', minWidth: 0}}>
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${
                    currentStep >= 1
                      ? 'bg-primary text-white'
                      : 'bg-secondary text-white'
                  }`}
                  style={{width: '40px', height: '40px', fontSize: '1rem'}}
                >
                  {currentStep > 1 ? <CheckCircle size={20} /> : 1}
                </div>
                <p
                  className={`mt-2 fw-semibold mb-0 ${
                    currentStep >= 1 ? 'text-primary' : 'text-muted'
                  }`}
                  style={{fontSize: '0.75rem', lineHeight: '1.2'}}
                >
                  Dati<span className="d-none d-sm-inline"> Personali</span>
                </p>
                <p className="d-none d-md-block text-muted mb-0" style={{fontSize: '0.7rem'}}>Compila il modulo</p>
              </div>

              {/* Linea 1 */}
              <div
                className={`flex-fill ${
                  currentStep > 1 ? 'bg-primary' : 'bg-secondary'
                }`}
                style={{height: '3px', minWidth: '20px', margin: '0 8px'}}
              />

              {/* Step 2 */}
              <div className="d-flex flex-column align-items-center text-center" style={{flex: '0 0 auto', minWidth: 0}}>
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${
                    currentStep >= 2
                      ? 'bg-primary text-white'
                      : 'bg-secondary text-white'
                  }`}
                  style={{width: '40px', height: '40px', fontSize: '1rem'}}
                >
                  {currentStep > 2 ? <CheckCircle size={20} /> : 2}
                </div>
                <p
                  className={`mt-2 fw-semibold mb-0 ${
                    currentStep >= 2 ? 'text-primary' : 'text-muted'
                  }`}
                  style={{fontSize: '0.75rem', lineHeight: '1.2'}}
                >
                  Documenti
                </p>
                <p className="d-none d-md-block text-muted mb-0" style={{fontSize: '0.7rem'}}>Inserisci i documenti</p>
              </div>

              {/* Linea 2 */}
              <div
                className={`flex-fill ${
                  currentStep > 2 ? 'bg-primary' : 'bg-secondary'
                }`}
                style={{height: '3px', minWidth: '20px', margin: '0 8px'}}
              />

              {/* Step 3 */}
              <div className="d-flex flex-column align-items-center text-center" style={{flex: '0 0 auto', minWidth: 0}}>
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${
                    currentStep >= 3
                      ? 'bg-primary text-white'
                      : 'bg-secondary text-white'
                  }`}
                  style={{width: '40px', height: '40px', fontSize: '1rem'}}
                >
                  {currentStep > 3 ? <CheckCircle size={20} /> : 3}
                </div>
                <p
                  className={`mt-2 fw-semibold mb-0 ${
                    currentStep >= 3 ? 'text-primary' : 'text-muted'
                  }`}
                  style={{fontSize: '0.75rem', lineHeight: '1.2'}}
                >
                  Carica<span className="d-none d-sm-inline"> Foto</span>
                </p>
                <p className="d-none d-md-block text-muted mb-0" style={{fontSize: '0.7rem'}}>Carica fotografie</p>
              </div>
            </div>
          </div>

          {/* Step 1: Dati Personali */}
          {currentStep === 1 && (
            <form onSubmit={handleSubmit(handleStep1Submit)}>
            {/* Dati Personali */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Nome *</label>
                <input
                  type="text"
                  {...register('nome')}
                  className="form-control"
                  placeholder="Mario"
                />
                {errors.nome && <p className="text-danger small mt-1">{errors.nome.message}</p>}
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Cognome *</label>
                <input
                  type="text"
                  {...register('cognome')}
                  className="form-control"
                  placeholder="Rossi"
                />
                {errors.cognome && <p className="text-danger small mt-1">{errors.cognome.message}</p>}
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Email *</label>
                <input
                  type="email"
                  {...register('email')}
                  className="form-control"
                  placeholder="mario.rossi@example.com"
                />
                {errors.email && <p className="text-danger small mt-1">{errors.email.message}</p>}
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Codice Fiscale *</label>
                <input
                  type="text"
                  {...register('codiceFiscale')}
                  className="form-control text-uppercase"
                  placeholder="RSSMRA85M01H501Z"
                  maxLength={16}
                />
                {errors.codiceFiscale && (
                  <p className="text-danger small mt-1">{errors.codiceFiscale.message}</p>
                )}
                
                {/* Errori del codice fiscale */}
                {cfWarnings.length > 0 && (
                  <div className="mt-1">
                    {cfWarnings.map((warning, index) => (
                      <p key={index} className="text-danger small mb-1">{warning}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Data di nascita nascosta - calcolata automaticamente dal CF */}
            <input
              type="hidden"
              {...register('dataNascita')}
            />

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <Controller
                  name="luogoNascita"
                  control={control}
                  render={({ field }) => (
                    <AutocompleteInput
                      label="Luogo di Nascita"
                      value={field.value || ''}
                      onChange={field.onChange}
                      options={tuttiComuni}
                      placeholder="Inizia a digitare..."
                      error={errors.luogoNascita?.message}
                      required
                    />
                  )}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Telefono *</label>
                <input
                  type="tel"
                  {...register('telefono')}
                  className="form-control"
                  placeholder="+39 333 1234567"
                />
                {errors.telefono && <p className="text-danger small mt-1">{errors.telefono.message}</p>}
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <Controller
                  name="residenzaComune"
                  control={control}
                  render={({ field }) => (
                    <AutocompleteInput
                      label="Comune di Residenza"
                      value={field.value || ''}
                      onChange={field.onChange}
                      options={comuniRomaMetropolitana}
                      placeholder="Seleziona un comune..."
                      error={errors.residenzaComune?.message}
                      required
                    />
                  )}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Indirizzo di Residenza (Via/Piazza) *</label>
                <input
                  type="text"
                  {...register('residenzaIndirizzo')}
                  className="form-control"
                  placeholder="Via Roma, 123"
                />
                {errors.residenzaIndirizzo && (
                  <p className="text-danger small mt-1">{errors.residenzaIndirizzo.message}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Rapporto di Lavoro *</label>
              <select
                {...register('dipendente')}
                className="form-select"
                defaultValue="no"
              >
                <option value="no">
                  Non sono dipendente di Città metropolitana di Roma Capitale o di Capitale Lavoro SpA
                </option>
                <option value="cittametropolitana">
                  Sono dipendente di Città metropolitana di Roma Capitale
                </option>
                <option value="capitalelavoro">
                  Sono dipendente di Capitale Lavoro SpA
                </option>
              </select>
              {errors.dipendente && <p className="text-danger small mt-1">{errors.dipendente.message}</p>}
            </div>

            {/* Dichiarazioni */}
            <div className="bg-light border rounded p-4 mb-4">
              <h3 className="h5 fw-bold mb-4">Dichiarazioni Obbligatorie</h3>
              
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  {...register('dichiarazioneFoto')}
                  className="form-check-input"
                  id="dichiarazioneFoto"
                />
                <label className="form-check-label small" htmlFor="dichiarazioneFoto">
                  Dichiaro che le foto presentate sono state interamente ideate e scattate da me e assicuro 
                  che sulle stesse non gravino diritti di nessun genere a favore di terzi, lasciando indenne 
                  la Città metropolitana di Roma Capitale da qualsivoglia responsabilità *
                </label>
                {errors.dichiarazioneFoto && (
                  <p className="text-danger small mt-1">{errors.dichiarazioneFoto.message}</p>
                )}
              </div>

              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  {...register('dichiarazioneContenuti')}
                  className="form-check-input"
                  id="dichiarazioneContenuti"
                />
                <label className="form-check-label small" htmlFor="dichiarazioneContenuti">
                  Dichiaro che le foto caricate: (i) non contengono materiale osceno, esplicitamente sessuale, 
                  violento, offensivo o diffamatorio; (ii) non contengono materiale discriminante per sesso, 
                  etnia e religione; (iii) non contengono materiale politico *
                </label>
                {errors.dichiarazioneContenuti && (
                  <p className="text-danger small mt-1">{errors.dichiarazioneContenuti.message}</p>
                )}
              </div>

              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  {...register('accettaTermini')}
                  className="form-check-input"
                  id="accettaTermini"
                />
                <label className="form-check-label small" htmlFor="accettaTermini">
                  Dichiaro, sotto la propria responsabilità, ai sensi degli artt. 46 e 47 del D.P.R. 28 dicembre 
                  2000, n. 445, di aver preso visione e di accettare tutte le clausole contenute nel bando senza 
                  condizione alcuna *
                </label>
                {errors.accettaTermini && (
                  <p className="text-danger small mt-1">{errors.accettaTermini.message}</p>
                )}
              </div>

              <div className="form-check mb-0">
                <input
                  type="checkbox"
                  {...register('accettaPrivacy')}
                  className="form-check-input"
                  id="accettaPrivacy"
                />
                <label className="form-check-label small" htmlFor="accettaPrivacy">
                  Autorizzo la Città metropolitana di Roma Capitale al trattamento dei dati personali per la sola 
                  espletazione delle pratiche relative al concorso ai sensi del Decreto Legislativo 196/2003 e del 
                  Regolamento UE 679/2016 *
                </label>
                {errors.accettaPrivacy && (
                  <p className="text-danger small mt-1">{errors.accettaPrivacy.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button Step 1 */}
            <div className="d-flex gap-3 pt-3">
              <button
                type="submit"
                className="btn btn-primary w-100"
              >
                Continua allo Step 2
              </button>
            </div>
          </form>
          )}

          {/* Step 2: Allegato 1 e Documenti */}
          {currentStep === 2 && (
            <div>
              {/* Riepilogo Dati */}
              <div className="alert alert-secondary mb-4">
                <h3 className="h6 fw-bold mb-2">Riepilogo Dati</h3>
                <div className="small">
                  <div className="row g-2">
                    <div className="col-md-6">
                      <p className="mb-1"><strong>Nome:</strong> {formData?.nome} {formData?.cognome}</p>
                      <p className="mb-1"><strong>Email:</strong> {formData?.email}</p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-1"><strong>Codice Fiscale:</strong> {formData?.codiceFiscale}</p>
                      <p className="mb-1"><strong>Residenza:</strong> {formData?.residenzaComune}</p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="btn btn-sm btn-link p-0 mt-2"
                >
                  Modifica dati
                </button>
              </div>

              {/* Scarica e Carica Modulo Concorso Fotografico */}
              <div className="bg-light border rounded p-4 mb-4">
                <h3 className="h5 fw-bold mb-3">
                  Scarica e Firma il Modulo Concorso Fotografico
                </h3>
                <p className="mb-3">
                  Clicca sul pulsante per scaricare il Modulo Concorso Fotografico precompilato con i tuoi dati. 
                  Firmalo (anche digitalmente) e ricaricalo qui sotto.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="btn btn-primary d-inline-flex align-items-center gap-2 mb-4"
                >
                  <Download size={20} />
                  Scarica Modulo Concorso Fotografico
                </button>

                <hr className="my-4" />
                
                {isUploadingAllegato ? (
                  <form 
                    className="upload-dragdrop loading" 
                    onDragOver={handleAllegato1DragOver}
                    onSubmit={(e) => e.preventDefault()}
                  >
                    <div className="upload-dragdrop-image">
                      <img src="/bootstrap-italia/assets/upload-drag-drop-icon.svg" alt="Icona caricamento" aria-hidden="true" />
                      <div className="upload-dragdrop-loading">
                        <div className="progress-donut" data-bs-progress-donut></div>
                      </div>
                      <div className="upload-dragdrop-success">
                        <svg className="icon" aria-hidden="true">
                          <use href="/bootstrap-italia/svg/sprites.svg#it-check"></use>
                        </svg>
                      </div>
                    </div>
                    <div className="upload-dragdrop-text">
                      <p className="upload-dragdrop-weight">
                        <svg className="icon icon-xs" aria-hidden="true">
                          <use href="/bootstrap-italia/svg/sprites.svg#it-file"></use>
                        </svg> PDF (max 3MB)
                      </p>
                      <h5>Caricamento in corso...</h5>
                      <p>Il modulo sta caricando</p>
                    </div>
                  </form>
                ) : !allegato1Firmato ? (
                  <form 
                    className="upload-dragdrop" 
                    onDragOver={handleAllegato1DragOver}
                    onDrop={handleAllegato1Drop}
                    onSubmit={(e) => e.preventDefault()}
                  >
                    <div className="upload-dragdrop-image">
                      <img src="/bootstrap-italia/assets/upload-drag-drop-icon.svg" alt="Icona caricamento" aria-hidden="true" />
                      <div className="upload-dragdrop-loading">
                        <div className="progress-donut" data-bs-progress-donut></div>
                      </div>
                      <div className="upload-dragdrop-success">
                        <svg className="icon" aria-hidden="true">
                          <use href="/bootstrap-italia/svg/sprites.svg#it-check"></use>
                        </svg>
                      </div>
                    </div>
                    <div className="upload-dragdrop-text">
                      <p className="upload-dragdrop-weight">
                        <svg className="icon icon-xs" aria-hidden="true">
                          <use href="/bootstrap-italia/svg/sprites.svg#it-file"></use>
                        </svg> PDF (max 3MB)
                      </p>
                      <h5>Trascina il Modulo Concorso Fotografico per caricarlo</h5>
                      <p>
                        oppure{' '}
                        <input
                          type="file"
                          onChange={handleAllegato1Upload}
                          accept=".pdf"
                          className="upload-dragdrop-input"
                          id="allegato1-upload"
                        />
                        <label htmlFor="allegato1-upload">selezionalo dal dispositivo</label>
                      </p>
                    </div>
                  </form>
                ) : (
                  <form 
                    className="upload-dragdrop success" 
                    onSubmit={(e) => e.preventDefault()}
                  >
                    <div className="upload-dragdrop-image">
                      <img src="/bootstrap-italia/assets/upload-drag-drop-icon.svg" alt="Icona caricamento" aria-hidden="true" />
                      <div className="upload-dragdrop-loading">
                        <div className="progress-donut" data-bs-progress-donut></div>
                      </div>
                      <div className="upload-dragdrop-success">
                        <svg className="icon" aria-hidden="true">
                          <use href="/bootstrap-italia/svg/sprites.svg#it-check"></use>
                        </svg>
                      </div>
                    </div>
                    <div className="upload-dragdrop-text">
                      <p className="upload-dragdrop-weight">
                        <svg className="icon icon-xs" aria-hidden="true">
                          <use href="/bootstrap-italia/svg/sprites.svg#it-file"></use>
                        </svg> PDF ({(allegato1Firmato.size / 1024 / 1024).toFixed(2)}MB)
                      </p>
                      <h5>{allegato1Firmato.name}</h5>
                      <p>Modulo caricato con successo</p>
                      <button
                        type="button"
                        onClick={removeAllegato1}
                        className="btn btn-sm btn-danger mt-2"
                      >
                        <X size={16} className="me-1" />
                        Rimuovi
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Submit Buttons Step 2 */}
              <div className="d-flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="btn btn-outline-primary"
                >
                  Torna Indietro
                </button>
                <button
                  type="button"
                  onClick={handleStep2Submit}
                  disabled={!allegato1Firmato}
                  className="btn btn-primary flex-fill"
                >
                  Continua allo Step 3
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Upload Foto */}
          {currentStep === 3 && (
            <div>
              {/* Upload Immagini */}
              <div className="bg-light border rounded p-4 mb-4">
                <h3 className="h5 fw-bold mb-3">
                  Carica le tue Fotografie
                </h3>
                <p className="mb-3">
                  Puoi caricare fino a {MAX_IMAGES} fotografie (massimo 3MB ciascuna, formati: JPG, PNG, WebP).
                </p>
                <p className="small text-muted mb-3">
                  <strong>Hai caricato {images.length} di {MAX_IMAGES} foto</strong>
                </p>

                <form method="post" action="" encType="multipart/form-data">
                  {images.length < MAX_IMAGES && (
                    <>
                      <input 
                        type="file" 
                        name="upload-images" 
                        id="upload-images" 
                        className="upload" 
                        multiple 
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageUpload}
                      />
                      <label htmlFor="upload-images" className="btn btn-primary">
                        <svg className="icon icon-sm" aria-hidden="true">
                          <use href="/bootstrap-italia/svg/sprites.svg#it-upload"></use>
                        </svg>
                        <span>Foto</span>
                      </label>
                    </>
                  )}

                  {images.length > 0 && (
                    <ul className="upload-file-list upload-file-list-image mt-4">
                      {images.map((image, index) => (
                        <li key={index} className="upload-file success">
                          <div className="upload-image">
                            <img 
                              src={URL.createObjectURL(image)} 
                              alt={`Preview ${image.name}`}
                            />
                          </div>
                          <p>
                            <span className="visually-hidden">Immagine caricata:</span>
                            {image.name}{' '}
                            <span className="upload-file-weight">
                              {(image.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </p>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                          >
                            <span className="visually-hidden">
                              Elimina immagine {image.name}
                            </span>
                            <svg className="icon" aria-hidden="true">
                              <use href="/bootstrap-italia/svg/sprites.svg#it-close"></use>
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </form>
              </div>

              {submitError && (
                <div className="alert alert-danger">
                  {submitError}
                </div>
              )}

              {/* Submit Buttons Step 3 */}
              <div className="d-flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="btn btn-outline-primary"
                >
                  Torna Indietro
                </button>
                <button
                  type="button"
                  onClick={onSubmitFinal}
                  disabled={isSubmitting || images.length === 0}
                  className="btn btn-primary flex-fill d-flex align-items-center justify-content-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={20} className="spinner-border spinner-border-sm" />
                      Invio in corso...
                    </>
                  ) : (
                    'Invia Candidatura'
                  )}
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </main>
  );
}
