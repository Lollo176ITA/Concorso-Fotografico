#!/bin/bash

# Script per aggiornare la configurazione Apache

CONFIG_FILE="/gfstorage/conf/sites-enabled/concorso.capitalelavoro.it.conf"

echo "🔄 Aggiornamento configurazione Apache per Next.js..."

# Crea backup
sudo cp "$CONFIG_FILE" "${CONFIG_FILE}.backup-$(date +%Y%m%d-%H%M%S)"
echo "✅ Backup creato"

# Scrivi la nuova configurazione
sudo tee "$CONFIG_FILE" > /dev/null << 'EOF'
<VirtualHost *:80>

  ServerAdmin me@domain.com
  ServerName concorso.capitalelavoro.it

  # Log files
  ErrorLog /gfstorage/logs/httpd/concorso/error.log
  LogLevel warn
  CustomLog /gfstorage/logs/httpd/concorso/access.log combined

  # Abilita il proxy
  ProxyPreserveHost On
  ProxyRequests Off
  ProxyTimeout 300

  # Proxy verso Next.js sulla porta 3000
  ProxyPass / http://localhost:3000/
  ProxyPassReverse / http://localhost:3000/

  # WebSocket support per Next.js hot reload (dev mode)
  RewriteEngine on
  RewriteCond %{HTTP:Upgrade} websocket [NC]
  RewriteCond %{HTTP:Connection} upgrade [NC]
  RewriteRule ^/?(.*) "ws://localhost:3000/$1" [P,L]

  # Permessi
  <Proxy *>
    Order allow,deny
    Allow from all
  </Proxy>

  # ==========================================
  # CONFIGURAZIONE VECCHIA (commentata)
  # ==========================================
  # DocumentRoot /gfstorage/www/siti/concorso
  # <Directory /gfstorage/www/siti/concorso>
  #        Options Indexes FollowSymLinks
  #        AllowOverride All
  #        Require all granted
  #        RewriteEngine on
  #        RewriteBase /
  #        RewriteCond %{REQUEST_FILENAME} !-f
  #        RewriteCond %{REQUEST_FILENAME} !-d
  #        RewriteRule ^(.*)$ index.php?q=$1 [L,QSA]
  # </Directory>

</VirtualHost>
EOF

echo "✅ Configurazione aggiornata"

# Abilita moduli necessari
echo "🔧 Abilitazione moduli proxy..."
sudo a2enmod proxy proxy_http rewrite 2>/dev/null

# Test configurazione
echo "🧪 Test configurazione Apache..."
sudo apache2ctl configtest

if [ $? -eq 0 ]; then
    echo "✅ Configurazione valida"
    echo "🔄 Ricarico Apache..."
    sudo systemctl reload apache2
    echo "✅ Apache ricaricato!"
    echo ""
    echo "🎉 Configurazione completata!"
    echo "Ora puoi accedere a: http://concorso.capitalelavoro.it"
    echo "oppure: http://172.16.1.195"
else
    echo "❌ Errore nella configurazione Apache"
    echo "Ripristino backup..."
    sudo cp "${CONFIG_FILE}.backup-$(date +%Y%m%d)*" "$CONFIG_FILE"
fi
