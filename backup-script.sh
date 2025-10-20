#!/bin/bash
BACKUP_DIR="/backups/concorso"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p $BACKUP_DIR

# Backup submissions
tar -czf $BACKUP_DIR/submissions-$DATE.tar.gz /opt/concorso-fotografico/submissions/

# Mantieni solo gli ultimi 30 giorni
find $BACKUP_DIR -name "submissions-*.tar.gz" -mtime +30 -delete

echo "Backup completato: $DATE"
