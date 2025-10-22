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
  const [documento, setDocumento] = useState<File | null>(null);
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

  // Calcola se è minorenne
  const isMinorenne = () => {
    if (!dataNascita) return false;
    const birthDate = new Date(dataNascita);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 < 18;
    }
    return age < 18;
  };

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
  };

  const handleDocumentoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!ACCEPTED_DOC_TYPES.includes(file.type)) {
        alert('Formato file non valido. Usa PDF o immagini (JPG, PNG)');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        alert('Il file è troppo grande. Massimo 3MB');
        return;
      }
      setDocumento(file);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeDocumento = () => {
    setDocumento(null);
  };

  const onSubmitFinal = async () => {
    if (!formData) return;

    if (images.length === 0) {
      alert('Devi caricare almeno una foto!');
      return;
    }

    if (!allegato1Firmato) {
      alert('Devi caricare l\'Allegato 1 firmato!');
      return;
    }

    if (isMinorenne() && !documento) {
      alert('I minorenni devono caricare un documento di identità!');
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
      submitFormData.append('isMinorenne', isMinorenne().toString());

      images.forEach((image) => {
        submitFormData.append('images', image);
      });

      if (documento) {
        submitFormData.append('documento', documento);
      }

      submitFormData.append('allegato1', allegato1Firmato);

      const response = await fetch('/api/submit', {
        method: 'POST',
        body: submitFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Errore durante l\'invio');
      }

      setSubmitSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Errore:', error);
      setSubmitError(error instanceof Error ? error.message : 'Errore durante l\'invio del form');
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
    setFormData(data);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep2Submit = () => {
    if (!allegato1Firmato) {
      alert('Devi caricare l\'Allegato 1 firmato prima di continuare!');
      return;
    }
    
    if (isMinorenne() && !documento) {
      alert('I minorenni devono caricare un documento di identità!');
      return;
    }

    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAllegato1Upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Il file deve essere in formato PDF');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        alert('Il file è troppo grande. Massimo 3MB');
        return;
      }
      setAllegato1Firmato(file);
    }
  };

  const removeAllegato1 = () => {
    setAllegato1Firmato(null);
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
          warnings.push(`⚠️ La data di nascita inserita non corrisponde al CF (dal CF: ${dataFormattata})`);
        }

        setCfWarnings(warnings);
      } else {
        setCfWarnings(datiCF.errors.map(err => `❌ ${err}`));
        setCfInfo({ sesso: null, dataNascita: null, comune: null });
      }
    } else {
      setCfWarnings([]);
      setCfInfo({ sesso: null, dataNascita: null, comune: null });
    }
  }, [codiceFiscale, dataNascita, setValue]);

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="card max-w-2xl w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Candidatura Inviata!</h1>
          <p className="text-gray-600 mb-4">
            La tua candidatura al concorso &quot;Scattiamo in Provincia&quot; è stata inviata con successo.
          </p>
          <p className="text-gray-600 mb-8">
            Riceverai una conferma via email all&apos;indirizzo fornito.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h3 className="font-bold text-green-900 mb-2">Cosa succede ora?</h3>
            <p className="text-green-800 text-sm">
              La Commissione valuterà le fotografie caricate e le migliori saranno selezionate per 
              l&apos;esposizione a Palazzo Valentini e la pubblicazione sui canali della Città metropolitana.
            </p>
          </div>

          <Link href="/" className="btn-primary inline-block">
            Torna alla Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8 font-semibold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Torna alla Home
        </Link>

        <div className="card">
          <h1 className="text-4xl font-bold mb-2 text-gray-800">Modulo di Registrazione</h1>
          <p className="text-gray-600 mb-2">
            Concorso Fotografico &quot;Scattiamo in Provincia&quot;
          </p>
          <p className="text-gray-600 mb-8">
            Compila tutti i campi per partecipare gratuitamente al concorso
          </p>

          {/* Timeline */}
          <div className="mb-12">
            <div className="flex items-center">
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                    currentStep >= 1
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > 1 ? <CheckCircle className="w-6 h-6" /> : 1}
                </div>
                <p
                  className={`mt-2 text-sm font-semibold ${
                    currentStep >= 1 ? 'text-primary-600' : 'text-gray-500'
                  }`}
                >
                  Dati Personali
                </p>
                <p className="text-xs text-gray-500">Compila il modulo</p>
              </div>

              {/* Linea 1 */}
              <div
                className={`h-1 flex-1 mx-4 transition-all ${
                  currentStep > 1 ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />

              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                    currentStep >= 2
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > 2 ? <CheckCircle className="w-6 h-6" /> : 2}
                </div>
                <p
                  className={`mt-2 text-sm font-semibold ${
                    currentStep >= 2 ? 'text-primary-600' : 'text-gray-500'
                  }`}
                >
                  Firma Liberatorie
                </p>
                <p className="text-xs text-gray-500">Allegato 1 firmato</p>
              </div>

              {/* Linea 2 */}
              <div
                className={`h-1 flex-1 mx-4 transition-all ${
                  currentStep > 2 ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />

              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                    currentStep >= 3
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > 3 ? <CheckCircle className="w-6 h-6" /> : 3}
                </div>
                <p
                  className={`mt-2 text-sm font-semibold ${
                    currentStep >= 3 ? 'text-primary-600' : 'text-gray-500'
                  }`}
                >
                  Carica Foto
                </p>
                <p className="text-xs text-gray-500">Le tue fotografie</p>
              </div>
            </div>
          </div>

          {/* Step 1: Dati Personali */}
          {currentStep === 1 && (
            <form onSubmit={handleSubmit(handleStep1Submit)} className="space-y-6">
            {/* Dati Personali */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="label">Nome *</label>
                <input
                  type="text"
                  {...register('nome')}
                  className="input-field"
                  placeholder="Mario"
                />
                {errors.nome && <p className="error-message">{errors.nome.message}</p>}
              </div>

              <div>
                <label className="label">Cognome *</label>
                <input
                  type="text"
                  {...register('cognome')}
                  className="input-field"
                  placeholder="Rossi"
                />
                {errors.cognome && <p className="error-message">{errors.cognome.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                {...register('email')}
                className="input-field"
                placeholder="mario.rossi@example.com"
              />
              {errors.email && <p className="error-message">{errors.email.message}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
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

              <div>
                <label className="label">Telefono *</label>
                <input
                  type="tel"
                  {...register('telefono')}
                  className="input-field"
                  placeholder="+39 333 1234567"
                />
                {errors.telefono && <p className="error-message">{errors.telefono.message}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
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

              <div>
                <label className="label">Indirizzo di Residenza (Via/Piazza) *</label>
                <input
                  type="text"
                  {...register('residenzaIndirizzo')}
                  className="input-field"
                  placeholder="Via Roma, 123"
                />
                {errors.residenzaIndirizzo && (
                  <p className="error-message">{errors.residenzaIndirizzo.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="label">Rapporto di Lavoro *</label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('dipendente')}
                    value="no"
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-gray-700">
                    Non sono dipendente di Città metropolitana di Roma Capitale o di Capitale Lavoro SpA
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('dipendente')}
                    value="cittametropolitana"
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-gray-700">
                    Sono dipendente di Città metropolitana di Roma Capitale
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('dipendente')}
                    value="capitalelavoro"
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-gray-700">Sono dipendente di Capitale Lavoro SpA</span>
                </label>
              </div>
              {errors.dipendente && <p className="error-message">{errors.dipendente.message}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="label">Codice Fiscale *</label>
                <input
                  type="text"
                  {...register('codiceFiscale')}
                  className="input-field uppercase"
                  placeholder="RSSMRA85M01H501Z"
                  maxLength={16}
                />
                {errors.codiceFiscale && (
                  <p className="error-message">{errors.codiceFiscale.message}</p>
                )}
                
                {/* Info estratte dal CF */}
                {cfInfo.sesso && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-semibold text-blue-900 mb-1">
                      Dati estratti dal Codice Fiscale:
                    </p>
                    <div className="text-xs text-blue-800 space-y-1">
                      {cfInfo.sesso && <p>• Sesso: {cfInfo.sesso}</p>}
                      {cfInfo.dataNascita && (
                        <p>• Data di nascita: {new Date(cfInfo.dataNascita).toLocaleDateString('it-IT')}</p>
                      )}
                      {cfInfo.comune && <p>• Comune di nascita: {cfInfo.comune}</p>}
                    </div>
                  </div>
                )}
                
                {/* Warning se dati non corrispondono */}
                {cfWarnings.length > 0 && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-yellow-800 space-y-1">
                        {cfWarnings.map((warning, index) => (
                          <p key={index}>{warning}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="label">Data di Nascita *</label>
                <input
                  type="date"
                  {...register('dataNascita')}
                  className="input-field"
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.dataNascita && (
                  <p className="error-message">{errors.dataNascita.message}</p>
                )}
                {cfInfo.dataNascita && dataNascita === cfInfo.dataNascita && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Corrispondente al codice fiscale
                  </p>
                )}
              </div>
            </div>

            {/* Dichiarazioni */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 space-y-4">
              <h3 className="font-bold text-lg text-gray-800 mb-4">Dichiarazioni Obbligatorie</h3>
              
              <label className="flex items-start">
                <input
                  type="checkbox"
                  {...register('dichiarazioneFoto')}
                  className="w-5 h-5 text-primary-600 focus:ring-primary-500 mt-1"
                />
                <span className="ml-3 text-sm text-gray-700">
                  Dichiaro che le foto presentate sono state interamente ideate e scattate da me e assicuro 
                  che sulle stesse non gravino diritti di nessun genere a favore di terzi, lasciando indenne 
                  la Città metropolitana di Roma Capitale da qualsivoglia responsabilità *
                </span>
              </label>
              {errors.dichiarazioneFoto && (
                <p className="error-message ml-8">{errors.dichiarazioneFoto.message}</p>
              )}

              <label className="flex items-start">
                <input
                  type="checkbox"
                  {...register('dichiarazioneContenuti')}
                  className="w-5 h-5 text-primary-600 focus:ring-primary-500 mt-1"
                />
                <span className="ml-3 text-sm text-gray-700">
                  Dichiaro che le foto caricate: (i) non contengono materiale osceno, esplicitamente sessuale, 
                  violento, offensivo o diffamatorio; (ii) non contengono materiale discriminante per sesso, 
                  etnia e religione; (iii) non contengono materiale politico *
                </span>
              </label>
              {errors.dichiarazioneContenuti && (
                <p className="error-message ml-8">{errors.dichiarazioneContenuti.message}</p>
              )}

              <label className="flex items-start">
                <input
                  type="checkbox"
                  {...register('accettaTermini')}
                  className="w-5 h-5 text-primary-600 focus:ring-primary-500 mt-1"
                />
                <span className="ml-3 text-sm text-gray-700">
                  Dichiaro, sotto la propria responsabilità, ai sensi degli artt. 46 e 47 del D.P.R. 28 dicembre 
                  2000, n. 445, di aver preso visione e di accettare tutte le clausole contenute nel bando senza 
                  condizione alcuna *
                </span>
              </label>
              {errors.accettaTermini && (
                <p className="error-message ml-8">{errors.accettaTermini.message}</p>
              )}

              <label className="flex items-start">
                <input
                  type="checkbox"
                  {...register('accettaPrivacy')}
                  className="w-5 h-5 text-primary-600 focus:ring-primary-500 mt-1"
                />
                <span className="ml-3 text-sm text-gray-700">
                  Autorizzo la Città metropolitana di Roma Capitale al trattamento dei dati personali per la sola 
                  espletazione delle pratiche relative al concorso ai sensi del Decreto Legislativo 196/2003 e del 
                  Regolamento UE 679/2016 *
                </span>
              </label>
              {errors.accettaPrivacy && (
                <p className="error-message ml-8">{errors.accettaPrivacy.message}</p>
              )}
            </div>

            {/* Submit Button Step 1 */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="btn-primary flex-1"
              >
                Continua allo Step 2
              </button>
            </div>
          </form>
          )}

          {/* Step 2: Allegato 1 e Documenti */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Riepilogo Dati */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-800 mb-2">Riepilogo Dati</h3>
                <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
                  <p><strong>Nome:</strong> {formData?.nome} {formData?.cognome}</p>
                  <p><strong>Email:</strong> {formData?.email}</p>
                  <p><strong>Codice Fiscale:</strong> {formData?.codiceFiscale}</p>
                  <p><strong>Residenza:</strong> {formData?.residenzaComune}</p>
                </div>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-semibold mt-3"
                >
                  Modifica dati
                </button>
              </div>

              {/* Scarica Allegato 1 */}
              <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-primary-900 mb-3">
                  1. Scarica e Firma l&apos;Allegato 1
                </h3>
                <p className="text-primary-800 mb-4">
                  Clicca sul pulsante per scaricare l&apos;Allegato 1 precompilato con i tuoi dati. 
                  Firmalo (anche digitalmente) e ricaricalo qui sotto.
                </p>
                <button
                  onClick={handleDownloadPDF}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Scarica Allegato 1 da Firmare
                </button>
              </div>

              {/* Upload Allegato 1 Firmato */}
              <div>
                <label className="label">2. Carica l&apos;Allegato 1 Firmato * (PDF, max 3MB)</label>
                {!allegato1Firmato ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary-300 rounded-lg cursor-pointer hover:bg-primary-50 transition-colors">
                    <Upload className="w-8 h-8 text-primary-600 mb-2" />
                    <span className="text-sm text-primary-700 font-medium">
                      Clicca per caricare l&apos;Allegato 1 firmato
                    </span>
                    <span className="text-xs text-gray-500 mt-1">Solo PDF</span>
                    <input
                      type="file"
                      onChange={handleAllegato1Upload}
                      accept=".pdf"
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        {allegato1Firmato.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeAllegato1}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Documento per Minorenni */}
              {isMinorenne() && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-2 text-yellow-900">
                    3. Documento di Identità (Minorenni)
                  </h3>
                  <p className="text-yellow-800 mb-4">
                    Essendo minorenne, è necessario caricare un documento di identità.
                  </p>

                  {!documento ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-yellow-300 rounded-lg cursor-pointer hover:bg-yellow-50 transition-colors">
                      <Upload className="w-8 h-8 text-yellow-600 mb-2" />
                      <span className="text-sm text-yellow-700 font-medium">
                        Clicca per caricare
                      </span>
                      <input
                        type="file"
                        onChange={handleDocumentoUpload}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between bg-yellow-100 p-4 rounded-lg">
                      <span className="text-sm font-medium text-yellow-900 truncate">
                        {documento.name}
                      </span>
                      <button
                        type="button"
                        onClick={removeDocumento}
                        className="text-yellow-700 hover:text-yellow-900"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Buttons Step 2 */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="btn-secondary"
                >
                  Torna Indietro
                </button>
                <button
                  onClick={handleStep2Submit}
                  disabled={!allegato1Firmato}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continua allo Step 3
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Upload Foto */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Info completamento steps precedenti */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-green-900 mb-1">Dati e Documenti Completati</h3>
                    <p className="text-sm text-green-800">
                      Hai completato la registrazione e caricato l&apos;Allegato 1 firmato.
                      Ora carica le tue fotografie per completare la candidatura.
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Immagini */}
              <div>
                <label className="label">
                  Carica le tue Foto * (max {MAX_IMAGES}, 3MB ciascuna)
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Hai caricato {images.length} di {MAX_IMAGES} foto
                </p>

                {images.length < MAX_IMAGES && (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-primary-300 rounded-lg cursor-pointer hover:bg-primary-50 transition-colors mb-4">
                    <Upload className="w-10 h-10 text-primary-600 mb-2" />
                    <span className="text-sm text-primary-700 font-medium">
                      Clicca per caricare le foto
                    </span>
                    <span className="text-xs text-gray-500 mt-1">JPG, PNG o WebP</span>
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      className="hidden"
                    />
                  </label>
                )}

                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">{image.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {submitError}
                </div>
              )}

              {/* Submit Buttons Step 3 */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="btn-secondary"
                >
                  Torna Indietro
                </button>
                <button
                  onClick={onSubmitFinal}
                  disabled={isSubmitting || images.length === 0}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
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
    </main>
  );
}
