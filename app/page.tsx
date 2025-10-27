import Link from 'next/link';
import { Camera, Award, Users, Image } from 'lucide-react';

export default function Home() {
  return (
    <main>
      {/* Header Slim */}
      <div className="it-header-slim-wrapper">
        <div className="container-xxl">
          <div className="row">
            <div className="col-12">
              <div className="it-header-slim-wrapper-content">
                <a className="d-lg-block navbar-brand" href="https://www.cittametropolitanaroma.it/">Città metropolitana di Roma Capitale</a>
                <div className="it-header-slim-right-zone">
                  <Link href="/login" className="btn btn-primary btn-icon btn-full">
                    <span className="rounded-icon">
                      <svg className="icon icon-primary">
                        <use href="/bootstrap-italia/svg/sprites.svg#it-user"></use>
                      </svg>
                    </span>
                    <span className="d-none d-lg-block">Accedi all&apos;Area Riservata</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero-section py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="hero-content text-center text-white py-5">
                <h1 className="display-1 fw-bold mb-4">
                  Scattiamo in Provincia
                </h1>
                <p className="lead fs-2 mb-3 fw-semibold">
                  Borghi, luci, storia: la provincia si racconta in uno scatto
                </p>
                <p className="fs-4 mb-5">
                  Un concorso fotografico per raccontare il territorio metropolitano
                </p>
                <Link href="/registrazione" className="btn btn-primary btn-lg">
                  Partecipa Gratuitamente
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <h2 className="display-4 fw-bold text-center mb-5">
            Perché Partecipare?
          </h2>
          
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card feature-card h-100 p-4 text-center">
                <div className="card-body">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 feature-icon" 
                       style={{width: '64px', height: '64px', background: 'rgba(0, 102, 204, 0.1)'}}>
                    <Award size={32} color="#0066CC" />
                  </div>
                  <h3 className="h5 fw-bold mb-3">Vinci Targhe e Visibilità</h3>
                  <p className="text-muted">
                    I vincitori di ogni sezione riceveranno una targa di premiazione e le foto migliori saranno esposte in mostre a Palazzo Valentini e altre sedi istituzionali.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card feature-card h-100 p-4 text-center">
                <div className="card-body">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 feature-icon" 
                       style={{width: '64px', height: '64px', background: 'rgba(0, 102, 204, 0.1)'}}>
                    <Users size={32} color="#0066CC" />
                  </div>
                  <h3 className="h5 fw-bold mb-3">Promuovi il Territorio</h3>
                  <p className="text-muted">
                    Le tue opere saranno pubblicate sui canali ufficiali della Città metropolitana, contribuendo a valorizzare la bellezza dei nostri 120 Comuni.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card feature-card h-100 p-4 text-center">
                <div className="card-body">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 feature-icon" 
                       style={{width: '64px', height: '64px', background: 'rgba(0, 102, 204, 0.1)'}}>
                    <Image size={32} color="#0066CC" />
                  </div>
                  <h3 className="h5 fw-bold mb-3">Partecipazione Gratuita</h3>
                  <p className="text-muted">
                    Il concorso è aperto a tutti, professionisti e dilettanti. Carica fino a 3 foto per ognuna delle 7 sezioni tematiche.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <h2 className="display-4 fw-bold text-center mb-5">
                Come Partecipare
              </h2>
              
              <div className="row g-4">
                <div className="col-12">
                  <div className="d-flex align-items-start gap-3">
                    <div className="step-circle">1</div>
                    <div>
                      <h3 className="h5 fw-bold mb-2">Leggi il Regolamento</h3>
                      <p className="text-muted">
                        Prendi visione del regolamento completo per conoscere tutti i dettagli, le sezioni del concorso e i requisiti tecnici delle fotografie.
                      </p>
                      <Link href="/Regolamento.pdf" target="_blank" className="btn btn-outline-primary btn-sm mt-2">
                        Leggi il Regolamento
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="d-flex align-items-start gap-3">
                    <div className="step-circle">2</div>
                    <div>
                      <h3 className="h5 fw-bold mb-2">Prepara e Carica le Foto</h3>
                      <p className="text-muted">
                        Registrati sulla piattaforma, scegli le tue foto migliori (massimo 3 per sezione, formato JPG orizzontale, max 3MB) e caricale seguendo le istruzioni.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="d-flex align-items-start gap-3">
                    <div className="step-circle">3</div>
                    <div>
                      <h3 className="h5 fw-bold mb-2">Invia la Candidatura</h3>
                      <p className="text-muted">
                        Completa l&apos;invio e le tue foto potrebbero essere esposte a Palazzo Valentini e sui canali della Città metropolitana!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-5">
                <Link href="/registrazione" className="btn btn-primary btn-lg">
                  Partecipa al Concorso
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-4">
        <div className="container">
          <div className="row">
            <div className="col text-center">
              <p className="fw-semibold mb-2">
                Scattiamo in Provincia
              </p>
              <p className="text-muted small">
                Città metropolitana di Roma Capitale
              </p>
              <p className="text-muted small mt-3 mb-0">
                © 2025 Tutti i diritti riservati
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
