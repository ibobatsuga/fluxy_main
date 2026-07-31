#!/usr/bin/env bash

set -Eeuo pipefail

DATABASE_FILE="/var/www/fluxy/fluxy-backend/database/database.sqlite"
BACKUP_ROOT="/var/www/fluxy/backups"
RETENTION_DAYS="${FLUXY_BACKUP_RETENTION_DAYS:-30}"

exec 9>/run/lock/fluxy-backup.lock
if ! flock -n 9; then
    echo "Another Fluxy database backup is already running."
    exit 0
fi

if [[ ! -f "${DATABASE_FILE}" ]]; then
    echo "ERROR: Fluxy database is missing: ${DATABASE_FILE}"
    exit 1
fi

install -d -o root -g root -m 700 "${BACKUP_ROOT}"
BACKUP_FILE="${BACKUP_ROOT}/database-$(date +%Y%m%d-%H%M%S).sqlite"

cleanup_failed_backup() {
    if [[ -f "${BACKUP_FILE}" ]]; then
        rm -f -- "${BACKUP_FILE}"
    fi
}
trap cleanup_failed_backup ERR

sqlite3 -cmd '.timeout 10000' "${DATABASE_FILE}" ".backup '${BACKUP_FILE}'"
if [[ "$(sqlite3 -cmd '.timeout 10000' "${BACKUP_FILE}" 'PRAGMA quick_check;')" != "ok" ]]; then
    echo "ERROR: Fluxy database backup failed integrity validation."
    exit 1
fi

chmod 600 "${BACKUP_FILE}"
find "${BACKUP_ROOT}" -maxdepth 1 -type f -name 'database-*.sqlite' \
    -mtime "+${RETENTION_DAYS}" -delete
trap - ERR

echo "Fluxy database backup completed and verified."
