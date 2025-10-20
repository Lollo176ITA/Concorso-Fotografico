# 🐧 Deploy su Server Ubuntu Esistente
## Guida Semplificata per Server con NGINX già installato

---

## 📋 Scenario

Hai già un server Ubuntu con:
- ✅ NGINX installato (per Drupal)
- ✅ Certificati SSL configurati
- ✅ Firewall attivo

Vogliamo **aggiungere** il concorso fotografico senza toccare i siti Drupal esistenti.

---

## 🎯 Opzione Consigliata: PM2 (Node.js Nativo)

### Perché PM2 invece di Docker?
- ✅ Più semplice su server esistente
- ✅ Non serve installare Docker
- ✅ Si integra bene con NGINX esistente
- ✅ Meno risorse consumate

---

## 📦 Step 1: Installare Node.js 20 (5 minuti)

```bash
# Connettersi al server
ssh user@your-server-ip

# Installare Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificare installazione
node --version  # Dovrebbe essere v20.x
npm --version
```

---

## 🚀 Step 2: Installare PM2 (2 minuti)

```bash
# Installare PM2 globalmente
sudo npm install -g pm2

# Verificare
pm2 --version
```

---

## 📂 Step 3: Trasferire il Progetto (5 minuti)

### Dal tuo Mac, trasferisci i file:

```bash
# Opzione A: Con rsync (più veloce, mostra progressi)
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  ~/Projects/Concorso\ Fotografico/ \
  user@your-server-ip:/var/www/concorso-fotografico/

# Opzione B: Con scp
cd ~/Projects/Concorso\ Fotografico
tar --exclude='node_modules' --exclude='.next' --exclude='.git' -czf concorso.tar.gz .
scp concorso.tar.gz user@your-server-ip:/tmp/
```

### Sul server:

```bash
# Se hai usato scp, estrai l'archivio
sudo mkdir -p /var/www/concorso-fotografico
cd /var/www/concorso-fotografico
sudo tar -xzf /tmp/concorso.tar.gz
sudo chown -R $USER:$USER /var/www/concorso-fotografico

# Se hai usato rsync, cambia solo proprietario
sudo chown -R $USER:$USER /var/www/concorso-fotografico
```

---

## 🔧 Step 4: Build del Progetto (5 minuti)

```bash
cd /var/www/concorso-fotografico

# Installare dipendenze
npm ci --production=false

# Build per produzione
npm run build

# Creare directory per submissions
mkdir -p submissions logs
chmod 755 submissions logs
```

---

## ⚙️ Step 5: Configurare PM2 (3 minuti)

Il file `ecosystem.config.js` è già pronto nel progetto!

```bash
cd /var/www/concorso-fotografico

# Avviare l'applicazione
pm2 start ecosystem.config.js

# Verificare che sia attivo
pm2 status

# Vedere i log
pm2 logs concorso-fotografico --lines 50

# Salvare la configurazione
pm2 save

# Configurare avvio automatico al boot
pm2 startup
# Esegui il comando che PM2 ti suggerisce (sarà tipo: sudo env PATH=$PATH...)
```

---

## 🌐 Step 6: Configurare NGINX (5 minuti)

### Creare configurazione per il sottodominio:

```bash
sudo nano /etc/nginx/sites-available/concorso.cittametropolitanaroma.it
```

Copia questa configurazione:

```nginx
# Concorso Fotografico - Next.js Application
server {
    listen 80;
    listen [::]:80;
    server_name concorso.cittametropolitanaroma.it;

    # Se hai già Certbot configurato, aggiungi:
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect a HTTPS (da configurare dopo SSL)
    # return 301 https://$server_name$request_uri;
    
    # TEMPORANEO: Per testare prima di SSL, usa direttamente il proxy:
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout per upload file grandi
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Aumenta limite upload (per le foto)
    client_max_body_size 20M;
}

# HTTPS Configuration (da abilitare dopo Certbot)
# server {
#     listen 443 ssl http2;
#     listen [::]:443 ssl http2;
#     server_name concorso.cittametropolitanaroma.it;
#
#     ssl_certificate /etc/letsencrypt/live/concorso.cittametropolitanaroma.it/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/concorso.cittametropolitanaroma.it/privkey.pem;
#     
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_prefer_server_ciphers on;
#     ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
#
#     client_max_body_size 20M;
#
#     location / {
#         proxy_pass http://localhost:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#         proxy_cache_bypass $http_upgrade;
#         proxy_read_timeout 300s;
#         proxy_connect_timeout 75s;
#     }
#
#     # Security headers
#     add_header X-Frame-Options "SAMEORIGIN" always;
#     add_header X-Content-Type-Options "nosniff" always;
#     add_header X-XSS-Protection "1; mode=block" always;
#     add_header Referrer-Policy "no-referrer-when-downgrade" always;
# }
```

