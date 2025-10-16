'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft, Upload, X, CheckCircle, Loader2, Download } from 'lucide-react';
import { generateAllegato1PDF } from '@/utils/generatePDF';

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
  const [images, setImages] = useState<File[]>([]);
  const [documento, setDocumento] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedData, setSubmittedData] = useState<RegistrationForm | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
  });

  const dataNascita = watch('dataNascita');

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

  const onSubmit = async (data: RegistrationForm) => {
    if (images.length === 0) {
      alert('Devi caricare almeno una foto!');
      return;
    }

    if (isMinorenne() && !documento) {
      alert('I minorenni devono caricare un documento di identità!');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const formData = new FormData();
      formData.append('nome', data.nome);
      formData.append('cognome', data.cognome);
      formData.append('email', data.email);
      formData.append('codiceFiscale', data.codiceFiscale);
      formData.append('dataNascita', data.dataNascita);
      formData.append('luogoNascita', data.luogoNascita);
      formData.append('residenzaComune', data.residenzaComune);
      formData.append('residenzaIndirizzo', data.residenzaIndirizzo);
      formData.append('telefono', data.telefono);
      formData.append('dipendente', data.dipendente);
      formData.append('isMinorenne', isMinorenne().toString());

      images.forEach((image) => {
        formData.append('images', image);
      });

      if (documento) {
        formData.append('documento', documento);
      }

      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Errore durante l\'invio');
      }

      setSubmittedData(data);
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Errore:', error);
      setSubmitError(error instanceof Error ? error.message : 'Errore durante l\'invio del form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = () => {
    if (submittedData) {
      generateAllegato1PDF(submittedData);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-2xl w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Registrazione Completata!</h1>
          <p className="text-gray-600 mb-4">
            La tua candidatura al concorso &quot;Scattiamo in Provincia&quot; è stata inviata con successo.
          </p>
          <p className="text-gray-600 mb-8">
            Riceverai una conferma via email all&apos;indirizzo fornito.
          </p>

          <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-3 text-primary-900">
              Scarica l&apos;Allegato 1
            </h2>
            <p className="text-primary-800 mb-4">
              Scarica il modulo precompilato (Allegato 1), firmalo e conservalo per eventuali verifiche.
            </p>
            <button
              onClick={handleDownloadPDF}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Scarica Allegato 1 (PDF)
            </button>
            <p className="text-sm text-primary-700 mt-3">
              Il PDF è precompilato con i tuoi dati. Dovrai solo firmarlo.
            </p>
          </div>

          <Link href="/" className="btn-secondary inline-block">
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                <label className="label">Luogo di Nascita *</label>
                <input
                  type="text"
                  {...register('luogoNascita')}
                  className="input-field"
                  placeholder="Roma"
                />
                {errors.luogoNascita && (
                  <p className="error-message">{errors.luogoNascita.message}</p>
                )}
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
                <label className="label">Comune di Residenza *</label>
                <input
                  type="text"
                  {...register('residenzaComune')}
                  className="input-field"
                  placeholder="Roma"
                />
                {errors.residenzaComune && (
                  <p className="error-message">{errors.residenzaComune.message}</p>
                )}
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
              </div>
            </div>

            {/* Documento per Minorenni */}
            {isMinorenne() && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-2 text-yellow-900">
                  Documento di Identità Richiesto
                </h3>
                <p className="text-yellow-800 mb-4">
                  Essendo minorenne, è necessario caricare un documento di identità.
                </p>

                <div>
                  <label className="label">Carica Documento * (PDF o Immagine, max 3MB)</label>
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
              </div>
            )}

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

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
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
          </form>
        </div>
      </div>
    </main>
  );
}
