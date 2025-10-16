'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft, Upload, X, CheckCircle, Loader2 } from 'lucide-react';

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
const MAX_IMAGES = 24;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ACCEPTED_DOC_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

const registrationSchema = z.object({
  nome: z.string().min(2, 'Il nome deve contenere almeno 2 caratteri'),
  cognome: z.string().min(2, 'Il cognome deve contenere almeno 2 caratteri'),
  codiceFiscale: z
    .string()
    .length(16, 'Il codice fiscale deve essere di 16 caratteri')
    .toUpperCase(),
  dataNascita: z.string().min(1, 'La data di nascita è obbligatoria'),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function RegistrazionePage() {
  const [images, setImages] = useState<File[]>([]);
  const [documento, setDocumento] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

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
      formData.append('codiceFiscale', data.codiceFiscale);
      formData.append('dataNascita', data.dataNascita);
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

      setSubmitSuccess(true);
    } catch (error) {
      console.error('Errore:', error);
      setSubmitError(error instanceof Error ? error.message : 'Errore durante l\'invio del form');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Registrazione Completata!</h1>
          <p className="text-gray-600 mb-8">
            La tua candidatura è stata inviata con successo. Riceverai una conferma via email.
          </p>
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
          <p className="text-gray-600 mb-8">
            Compila tutti i campi per partecipare al concorso fotografico
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
