"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Step1DatiPersonali, { RegistrationForm } from '@/components/registrazione/Step1DatiPersonali';
import Step2Documenti from '@/components/registrazione/Step2Documenti';
import Step3Foto, { ImageInfo } from '@/components/registrazione/Step3Foto';

export default function RegistrazionePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationForm | null>(null);
  const [allegato1Firmato, setAllegato1Firmato] = useState<File | null>(null);
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [cfWarnings, setCfWarnings] = useState<string[]>([]);

  const handleStep1Submit = (data: RegistrationForm) => {
    if (cfWarnings.length > 0) {
      alert("Correggi gli errori nel codice fiscale prima di procedere.");
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

  const onSubmitFinal = async () => {
    if (!formData) return;

    if (images.length === 0) {
      alert('Devi caricare almeno una foto!');
      return;
    }

    const missingInfo = images.some(img => !img.comune || !img.titolo);
    if (missingInfo) {
      alert('Completa tutte le informazioni per ogni foto (comune, titolo)!');
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
      
      // Append form data
      Object.entries(formData).forEach(([key, value]) => {
        if (typeof value === 'string') {
            submitFormData.append(key, value);
        } else if (typeof value === 'boolean') {
            submitFormData.append(key, value.toString());
        }
      });

      images.forEach((imageInfo, index) => {
        const newFileName = `${formData.cognome}_${formData.nome}_${imageInfo.categoria}_${imageInfo.comune}_${imageInfo.titolo}.jpg`
          .replace(/[^a-zA-Z0-9_.-]/g, '_');
        
        const renamedFile = new File([imageInfo.file], newFileName, { type: imageInfo.file.type });
        submitFormData.append('images', renamedFile);
        
        submitFormData.append(`imageMetadata[${index}]`, JSON.stringify({
          categoria: imageInfo.categoria,
          comune: imageInfo.comune,
          titolo: imageInfo.titolo,
          originalName: imageInfo.file.name
        }));
      });

      submitFormData.append('allegato1', allegato1Firmato);

      const response = await fetch('/api/submit', {
        method: 'POST',
        body: submitFormData,
      });

      const result = await response.json();

      if (!response.ok) {
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
                </div>
              </div>
            </div>

            {currentStep === 1 && (
              <Step1DatiPersonali 
                onStepSubmit={handleStep1Submit} 
                formData={formData}
                setCfWarnings={setCfWarnings}
                cfWarnings={cfWarnings}
              />
            )}

            {currentStep === 2 && (
              <Step2Documenti 
                formData={formData}
                onStepSubmit={handleStep2Submit}
                onBack={() => setCurrentStep(1)}
                allegato1Firmato={allegato1Firmato}
                setAllegato1Firmato={setAllegato1Firmato}
              />
            )}

            {currentStep === 3 && (
              <Step3Foto 
                onBack={() => setCurrentStep(2)}
                onSubmit={onSubmitFinal}
                images={images}
                setImages={setImages}
                isSubmitting={isSubmitting}
                submitError={submitError}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
