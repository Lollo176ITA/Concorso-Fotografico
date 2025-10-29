import { useState } from 'react';
import Image from 'next/image';
import AutocompleteInput from '@/components/AutocompleteInput';
import { tuttiComuni, comuniRomaMetropolitana } from '@/utils/comuni';

export interface ImageInfo {
  file: File;
  categoria: string;
  comune: string;
  titolo: string;
}

interface Step3FotoProps {
  onBack: () => void;
  onSubmit: () => void;
  images: ImageInfo[];
  setImages: (images: ImageInfo[]) => void;
  isSubmitting: boolean;
  submitError: string;
}

const MAX_IMAGES_PER_CATEGORY = 3;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg']; // Solo JPG come da regolamento
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

const categorie = [
  { id: 'TL', nome: 'Tema libero', descrizione: "Fotografie bianco e nero o colore, senza restrizioni di argomento." },
  { id: 'RA', nome: 'Ritratti ambientati', descrizione: "Il soggetto e il suo contesto, utilizzando l'ambiente per raccontare una storia." },
  { id: 'WL', nome: 'Flora e fauna', descrizione: "Immagini di piante e animali nei loro habitat naturali." },
  { id: 'PA', nome: 'Fotografie panoramiche e luoghi di interesse', descrizione: "Immagini ad ampio campo visivo e luoghi di interesse paesaggistico e ambientale." },
  { id: 'ME', nome: 'Piazze, monumenti ed edifici storici', descrizione: "Celebra la cultura e l'architettura, valorizzando i beni storici." },
  { id: 'AM', nome: 'Arti, mestieri e tradizioni', descrizione: "Documenta e celebra pratiche, luoghi e persone legate alla cultura popolare." },
  { id: 'EN', nome: 'Enogastronomia', descrizione: "Scatti artistici e creativi che rispecchino i prodotti tipici e tradizionali del territorio." },
];

