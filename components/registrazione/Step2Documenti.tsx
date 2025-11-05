import { useState } from 'react';
import { Download } from 'lucide-react';
import { RegistrationForm } from './Step1DatiPersonali';
import { generateAllegato1PDF } from '@/utils/generatePDF';

interface Step2DocumentiProps {
  formData: RegistrationForm | null;
  onStepSubmit: () => void;
  onBack: () => void;
  allegato1Firmato: File | null;
  setAllegato1Firmato: (file: File | null) => void;
}

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

export default function Step2Documenti({ formData, onStepSubmit, onBack, allegato1Firmato, setAllegato1Firmato }: Step2DocumentiProps) {
  const [isUploadingAllegato, setIsUploadingAllegato] = useState(false);

  const handleDownloadPDF = async () => {
    if (formData) {
      await generateAllegato1PDF(formData);
    }
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
    
    setIsUploadingAllegato(true);
    setTimeout(() => {
      setAllegato1Firmato(file);
      setIsUploadingAllegato(false);
    }, 1500);
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
    const input = document.getElementById('allegato1-upload') as HTMLInputElement;
    if(input) input.value = '';
  };

  return (
    <div>
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
          onClick={onBack}
          className="btn btn-sm btn-link p-0 mt-2"
        >
          Modifica dati
        </button>
      </div>

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
        
        <h4 className="h6 fw-bold mb-3">Carica il modulo firmato</h4>

        {isUploadingAllegato ? (
          <form className="upload-dragdrop loading" onSubmit={(e) => e.preventDefault()}>
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
              <h5>Modulo in caricamento</h5>
              <p>Caricamento in corso...</p>
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
              <h5>Trascina il file per caricarlo</h5>
              <p>oppure <input type="file" id="allegato1-upload" className="upload-dragdrop-input" onChange={handleAllegato1Upload} accept="application/pdf" /><label htmlFor="allegato1-upload">selezionalo dal dispositivo</label></p>
            </div>
          </form>
        ) : (
          <form className="upload-dragdrop success" onSubmit={(e) => e.preventDefault()}>
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
                </svg> PDF
              </p>
              <h5 className="text-break" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{allegato1Firmato.name}</h5>
              <p>
                Caricamento completato - <button type="button" className="btn btn-link btn-sm text-danger p-0" onClick={removeAllegato1}>Rimuovi</button>
              </p>
            </div>
          </form>
        )}
      </div>

      <div className="d-flex gap-3 pt-3">
        <button
          type="button"
          onClick={onBack}
          className="btn btn-outline-primary"
        >
          Torna Indietro
        </button>
        <button
          type="button"
          onClick={onStepSubmit}
          disabled={!allegato1Firmato}
          className="btn btn-primary flex-fill"
        >
          Continua allo Step 3
        </button>
      </div>
    </div>
  );
}