### Abilitare il sito:

```bash
# Creare link simbolico
sudo ln -s /etc/nginx/sites-available/concorso.cittametropolitanaroma.it /etc/nginx/sites-enabled/

# Testare configurazione NGINX
sudo nginx -t

# Se il test è OK, riavviare NGINX
sudo systemctl reload nginx
```

---

## 🔒 Step 7: Configurare SSL con Certbot (3 minuti)

Se hai già Certbot installato (probabile, se hai altri siti con SSL):

```bash
# Ottenere certificato SSL per il nuovo sottodominio
sudo certbot certonly --webroot \
  -w /var/www/html \
  -d concorso.cittametropolitanaroma.it \
  --email tua-email@cittametropolitanaroma.it \
  --agree-tos \
  --no-eff-email

# Ora modifica la configurazione NGINX:
sudo nano /etc/nginx/sites-available/concorso.cittametropolitanaroma.it

# 1. Decommenta il blocco HTTPS (rimuovi tutti i # davanti a "server {" fino alla fine)
# 2. Nel blocco HTTP (porta 80), decommenta la riga:
#    return 301 https://$server_name$request_uri;
# 3. Commenta o rimuovi il "location /" nel blocco HTTP

# Testa la configurazione
sudo nginx -t

# Riavvia NGINX
sudo systemctl reload nginx
```

---

## 🔍 Step 8: Verificare il Funzionamento (2 minuti)

```bash
# Verificare che PM2 sia attivo
pm2 status

# Verificare che l'app risponda
curl http://localhost:3000

# Verificare log
pm2 logs concorso-fotografico --lines 20

# Verificare NGINX
sudo systemctl status nginx

# Test completo (da browser)
# http://concorso.cittametropolitanaroma.it
# https://concorso.cittametropolitanaroma.it (dopo SSL)
```

---

## 📊 Comandi Utili per la Manutenzione

### PM2:
```bash
# Vedere status
pm2 status

# Vedere log in tempo reale
pm2 logs concorso-fotografico

# Riavviare l'app
pm2 restart concorso-fotografico

# Fermare l'app
pm2 stop concorso-fotografico

# Monitoraggio risorse
pm2 monit
```

### Aggiornare il Progetto:
```bash
# 1. Trasferisci i nuovi file dal Mac
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  ~/Projects/Concorso\ Fotografico/ \
  user@your-server-ip:/var/www/concorso-fotografico/

# 2. Sul server
cd /var/www/concorso-fotografico
npm ci
npm run build
pm2 restart concorso-fotografico
```

### Backup Submissions:
```bash
# Backup manuale
cd /var/www/concorso-fotografico
tar -czf backup-submissions-$(date +%Y%m%d).tar.gz submissions/

# Copiare backup sul tuo Mac
scp user@your-server-ip:/var/www/concorso-fotografico/backup-submissions-*.tar.gz ~/Desktop/
```

### NGINX:
```bash
# Verificare configurazione
sudo nginx -t

# Riavviare
sudo systemctl reload nginx

# Vedere log errori
sudo tail -f /var/log/nginx/error.log

# Vedere log accessi
sudo tail -f /var/log/nginx/access.log
```

---

## 🚨 Troubleshooting

### L'app non parte (PM2):
```bash
# Vedere log dettagliati
pm2 logs concorso-fotografico --err --lines 100

# Verificare porta 3000 libera
sudo netstat -tulpn | grep :3000

# Riavviare
pm2 restart concorso-fotografico
```

