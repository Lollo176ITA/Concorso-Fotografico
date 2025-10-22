#!/bin/bash

# Script di ripubblicazione per Concorso Fotografico
# Esegui questo script dopo aver fatto modifiche al codice

set -e  # Esce se c'è un errore

echo " Inizio ripubblicazione Concorso Fotografico..."
echo ""

# Carica NVM per avere accesso a Node.js
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Vai nella directory del progetto
cd /gfstorage/www/siti/concorso/Concorso-Fotografico


# Opzionale: Aggiorna dipendenze se package.json è cambiato
if git diff --name-only HEAD~1 2>/dev/null | grep -q "package.json"; then
    echo " Aggiornamento dipendenze..."
    npm install
    echo ""
fi

# Build del progetto
echo "🔨 Build del progetto Next.js..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌Build fallita!"
    exit 1
fi

echo ""
echo "✅ Build completata con successo!"
echo ""

# Riavvia l'applicazione con PM2
echo "🔄 Riavvio applicazione..."
pm2 restart concorso-fotografico

if [ $? -ne 0 ]; then
    echo "❌ Riavvio PM2 fallito!"
    exit 1
fi

echo ""
echo "✅ Applicazione riavviata!"
echo ""

# Mostra lo stato
echo "Stato applicazione:"
pm2 status concorso-fotografico

echo ""
echo "Ultimi log:"
pm2 logs concorso-fotografico --lines 10 --nostream

echo ""
echo "🎉 Ripubblicazione completata con successo!"
echo ""
echo "🌐 Sito disponibile su:"
echo "   - http://concorso.capitalelavoro.it"
echo "   - http://172.16.1.195"
echo ""
echo "💡 Per vedere i log in tempo reale: pm2 logs concorso-fotografico"
