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
                    <span className="d-none d-lg-block">Accedi al backoffice</span>
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
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4" 
                     style={{width: '80px', height: '80px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)'}}>
                  <Camera size={40} />
                </div>
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

      {/* About Section */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <h2 className="display-4 fw-bold text-center mb-5">
                Il Concorso
              </h2>
              <div className="fs-5 lh-lg">
                <p className="mb-4">
                  La <strong>Città metropolitana di Roma Capitale</strong> promuove la prima edizione del concorso fotografico 
                  <strong> &quot;Scattiamo in Provincia&quot;</strong>, un invito aperto a tutti gli appassionati di fotografia – 
                  dilettanti e professionisti – a raccontare attraverso le immagini la ricchezza e la varietà del territorio metropolitano.
                </p>
                <p className="mb-4">
                  <strong>Borghi, paesaggi, mestieri, sapori, tradizioni, monumenti:</strong> 120 Comuni che compongono un mosaico 
                  di storia e identità, di natura e cultura. Ogni partecipante potrà immortalare scorci e atmosfere capaci di 
                  restituire l&apos;anima autentica delle nostre comunità.
                </p>
                <p className="mb-4">
                  Le sezioni del concorso spaziano dal <strong>tema libero</strong> ai <strong>paesaggi</strong>, dalle <strong>arti 
                  e mestieri</strong> all&apos;<strong>enogastronomia</strong>, fino a <strong>piazze e monumenti</strong>.
                </p>
                <p className="mb-4">
                  Le fotografie più rappresentative saranno selezionate da una Commissione e saranno <strong>esposte in mostre 
                  fotografiche presso Palazzo Valentini</strong> e altre sedi istituzionali, oltre a essere pubblicate sui canali 
                  digitali della Città metropolitana, contribuendo alla promozione del nuovo portale turistico dedicato al territorio.
                </p>
                <div className="alert alert-info border-start border-primary border-4 my-5">
                  <p className="fs-5 fw-semibold mb-2">
                    La partecipazione è gratuita e aperta anche ai minorenni (con autorizzazione dei genitori).
                  </p>
                  <p className="fst-italic mb-0">
                    Scattare, partecipare, raccontare: ogni fotografia è un gesto di amore verso la nostra provincia.
                  </p>
                </div>
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
                  <h3 className="h5 fw-bold mb-3">Esposizione e Visibilità</h3>
                  <p className="text-muted">
                    Le tue foto saranno esposte a Palazzo Valentini e pubblicate sui canali ufficiali della Città metropolitana.
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
                  <h3 className="h5 fw-bold mb-3">Valorizza il Territorio</h3>
                  <p className="text-muted">
                    Contribuisci alla promozione del territorio metropolitano e racconta la bellezza dei nostri borghi.
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
                    Carica fino a 24 foto gratuitamente. Aperto a dilettanti, professionisti e minorenni.
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
                      <h3 className="h5 fw-bold mb-2">Registrati Gratuitamente</h3>
                      <p className="text-muted">
                        Compila il modulo di registrazione con i tuoi dati personali e indirizzo email.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="d-flex align-items-start gap-3">
                    <div className="step-circle">2</div>
                    <div>
                      <h3 className="h5 fw-bold mb-2">Carica le tue Fotografie</h3>
                      <p className="text-muted">
                        Seleziona fino a 24 delle tue migliori fotografie che raccontano il territorio metropolitano (max 3MB ciascuna).
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
