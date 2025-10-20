#!/bin/bash

# Script di deploy rapido per server Ubuntu
# Da eseguire sul SERVER dopo aver trasferito i file

set -e  # Esce se c'è un errore

echo "🚀 Inizio deploy Concorso Fotografico..."

# Variabili
PROJECT_DIR="/var/www/concorso-fotografico"
USER_NAME=$(whoami)

echo "📂 Directory progetto: $PROJECT_DIR"

# Verifica di essere nella directory corretta
if [ ! -f "$PROJECT_DIR/package.json" ]; then
    echo "❌ Errore: package.json non trovato in $PROJECT_DIR"
    echo "Assicurati di aver trasferito i file correttamente"
    exit 1
fi

cd $PROJECT_DIR

echo "📦 Installazione dipendenze..."
npm ci --production=false

echo "🔨 Build dell'applicazione..."
npm run build

echo "📁 Creazione directory necessarie..."
mkdir -p submissions logs
chmod 755 submissions logs

echo "✅ Build completata!"
echo ""
echo "Prossimi passi:"
echo "1. Avvia l'app con: pm2 start ecosystem.config.js"
echo "2. Salva config: pm2 save"
echo "3. Verifica: pm2 status"
echo ""
echo "🎉 Deploy completato!"
