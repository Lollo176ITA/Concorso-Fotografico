'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Eye, Loader2, LogOut, Search, X, Image as ImageIcon } from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

interface Submission {
  codiceFiscale: string;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  dataNascita: string;
  luogoNascita: string;
  residenzaComune: string;
  residenzaIndirizzo: string;
  dipendente: string;
  timestamp: string;
  imagesCount: number;
  hasLiberatoria: boolean;
  hasAllegato1: boolean;
}

interface MediaFile {
  name: string;
  path: string;
  size: number;
  categoria?: string;
}

interface MediaData {
  images: MediaFile[];
  documenti: MediaFile[];
}

export default function AdminPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [mediaData, setMediaData] = useState<MediaData | null>(null);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchSubmissions = async (token: string) => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch('/api/backoffice/submissions', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('adminToken');
            router.push('/login');
            return;
          }
          throw new Error('Errore nel recupero delle candidature');
        }

        const data = await response.json();
        setSubmissions(data.submissions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore durante il caricamento');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions(token);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/');
  };

  const handleDownloadFiles = async (codiceFiscale: string) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const response = await fetch(`/api/backoffice/download/${codiceFiscale}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Errore nel download dei file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${codiceFiscale}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Errore durante il download dei file');
    }
  };

  const fetchMediaData = async (codiceFiscale: string) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    setIsLoadingMedia(true);
    try {
      const response = await fetch(`/api/backoffice/media/${codiceFiscale}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Errore nel caricamento dei media');
      }

      const data = await response.json();
      setMediaData(data);
    } catch (err) {
      console.error('Errore caricamento media:', err);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const handleViewDetails = (submission: Submission) => {
    setSelectedSubmission(submission);
    setMediaData(null);
    fetchMediaData(submission.codiceFiscale);
  };

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const filteredSubmissions = submissions.filter((sub) =>
    (sub.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (sub.cognome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (sub.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (sub.codiceFiscale?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Loader2 size={40} className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <main className="min-vh-100 py-4 bg-light">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Link
              href="/"
              className="d-inline-flex align-items-center text-primary text-decoration-none mb-2 fw-semibold"
            >
              <ArrowLeft size={20} className="me-2" />
              Torna alla Home
            </Link>
            <h1 className="h2 fw-bold mb-0">Pannello Amministrazione</h1>
            <p className="text-muted">Gestisci le candidature al concorso</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-danger btn-icon"
          >
            <svg className="icon icon-white icon-sm" aria-hidden="true">
              <use href="/bootstrap-italia/svg/sprites.svg#it-exit"></use>
            </svg>
            <span>Esci</span>
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="card shadow mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 fw-bold mb-0">
                Candidature Ricevute ({submissions.length})
              </h2>
              <div className="position-relative" style={{ width: '300px' }}>
                <Search
                  size={20}
                  className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                />
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Cerca per nome, email o CF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th scope="col">Nome</th>
                    <th scope="col">Email</th>
                    <th scope="col">Codice Fiscale</th>
                    <th scope="col">Comune</th>
                    <th scope="col">Data Invio</th>
                    <th scope="col">Foto</th>
                    <th scope="col">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-4">
                        {searchTerm ? 'Nessuna candidatura trovata' : 'Nessuna candidatura ricevuta'}
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((submission) => (
                      <tr key={submission.codiceFiscale}>
                        <td className="fw-medium">
                          {submission.nome} {submission.cognome}
                        </td>
                        <td>{submission.email}</td>
                        <td>{submission.codiceFiscale}</td>
                        <td>{submission.residenzaComune}</td>
                        <td>{new Date(submission.timestamp).toLocaleDateString('it-IT')}</td>
                        <td><span>{submission.imagesCount} foto</span></td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              onClick={() => handleViewDetails(submission)}
                              className="btn btn-primary btn-sm btn-icon"
                              title="Visualizza dettagli"
                              aria-label="Visualizza dettagli"
                            >
                              <svg className="icon icon-white icon-sm" aria-hidden="true">
                                <use href="/bootstrap-italia/svg/sprites.svg#it-search"></use>
                              </svg>
                              <span className="d-none d-lg-inline ms-1">Dettagli</span>
                            </button>
                            <button
                              onClick={() => handleDownloadFiles(submission.codiceFiscale)}
                              className="btn btn-success btn-sm btn-icon"
                              title="Scarica file"
                              aria-label="Scarica file"
                            >
                              <svg className="icon icon-white icon-sm" aria-hidden="true">
                                <use href="/bootstrap-italia/svg/sprites.svg#it-download"></use>
                              </svg>
                              <span className="d-none d-lg-inline ms-1">Scarica</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal dettagli */}
      {selectedSubmission && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  Dettagli Candidatura - {selectedSubmission.nome} {selectedSubmission.cognome}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedSubmission(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-1">
                  <div className="col-md-6">
                    <p className="mb-1 text-muted small">Nome Completo</p>
                    <p className="fw-semibold">
                      {selectedSubmission.nome} {selectedSubmission.cognome}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1 text-muted small">Email</p>
                    <p className="fw-semibold">{selectedSubmission.email}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1 text-muted small">Codice Fiscale</p>
                    <p className="fw-semibold font-monospace">{selectedSubmission.codiceFiscale}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1 text-muted small">Telefono</p>
                    <p className="fw-semibold">{selectedSubmission.telefono}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1 text-muted small">Data di Nascita</p>
                    <p className="fw-semibold">
                      {new Date(selectedSubmission.dataNascita).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1 text-muted small">Luogo di Nascita</p>
                    <p className="fw-semibold">{selectedSubmission.luogoNascita}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1 text-muted small">Comune di Residenza</p>
                    <p className="fw-semibold">{selectedSubmission.residenzaComune}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1 text-muted small">Indirizzo</p>
                    <p className="fw-semibold">{selectedSubmission.residenzaIndirizzo}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1 text-muted small">Rapporto di Lavoro</p>
                    <p className="fw-semibold">
                      {selectedSubmission.dipendente === 'no'
                        ? 'Non dipendente'
                        : selectedSubmission.dipendente === 'cittametropolitana'
                        ? 'Città metropolitana'
                        : 'Capitale Lavoro SpA'}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1 text-muted small">Data Invio</p>
                    <p className="fw-semibold">
                      {new Date(selectedSubmission.timestamp).toLocaleString('it-IT')}
                    </p>
                  </div>
                  <div className="col-12">
                    <hr />
                    <h6 className="fw-bold mb-3">Fotografie Caricate</h6>
                    
                    {isLoadingMedia ? (
                      <div className="text-center py-3">
                        <Loader2 size={30} className="spinner-border text-primary" />
                      </div>
                    ) : mediaData && mediaData.images.length > 0 ? (
                      (() => {
                        // Raggruppa le immagini per categoria
                        const imagesByCategory = mediaData.images.reduce((acc, image) => {
                          const cat = image.categoria || 'Senza categoria';
                          if (!acc[cat]) acc[cat] = [];
                          acc[cat].push(image);
                          return acc;
                        }, {} as Record<string, typeof mediaData.images>);

                        const categorieNames: Record<string, string> = {
                          'TL': 'Tema libero',
                          'RA': 'Ritratti ambientati',
                          'WL': 'Flora e fauna',
                          'PA': 'Fotografie panoramiche e luoghi di interesse',
                          'ME': 'Piazze, monumenti ed edifici storici',
                          'AM': 'Arti, mestieri e tradizioni',
                          'EN': 'Enogastronomia',
                        };

                        return (
                          <>
                            {Object.entries(imagesByCategory).map(([categoria, images]) => (
                              <div key={categoria} className="mb-4">
                                <h6 className="small fw-bold text-primary mb-2">
                                  {categorieNames[categoria] || categoria} ({images.length})
                                </h6>
                                <div className="row g-2">
                                  {images.map((image, index) => {
                                    const globalIndex = mediaData.images.indexOf(image);
                                    return (
                                      <div key={index} className="col-6 col-md-4 col-lg-3">
                                        <div 
                                          className="position-relative" 
                                          style={{ cursor: 'pointer', paddingTop: '100%', overflow: 'hidden', borderRadius: '8px', background: '#f0f0f0' }}
                                          onClick={() => handleOpenLightbox(globalIndex)}
                                        >
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                            src={`${image.path}?token=${localStorage.getItem('adminToken')}`}
                                            alt={image.name}
                                            className="position-absolute top-0 start-0 w-100 h-100"
                                            style={{ objectFit: 'cover' }}
                                          />
                                          <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-1 text-center" style={{ fontSize: '0.7rem' }}>
                                            {image.name.length > 20 ? image.name.substring(0, 17) + '...' : image.name}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </>
                        );
                      })()
                    ) : (
                      <p className="text-muted">Nessuna fotografia caricata</p>
                    )}
                  </div>
                  
                  <div className="col-12 mt-4">
                    <hr />
                    <h6 className="fw-bold mb-3">Documenti</h6>
                    
                    {isLoadingMedia ? (
                      <div className="text-center py-3">
                        <Loader2 size={30} className="spinner-border text-primary" />
                      </div>
                    ) : mediaData && mediaData.documenti.length > 0 ? (
                      <ul className="list-unstyled mb-0">
                        {mediaData.documenti.map((doc, index) => (
                          <li key={index} className="mb-2 d-flex align-items-center gap-2">
                            <span className="badge bg-secondary">
                              {doc.name.endsWith('.pdf') ? 'PDF' : 'IMG'}
                            </span>
                            <a 
                              href={`${doc.path}?token=${localStorage.getItem('adminToken')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-decoration-none"
                            >
                              {doc.name}
                            </a>
                            <span className="text-muted small">
                              ({(doc.size / 1024).toFixed(1)} KB)
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted">Nessun documento caricato</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-icon"
                  onClick={() => setSelectedSubmission(null)}
                >
                  <svg className="icon icon-primary icon-sm" aria-hidden="true">
                    <use href="/bootstrap-italia/svg/sprites.svg#it-close"></use>
                  </svg>
                  <span>Chiudi</span>
                </button>
                <button
                  type="button"
                  className="btn btn-success btn-icon"
                  onClick={() => handleDownloadFiles(selectedSubmission.codiceFiscale)}
                >
                  <svg className="icon icon-white icon-sm" aria-hidden="true">
                    <use href="/bootstrap-italia/svg/sprites.svg#it-download"></use>
                  </svg>
                  <span>Scarica File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Lightbox per le immagini */}
      {mediaData && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={lightboxIndex}
          slides={mediaData.images.map(img => ({
            src: `${img.path}?token=${localStorage.getItem('adminToken')}`,
            alt: img.name,
          }))}
        />
      )}
    </main>
  );
}
