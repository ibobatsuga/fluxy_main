#!/usr/bin/env bash

# One-time Fluxy provisioning for Ubuntu 24.04.
set -Eeuo pipefail

APP_ROOT="/var/www/fluxy"
BACKEND_ROOT="${APP_ROOT}/fluxy-backend"
FRONTEND_ROOT="${APP_ROOT}/fluxy-frontend-main"
REPOSITORY_URL="https://github.com/ibobatsuga/fluxy_main.git"

echo "Provisioning Fluxy on Ubuntu 24.04..."

sudo apt-get update -y
sudo apt-get install -y \
    ca-certificates curl git nginx sqlite3 unzip zip supervisor \
    software-properties-common certbot python3-certbot-nginx

sudo add-apt-repository -y ppa:ondrej/php
sudo apt-get update -y
sudo apt-get install -y \
    php8.4-fpm php8.4-cli php8.4-common php8.4-sqlite3 php8.4-mbstring \
    php8.4-xml php8.4-curl php8.4-gd php8.4-zip php8.4-intl php8.4-bcmath

if ! command -v composer >/dev/null 2>&1; then
    EXPECTED_CHECKSUM="$(curl -fsSL https://composer.github.io/installer.sig)"
    curl -fsSL https://getcomposer.org/installer -o /tmp/composer-setup.php
    ACTUAL_CHECKSUM="$(php -r "echo hash_file('sha384', '/tmp/composer-setup.php');")"
    if [[ "${EXPECTED_CHECKSUM}" != "${ACTUAL_CHECKSUM}" ]]; then
        echo "ERROR: Composer installer checksum mismatch."
        exit 1
    fi
    sudo php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer
    rm -f /tmp/composer-setup.php
fi

if ! command -v node >/dev/null 2>&1 || [[ "$(node -p 'Number(process.versions.node.split(`.`)[0])')" -lt 22 ]]; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

sudo install -d -o "$(id -un)" -g "$(id -gn)" -m 755 "${APP_ROOT}"
if [[ ! -d "${APP_ROOT}/.git" ]]; then
    git clone "${REPOSITORY_URL}" "${APP_ROOT}"
else
    cd "${APP_ROOT}"
    git fetch --prune origin main
    git reset --hard origin/main
fi

cd "${BACKEND_ROOT}"
composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction

NEW_INSTALL=false
if [[ ! -f .env ]]; then
    cp .env.production.example .env
    php artisan key:generate --force
    NEW_INSTALL=true
    read -r -p "Initial Fluxy admin email: " INITIAL_ADMIN_EMAIL
    read -r -s -p "Initial Fluxy admin password (minimum 12 characters): " INITIAL_ADMIN_PASSWORD
    echo
    if ! php -r 'exit(filter_var($argv[1], FILTER_VALIDATE_EMAIL) ? 0 : 1);' "${INITIAL_ADMIN_EMAIL}"; then
        echo "ERROR: Initial admin email is invalid."
        exit 1
    fi
    if [[ ${#INITIAL_ADMIN_PASSWORD} -lt 12 ]]; then
        echo "ERROR: Initial admin password must contain at least 12 characters."
        exit 1
    fi
    sed -i "s/^FLUXY_ADMIN_EMAILS=.*/FLUXY_ADMIN_EMAILS=${INITIAL_ADMIN_EMAIL}/" .env
fi

install -d -m 775 database storage bootstrap/cache
touch database/database.sqlite
php artisan migrate --force
if [[ "${NEW_INSTALL}" == "true" ]]; then
    SEED_ADMIN_EMAIL="${INITIAL_ADMIN_EMAIL}" \
    SEED_ADMIN_PASSWORD="${INITIAL_ADMIN_PASSWORD}" \
        php artisan db:seed --force
    unset INITIAL_ADMIN_PASSWORD
fi
php artisan storage:link 2>/dev/null || true

cd "${FRONTEND_ROOT}"
npm ci --no-audit --no-fund
npm run build

sudo chown -R www-data:www-data \
    "${BACKEND_ROOT}/storage" \
    "${BACKEND_ROOT}/bootstrap/cache" \
    "${BACKEND_ROOT}/database"
sudo chmod -R u=rwX,g=rwX,o=rX \
    "${BACKEND_ROOT}/storage" \
    "${BACKEND_ROOT}/bootstrap/cache" \
    "${BACKEND_ROOT}/database"
sudo chown root:www-data "${BACKEND_ROOT}/.env"
sudo chmod 640 "${BACKEND_ROOT}/.env"

cat <<'NGINX' | sudo tee /etc/nginx/sites-available/fluxy >/dev/null
server {
    listen 80;
    listen [::]:80;
    server_name app.fluxy.id;

    root /var/www/fluxy/fluxy-backend/public;
    index index.php index.html;
    client_max_body_size 64M;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript image/svg+xml;

    location /assets/ {
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\. {
        deny all;
    }
}
NGINX

echo '* * * * * www-data cd /var/www/fluxy/fluxy-backend && /usr/bin/php artisan schedule:run >> /dev/null 2>&1' \
    | sudo tee /etc/cron.d/fluxy-scheduler >/dev/null
sudo chmod 644 /etc/cron.d/fluxy-scheduler

sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sfn /etc/nginx/sites-available/fluxy /etc/nginx/sites-enabled/fluxy
sudo nginx -t
sudo systemctl enable --now php8.4-fpm nginx cron
sudo ufw allow 'Nginx Full' 2>/dev/null || true
sudo certbot --nginx -d app.fluxy.id --non-interactive --agree-tos --register-unsafely-without-email

cd "${BACKEND_ROOT}"
sudo -u www-data php artisan optimize
curl --fail --silent --show-error --max-time 15 https://app.fluxy.id/api/v1/health >/dev/null

echo "Fluxy provisioning completed."
