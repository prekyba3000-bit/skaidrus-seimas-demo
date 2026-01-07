#!/bin/bash
# ============================================
# PostgreSQL Database Backup Script
# ============================================
# Usage:
#   ./scripts/backup_db.sh
#   crontab: 0 2 * * * /path/to/backup_db.sh
# ============================================

set -euo pipefail

# Configuration (can be overridden by environment variables)
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-seimas}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-}"
POSTGRES_DB="${POSTGRES_DB:-seimas}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"

# Timestamp format for backup files
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${POSTGRES_DB}_${TIMESTAMP}.sql.gz"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" >&2
}

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

log "Starting PostgreSQL backup..."
log "  Host: ${POSTGRES_HOST}:${POSTGRES_PORT}"
log "  Database: ${POSTGRES_DB}"
log "  Output: ${BACKUP_FILE}"

# Set password for pg_dump
export PGPASSWORD="${POSTGRES_PASSWORD}"

# Perform the backup
if pg_dump \
    -h "${POSTGRES_HOST}" \
    -p "${POSTGRES_PORT}" \
    -U "${POSTGRES_USER}" \
    -d "${POSTGRES_DB}" \
    --format=plain \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists \
    --verbose \
    2>/dev/null | gzip > "${BACKUP_FILE}"; then
    
    # Get backup file size
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    log "Backup completed successfully!"
    log "  File: ${BACKUP_FILE}"
    log "  Size: ${BACKUP_SIZE}"
else
    error "Backup failed!"
    rm -f "${BACKUP_FILE}"
    exit 1
fi

# Verify backup integrity (basic check)
if gzip -t "${BACKUP_FILE}" 2>/dev/null; then
    log "Backup integrity verified (gzip OK)"
else
    error "Backup file appears to be corrupted!"
    exit 1
fi

# Rotate old backups (keep last N days)
log "Rotating backups (keeping last ${BACKUP_RETENTION_DAYS} days)..."
DELETED_COUNT=0

find "${BACKUP_DIR}" \
    -name "${POSTGRES_DB}_*.sql.gz" \
    -type f \
    -mtime "+${BACKUP_RETENTION_DAYS}" \
    -print \
    -delete | while read -r file; do
    log "  Deleted: $(basename "$file")"
    ((DELETED_COUNT++)) || true
done

if [[ ${DELETED_COUNT} -gt 0 ]]; then
    log "Deleted ${DELETED_COUNT} old backup(s)"
else
    log "No old backups to delete"
fi

# List current backups
log ""
log "Current backups:"
ls -lh "${BACKUP_DIR}/${POSTGRES_DB}_"*.sql.gz 2>/dev/null | while read -r line; do
    log "  ${line}"
done

# Calculate total backup size
TOTAL_SIZE=$(du -sh "${BACKUP_DIR}" 2>/dev/null | cut -f1 || echo "0")
log ""
log "Total backup storage used: ${TOTAL_SIZE}"

# Send notification (optional - uncomment and configure)
# if command -v curl &> /dev/null; then
#     curl -X POST "${WEBHOOK_URL}" \
#         -H "Content-Type: application/json" \
#         -d "{\"text\": \"Database backup completed: ${BACKUP_FILE} (${BACKUP_SIZE})\"}"
# fi

log "Backup process completed!"
