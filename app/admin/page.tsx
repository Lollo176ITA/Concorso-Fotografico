'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Eye, Loader2, LogOut, Search, X } from 'lucide-react';

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
  isMinorenne: boolean;
  timestamp: string;
  imagesCount: number;
  hasLiberatoria: boolean;
  hasAllegato1: boolean;
}

export default function AdminPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchSubmissions(token);
  }, [router]);

  const fetchSubmissions = async (token: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/submissions', {
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

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/');
  };

  const handleDownloadFiles = async (codiceFiscale: string) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const response = await fetch(`/api/admin/download/${codiceFiscale}`, {
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

  const filteredSubmissions = submissions.filter((sub) =>
    sub.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.cognome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.codiceFiscale.toLowerCase().includes(searchTerm.toLowerCase())
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
            className="btn btn-outline-danger d-flex align-items-center gap-2"
          >
            <LogOut size={20} />
            Esci
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
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Codice Fiscale</th>
                    <th>Comune</th>
                    <th>Data Invio</th>
                    <th>Foto</th>
                    <th>Documenti</th>
                    <th>Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center text-muted py-4">
                        {searchTerm ? 'Nessuna candidatura trovata' : 'Nessuna candidatura ricevuta'}
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((submission) => (
                      <tr key={submission.codiceFiscale}>
                        <td className="fw-medium">
                          {submission.nome} {submission.cognome}
                          {submission.isMinorenne && (
                            <span className="badge bg-warning text-dark ms-2">Minorenne</span>
                          )}
                        </td>
                        <td>{submission.email}</td>
                        <td className="font-monospace small">{submission.codiceFiscale}</td>
                        <td>{submission.residenzaComune}</td>
                        <td>{new Date(submission.timestamp).toLocaleDateString('it-IT')}</td>
                        <td>
                          <span className="badge bg-primary">{submission.imagesCount} foto</span>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            {submission.hasAllegato1 && (
                              <span className="badge bg-success">Allegato 1</span>
                            )}
                            {submission.hasLiberatoria && (
                              <span className="badge bg-info">Liberatoria</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              onClick={() => setSelectedSubmission(submission)}
                              className="btn btn-sm btn-outline-primary"
                              title="Visualizza dettagli"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleDownloadFiles(submission.codiceFiscale)}
                              className="btn btn-sm btn-outline-success"
                              title="Scarica file"
                            >
                              <Download size={16} />
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
                <div className="row g-3">
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
                    <p className="mb-1 text-muted small">Stato</p>
                    <p className="fw-semibold">
                      {selectedSubmission.isMinorenne ? (
                        <span className="badge bg-warning text-dark">Minorenne</span>
                      ) : (
                        <span className="badge bg-success">Maggiorenne</span>
                      )}
                    </p>
                  </div>
                  <div className="col-12">
                    <p className="mb-1 text-muted small">Data Invio</p>
                    <p className="fw-semibold">
                      {new Date(selectedSubmission.timestamp).toLocaleString('it-IT')}
                    </p>
                  </div>
                  <div className="col-12">
                    <hr />
                    <h6 className="fw-bold mb-2">File Caricati</h6>
                    <ul className="list-unstyled mb-0">
                      <li className="mb-1">
                        📷 <strong>{selectedSubmission.imagesCount} fotografie</strong>
                      </li>
                      {selectedSubmission.hasAllegato1 && (
                        <li className="mb-1">✅ Modulo Concorso Fotografico firmato</li>
                      )}
                      {selectedSubmission.hasLiberatoria && (
                        <li className="mb-1">📄 Liberatoria firmata (minorenne)</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setSelectedSubmission(null)}
                >
                  Chiudi
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleDownloadFiles(selectedSubmission.codiceFiscale)}
                >
                  <Download size={16} className="me-2" />
                  Scarica File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
