#!/bin/bash

# Script di aggiornamento rapido
# Da eseguire sul SERVER dopo aver trasferito i nuovi file

set -e

echo "🔄 Aggiornamento Concorso Fotografico..."

PROJECT_DIR="/var/www/concorso-fotografico"

cd $PROJECT_DIR

echo "📦 Aggiornamento dipendenze..."
npm ci

echo "🔨 Rebuild applicazione..."
npm run build

echo "🔄 Riavvio PM2..."
pm2 restart concorso-fotografico

echo "📊 Status:"
pm2 status

echo ""
echo "✅ Aggiornamento completato!"
echo "Verifica i log con: pm2 logs concorso-fotografico"
