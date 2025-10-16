import Link from 'next/link';
import { Camera, Award, Users, Image } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center text-white">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <Camera className="w-10 h-10" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Scattiamo in Provincia
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-primary-100 max-w-3xl mx-auto font-semibold">
              Borghi, luci, storia: la provincia si racconta in uno scatto
            </p>
            <p className="text-lg md:text-xl mb-8 text-primary-50 max-w-3xl mx-auto">
              Un concorso fotografico per raccontare il territorio metropolitano
            </p>
            <Link href="/registrazione" className="btn-primary inline-block text-lg">
              Partecipa Gratuitamente
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">
            Il Concorso
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p className="text-lg leading-relaxed">
              La <strong>Città metropolitana di Roma Capitale</strong> promuove la prima edizione del concorso fotografico 
              <strong> &quot;Scattiamo in Provincia&quot;</strong>, un invito aperto a tutti gli appassionati di fotografia – 
              dilettanti e professionisti – a raccontare attraverso le immagini la ricchezza e la varietà del territorio metropolitano.
            </p>
            <p className="text-lg leading-relaxed">
              <strong>Borghi, paesaggi, mestieri, sapori, tradizioni, monumenti:</strong> 120 Comuni che compongono un mosaico 
              di storia e identità, di natura e cultura. Ogni partecipante potrà immortalare scorci e atmosfere capaci di 
              restituire l&apos;anima autentica delle nostre comunità.
            </p>
            <p className="text-lg leading-relaxed">
              Le sezioni del concorso spaziano dal <strong>tema libero</strong> ai <strong>paesaggi</strong>, dalle <strong>arti 
              e mestieri</strong> all&apos;<strong>enogastronomia</strong>, fino a <strong>piazze e monumenti</strong>.
            </p>
            <p className="text-lg leading-relaxed">
              Le fotografie più rappresentative saranno selezionate da una Commissione e saranno <strong>esposte in mostre 
              fotografiche presso Palazzo Valentini</strong> e altre sedi istituzionali, oltre a essere pubblicate sui canali 
              digitali della Città metropolitana, contribuendo alla promozione del nuovo portale turistico dedicato al territorio.
            </p>
            <div className="bg-primary-50 border-l-4 border-primary-600 p-6 my-8">
              <p className="text-lg font-semibold text-primary-900 mb-2">
                La partecipazione è gratuita e aperta anche ai minorenni (con autorizzazione dei genitori).
              </p>
              <p className="text-primary-800 italic">
                Scattare, partecipare, raccontare: ogni fotografia è un gesto di amore verso la nostra provincia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Slogan Carousel Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <p className="text-primary-800 text-lg font-medium italic">
                &quot;Centoventi Comuni, mille sguardi, una sola Città metropolitana&quot;
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <p className="text-primary-800 text-lg font-medium italic">
                &quot;Dove finisce Roma, inizia un racconto da fotografare&quot;
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <p className="text-primary-800 text-lg font-medium italic">
                &quot;Dai colli ai borghi, un click per valorizzare il territorio&quot;
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <p className="text-primary-800 text-lg font-medium italic">
                &quot;Un click per scoprire la bellezza della Città metropolitana&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
            Perché Partecipare?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center group hover:shadow-xl transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Esposizione e Visibilità</h3>
              <p className="text-gray-600">
                Le tue foto saranno esposte a Palazzo Valentini e pubblicate sui canali ufficiali della Città metropolitana.
              </p>
            </div>

            <div className="card text-center group hover:shadow-xl transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Valorizza il Territorio</h3>
              <p className="text-gray-600">
                Contribuisci alla promozione del territorio metropolitano e racconta la bellezza dei nostri borghi.
              </p>
            </div>

            <div className="card text-center group hover:shadow-xl transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                <Image className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Partecipazione Gratuita</h3>
              <p className="text-gray-600">
                Carica fino a 24 foto gratuitamente. Aperto a dilettanti, professionisti e minorenni.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
            Come Partecipare
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">Registrati Gratuitamente</h3>
                <p className="text-gray-600">
                  Compila il modulo di registrazione con i tuoi dati personali e indirizzo email.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">Carica le tue Fotografie</h3>
                <p className="text-gray-600">
                  Seleziona fino a 24 delle tue migliori fotografie che raccontano il territorio metropolitano (max 3MB ciascuna).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">Invia la Candidatura</h3>
                <p className="text-gray-600">
                  Completa l&apos;invio e le tue foto potrebbero essere esposte a Palazzo Valentini e sui canali della Città metropolitana!
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/registrazione" className="btn-primary inline-block">
              Partecipa al Concorso
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-300 mb-2 font-semibold">
            Scattiamo in Provincia
          </p>
          <p className="text-gray-400 text-sm">
            Città metropolitana di Roma Capitale
          </p>
          <p className="text-gray-500 text-sm mt-4">
            © 2025 Tutti i diritti riservati
          </p>
        </div>
      </footer>
    </main>
  );
}
