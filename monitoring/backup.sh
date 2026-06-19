#!/bin/bash
# ====================================================================
# ENTERPRISE POSTGRESQL BACKUP ROTATION ROUTINE
# ====================================================================

BACKUP_DIR="/var/backups/postgres"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
EXPORT_NAME="erp_snapshot_$TIMESTAMP.sql.gz"
LOG_FILE="$BACKUP_DIR/backup_engine.log"

mkdir -p "$LOG_FILE"

echo "[$(date)] INFO: Initializing database snapshot export sequence..." >> "$LOG_FILE"

# Execute pg_dump directly inside the active postgres container boundary without downtime
docker exec cyber_postgres_db pg_dumpall -U admin | gzip > "$BACKUP_DIR/$EXPORT_NAME"

if [ $? -eq 0 ]; then
    echo "[$(date)] SUCCESS: Database snapshot committed safely to $EXPORT_NAME" >> "$LOG_FILE"
    # Retention check: Sweep away snapshots older than 14 days to preserve disk footprint volume
    find "$BACKUP_DIR" -type f -name "erp_snapshot_*.sql.gz" -mtime +14 -delete
else
    echo "[$(date)] CRITICAL: Database snapshot dump execution failed." >> "$LOG_FILE"
    exit 1
fi
