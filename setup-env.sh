#!/usr/bin/env bash

# Safe production updater for the existing Fluxy VPS installation.
set -Eeuo pipefail

APP_ROOT="/var/www/fluxy"
BACKEND_ROOT="${APP_ROOT}/fluxy-backend"
FRONTEND_ROOT="${APP_ROOT}/fluxy-frontend-main"
ENV_FILE="${BACKEND_ROOT}/.env"
DATABASE_FILE="${BACKEND_ROOT}/database/database.sqlite"
BACKUP_ROOT="${APP_ROOT}/backups"

if [[ ! -f "${ENV_FILE}" ]]; then
    echo "ERROR: ${ENV_FILE} is missing. Create it from fluxy-backend/.env.production.example first."
    exit 1
fi

if ! grep -Eq '^APP_KEY=base64:.+' "${ENV_FILE}"; then
    echo "ERROR: APP_KEY is missing from ${ENV_FILE}."
    exit 1
fi

echo "Updating Fluxy production safely..."

sudo chown -R "$(id -un):$(id -gn)" "${APP_ROOT}"
cd "${APP_ROOT}"
git fetch --prune origin main
git reset --hard origin/main

cd "${BACKEND_ROOT}"
composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction

if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
    cd "${FRONTEND_ROOT}"
    npm ci --no-audit --no-fund
    npm run build
else
    echo "ERROR: Node.js and npm are required to build the frontend."
    exit 1
fi

sudo chown root:www-data "${ENV_FILE}"
sudo chmod 640 "${ENV_FILE}"

sudo install -d -o www-data -g www-data -m 775 \
    "${BACKEND_ROOT}/storage" \
    "${BACKEND_ROOT}/bootstrap/cache" \
    "${BACKEND_ROOT}/database"

sudo install -d -o root -g root -m 700 "${BACKUP_ROOT}"
if [[ -f "${DATABASE_FILE}" ]]; then
    sudo sqlite3 "${DATABASE_FILE}" ".backup '${BACKUP_ROOT}/database-$(date +%Y%m%d-%H%M%S).sqlite'"
else
    sudo install -o www-data -g www-data -m 664 /dev/null "${DATABASE_FILE}"
fi

cd "${BACKEND_ROOT}"
sudo -u www-data php artisan down --retry=30 || true
restore_application() {
    sudo -u www-data php artisan up >/dev/null 2>&1 || true
}
trap restore_application EXIT

sudo -u www-data php artisan migrate --force
sudo -u www-data php artisan storage:link 2>/dev/null || true
sudo -u www-data php artisan optimize:clear
sudo -u www-data php artisan config:cache
sudo -u www-data php artisan route:cache
sudo -u www-data php artisan view:cache

sudo chown -R www-data:www-data \
    "${BACKEND_ROOT}/storage" \
    "${BACKEND_ROOT}/bootstrap/cache" \
    "${BACKEND_ROOT}/database"
sudo chmod -R u=rwX,g=rwX,o=rX \
    "${BACKEND_ROOT}/storage" \
    "${BACKEND_ROOT}/bootstrap/cache" \
    "${BACKEND_ROOT}/database"
sudo chown root:www-data "${ENV_FILE}"
sudo chmod 640 "${ENV_FILE}"

echo '* * * * * www-data cd /var/www/fluxy/fluxy-backend && /usr/bin/php artisan schedule:run >> /dev/null 2>&1' \
    | sudo tee /etc/cron.d/fluxy-scheduler >/dev/null
sudo chmod 644 /etc/cron.d/fluxy-scheduler
sudo systemctl enable --now cron

sudo nginx -t
sudo systemctl reload php8.4-fpm
sudo systemctl reload nginx

restore_application
trap - EXIT

curl --fail --silent --show-error --max-time 15 \
    "https://app.fluxy.id/api/v1/health" >/dev/null

echo "Fluxy production update completed successfully."
