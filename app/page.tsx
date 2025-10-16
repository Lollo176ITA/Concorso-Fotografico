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
              Concorso Fotografico 2025
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Cattura l&apos;essenza del momento. Condividi la tua visione. Vinci premi straordinari.
            </p>
            <Link href="/registrazione" className="btn-primary inline-block text-lg">
              Iscriviti Ora
            </Link>
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
              <h3 className="text-xl font-bold mb-3 text-gray-800">Premi Esclusivi</h3>
              <p className="text-gray-600">
                Vinci premi straordinari e ottieni riconoscimenti per il tuo talento fotografico.
              </p>
            </div>

            <div className="card text-center group hover:shadow-xl transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Community Creativa</h3>
              <p className="text-gray-600">
                Entra a far parte di una community di fotografi appassionati e condividi la tua arte.
              </p>
            </div>

            <div className="card text-center group hover:shadow-xl transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                <Image className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Mostra il Tuo Talento</h3>
              <p className="text-gray-600">
                Carica fino a 24 foto e lascia che le tue opere parlino per te.
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
                <h3 className="font-bold text-lg mb-2 text-gray-800">Registrati</h3>
                <p className="text-gray-600">
                  Compila il modulo di registrazione con i tuoi dati personali.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">Carica le Foto</h3>
                <p className="text-gray-600">
                  Seleziona fino a 24 delle tue migliori fotografie (max 3MB ciascuna).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">Invia e Attendi</h3>
                <p className="text-gray-600">
                  Invia la tua candidatura e attendi l&apos;annuncio dei vincitori!
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/registrazione" className="btn-primary inline-block">
              Inizia Ora
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">
            © 2025 Concorso Fotografico. Tutti i diritti riservati.
          </p>
        </div>
      </footer>
    </main>
  );
}