### Errore 502 Bad Gateway (NGINX):
```bash
# Verificare che PM2 sia attivo
pm2 status

# Verificare che l'app risponda su localhost
curl http://localhost:3000

# Vedere log NGINX
sudo tail -f /var/log/nginx/error.log
```

### Upload file non funziona:
```bash
# Verificare permessi directory submissions
ls -la /var/www/concorso-fotografico/submissions

# Dare permessi corretti
chmod 755 /var/www/concorso-fotografico/submissions

# Verificare limite upload in NGINX (già impostato a 20M nella config)
grep client_max_body_size /etc/nginx/sites-available/concorso.cittametropolitanaroma.it
```

### Porta 3000 già occupata:
```bash
# Vedere cosa usa la porta
sudo lsof -i :3000

# Cambiare porta nel file ecosystem.config.js
nano /var/www/concorso-fotografico/ecosystem.config.js
# Cambia PORT: 3000 in PORT: 3001 (o altra porta)

# Aggiorna anche nginx.conf
sudo nano /etc/nginx/sites-available/concorso.cittametropolitanaroma.it
# Cambia proxy_pass http://localhost:3000; in http://localhost:3001;

# Riavvia tutto
pm2 restart concorso-fotografico
sudo systemctl reload nginx
```

---

## 📝 Checklist Finale

Prima di considerare il deploy completo:

- [ ] Node.js 20.x installato
- [ ] PM2 installato e configurato per auto-start
- [ ] Progetto trasferito in `/var/www/concorso-fotografico`
- [ ] `npm run build` completato con successo
- [ ] PM2 avviato e app visibile su `http://localhost:3000`
- [ ] NGINX configurato con virtual host
- [ ] DNS configurato per puntare al server
- [ ] Certificato SSL ottenuto e HTTPS attivo
- [ ] Test di upload foto funzionante
- [ ] Directory `submissions` con permessi corretti
- [ ] Backup strategy pianificata

---

## 🎯 Riepilogo Comandi Rapidi

### Deploy Iniziale:
```bash
# Sul server
cd /var/www/concorso-fotografico
npm ci && npm run build
pm2 start ecosystem.config.js
pm2 save
sudo systemctl reload nginx
```

### Aggiornamento:
```bash
# Dal Mac
rsync -avz --exclude 'node_modules' --exclude '.next' \
  ~/Projects/Concorso\ Fotografico/ \
  user@server:/var/www/concorso-fotografico/

# Sul server
cd /var/www/concorso-fotografico
npm ci && npm run build
pm2 restart concorso-fotografico
```

---

## 💡 Considerazioni per Server Condiviso con Drupal

### Non interferisce con Drupal perché:
- ✅ Usa porta diversa (3000) gestita da PM2
- ✅ NGINX fa solo reverse proxy sul sottodominio
- ✅ Database non necessario (app standalone)
- ✅ Non tocca PHP/MySQL
- ✅ Files isolati in `/var/www/concorso-fotografico`

### Risorse consumate:
- **RAM**: ~200-500MB (dipende dal traffico)
- **CPU**: Minima in idle, scala con le richieste
- **Disco**: ~500MB (app + node_modules + submissions)

### Monitoraggio risorse:
```bash
# Vedere uso RAM/CPU di PM2
pm2 monit

# Uso generale server
htop
free -h
df -h
```

---

## 📞 Supporto Rapido

### Log da controllare:
```bash
# PM2 (applicazione Next.js)
pm2 logs concorso-fotografico

# NGINX (reverse proxy)
sudo tail -f /var/log/nginx/error.log

# Sistema
sudo journalctl -xe
```

### Test rapidi:
```bash
# App risponde?
curl http://localhost:3000

# NGINX risponde?
curl http://concorso.cittametropolitanaroma.it

# SSL funziona?
curl https://concorso.cittametropolitanaroma.it
```

---

**Tempo totale stimato**: ~30 minuti  
**Difficoltà**: Media (richiede accesso SSH e sudo)  
**Ideale per**: Server Ubuntu esistente con NGINX

---

**Ultimo aggiornamento**: 17 ottobre 2025  
**Versione**: 1.0 - Ottimizzata per server Ubuntu con Drupal