export default function Step3Foto({ onBack, onSubmit, images, setImages, isSubmitting, submitError }: Step3FotoProps) {

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, categoria: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const errors: string[] = [];
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      errors.push(`${file.name}: formato non valido. Accettati: JPG`);
    } else if (file.size > MAX_FILE_SIZE) {
      errors.push(`${file.name}: dimensione superiore a 3MB`);
    }

    const imagesInBuffer = images.filter(img => img.categoria === categoria);
    if (imagesInBuffer.length >= MAX_IMAGES_PER_CATEGORY) {
        errors.push(`Puoi caricare al massimo ${MAX_IMAGES_PER_CATEGORY} foto per la categoria ${categoria}`);
    }

    if (errors.length > 0) {
      alert('Errore nel caricamento:\n' + errors.join('\n'));
      return;
    }

    const newImage: ImageInfo = {
      file,
      categoria,
      comune: '',
      titolo: '',
    };
    setImages([...images, newImage]);

    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const updateImageInfo = (index: number, field: keyof Omit<ImageInfo, 'file'>, value: string) => {
    const updatedImages = [...images];
    updatedImages[index] = { ...updatedImages[index], [field]: value };
    setImages(updatedImages);
  };

  return (
    <div>
      <div className="callout mb-4">
        <div className="callout-inner">
          <div className="callout-title">
            <svg className="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
              <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
            </svg>
            <span className="visually-hidden">Info</span>
            <span className="text">Specifiche del Concorso Fotografico</span>
          </div>

          <div className="mt-3">
            <h5 className="h6 fw-bold mb-2">Specifiche Tematiche</h5>
            <ul className="small mb-3">
              <li>Il concorso è aperto a fotografie digitali in formato <strong>orizzontale</strong></li>
              <li>È possibile caricare <strong>fino a 3 foto per ogni sezione</strong></li>
              <li>Sulle fotografie è fatto <strong>assoluto divieto</strong> di apporre nome, cognome, firme, sigle o qualsiasi segno di riconoscimento, pena l&apos;esclusione</li>
              <li>Non sono ammesse opere create con AI generativa, salvo piccole correzioni che non alterino lo scatto originale</li>
            </ul>

            <h5 className="h6 fw-bold mb-2">Caratteristiche Tecniche Richieste</h5>
            <div className="row mb-3">
              <div className="col-md-6 mb-2">
                <div className="d-flex">
                  <div className="fw-semibold me-2">Risoluzione:</div>
                  <div>2500 pixel per il lato lungo, 300 dpi</div>
                </div>
              </div>
              <div className="col-md-6 mb-2">
                <div className="d-flex">
                  <div className="fw-semibold me-2">Formato file:</div>
                  <div>JPG</div>
                </div>
              </div>
              <div className="col-md-6 mb-2">
                <div className="d-flex">
                  <div className="fw-semibold me-2">Spazio colore:</div>
                  <div>sRGB</div>
                </div>
              </div>
              <div className="col-md-6 mb-2">
                <div className="d-flex">
                  <div className="fw-semibold me-2">Peso massimo:</div>
                  <div>3 MB per foto</div>
                </div>
              </div>
              <div className="col-12 mb-2">
                <div className="d-flex">
                  <div className="fw-semibold me-2">Orientamento:</div>
                  <div>Orizzontale</div>
                </div>
              </div>
            </div>

            <h5 className="h6 fw-bold mb-2">⚠️ Rinominazione Automatica</h5>
            <p className="small mb-0">I file caricati verranno automaticamente rinominati dal sistema seguendo il formato: <code>Cognome_Nome_Categoria_Comune_Titolo.jpg</code></p>
          </div>
        </div>
      </div>

      {categorie.map(cat => {
        const imagesInCategory = images.filter(img => img.categoria === cat.id);
        const canAddMore = imagesInCategory.length < MAX_IMAGES_PER_CATEGORY;

        return (
          <div key={cat.id} className="bg-light border rounded p-4 mb-4">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h3 className="h5 fw-bold mb-1">{cat.nome}</h3>
                <p className="small text-muted mb-0">{cat.descrizione}</p>
              </div>
              <span className="badge bg-secondary">{imagesInCategory.length}/{MAX_IMAGES_PER_CATEGORY}</span>
            </div>
            
            <form onSubmit={(e) => e.preventDefault()}>
              {canAddMore && (
                <>
                  <input 
                    type="file" 
                    name={`upload-${cat.id}`}
                    id={`upload-${cat.id}`} 
                    className="upload" 
                    accept={ACCEPTED_IMAGE_TYPES.join(',')}
                    onChange={(e) => handleImageUpload(e, cat.id)}
                  />
                  <label htmlFor={`upload-${cat.id}`}>
                    <svg className="icon icon-sm" aria-hidden="true">
                      <use href="/bootstrap-italia/svg/sprites.svg#it-upload"></use>
                    </svg>
                    <span>Carica foto per {cat.nome}</span>
                  </label>
                </>
              )}
              
              {imagesInCategory.length > 0 && (
                <ul className="upload-file-list upload-file-list-image">
                  {imagesInCategory.map((imageInfo) => {
                    const imageIndex = images.findIndex(img => img === imageInfo);
                    return (
                      <li key={imageIndex} className="upload-file success">
                        <div className="upload-image">
                          <Image 
                            src={URL.createObjectURL(imageInfo.file)} 
                            alt={`Anteprima ${imageInfo.file.name}`}
                            width={40}
                            height={40}
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <p>
                          <span className="visually-hidden">Immagine caricata:</span>
                          {imageInfo.file.name} <span className="upload-file-weight">{(imageInfo.file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </p>
                        <button type="button" onClick={() => removeImage(imageIndex)}>
                          <span className="visually-hidden">Elimina immagine caricata {imageInfo.file.name}</span>
                          <svg className="icon" aria-hidden="true">
                            <use href="/bootstrap-italia/svg/sprites.svg#it-close"></use>
                          </svg>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </form>

            {imagesInCategory.length > 0 && (
              <div className="mt-3">
                {imagesInCategory.map((imageInfo) => {
                  const imageIndex = images.findIndex(img => img === imageInfo);
                  return (
                    <div key={imageIndex} className="border rounded p-3 mb-3 bg-white">
                      <p className="small fw-bold mb-2">Dettagli foto: {imageInfo.file.name}</p>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Titolo della foto *</label>
                          <input 
                            type="text" 
                            className="form-control"
                            value={imageInfo.titolo}
                            onChange={(e) => updateImageInfo(imageIndex, 'titolo', e.target.value)}
                            placeholder="Es: Tramonto sulla Sella del Diavolo"
                          />
                        </div>
                        <div className="col-md-6">
                          <AutocompleteInput
                            label="Comune di Scatto"
                            value={imageInfo.comune}
                            onChange={(value) => updateImageInfo(imageIndex, 'comune', value)}
                            options={comuniRomaMetropolitana}
                            placeholder="Inizia a digitare il comune..."
                            required
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )
      })}

      {submitError && (
        <div className="alert alert-danger mt-4">
          {submitError}
        </div>
      )}

      <div className="d-flex gap-3 pt-3">
        <button
          type="button"
          onClick={onBack}
          className="btn btn-outline-primary"
          disabled={isSubmitting}
        >
          Torna Indietro
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="btn btn-primary flex-fill"
          disabled={isSubmitting || images.length === 0}
        >
          {isSubmitting ? 'Invio in corso...' : 'Invia Candidatura'}
        </button>
      </div>
    </div>
  );
}
