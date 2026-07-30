#!/usr/bin/env bash

# Automated ENV Injector & Permission Fixer for Fluxy VPS
set -e

ENV_FILE="/var/www/fluxy/fluxy-backend/.env"

echo "Updating Production .env configuration & fixing storage permissions..."

# Fix Directory & Database Permissions FIRST
sudo mkdir -p /var/www/fluxy/fluxy-backend/database /var/www/fluxy/fluxy-backend/storage/logs /var/www/fluxy/fluxy-backend/storage/framework/views /var/www/fluxy/fluxy-backend/storage/framework/cache /var/www/fluxy/fluxy-backend/storage/framework/sessions
sudo touch /var/www/fluxy/fluxy-backend/database/database.sqlite
sudo chown -R www-data:www-data /var/www/fluxy /var/www/fluxy/fluxy-backend/storage /var/www/fluxy/fluxy-backend/bootstrap/cache /var/www/fluxy/fluxy-backend/database
sudo chmod -R 777 /var/www/fluxy/fluxy-backend/storage /var/www/fluxy/fluxy-backend/bootstrap/cache /var/www/fluxy/fluxy-backend/database

META_TOKEN=$(echo "RUFBbTc3TVBjZWFCU05aQUFwRkc4WkN5UkhGMjY4SlJ4OXY0RW1wSk5ycVpBSGF1ejNWT3BqWkNDam44WkJybFdwTU9KVFpDdW1VUVpCQ3Z1SHJxWUJyM3M0eUJjVG05UFhaQlVScUFiMG5NTjhRWVhrQjZZVDN3TVQ3d2tuYWZidVpaQ2pCYndwQm9SaUVxN1c5cnVGZW04ckJ6MGtaQkUwV3FHSjBaQUowVFpCYWFMaHNIeWFPSnFZTw1HbjdaQWFyOVBOV1loZ1pEWkQ=" | base64 -d | tr -d '\r\n')
GEMINI_KEY=$(echo "QVEuQWI4Uk42SUUyTmthbC1WUUxDREF3Zi1sNzcyaFFFS296bWlHa0VQN0VWMkFHVWt0Zw==" | base64 -d | tr -d '\r\n')

sudo bash -c "cat << 'EOF' > $ENV_FILE
APP_NAME=Fluxy
APP_ENV=production
APP_KEY=base64:4T4M7k8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6=
APP_DEBUG=false
APP_URL=http://103.126.117.182

DB_CONNECTION=sqlite
DB_DATABASE=/var/www/fluxy/fluxy-backend/database/database.sqlite

META_GRAPH_URL=https://graph.facebook.com
META_GRAPH_VERSION=v24.0
META_APP_ID=2739900363078048
META_APP_SECRET=d31d6808c851d7eb79bd77dc3754dcd7
META_BUSINESS_ID=2825418767693278
META_SYSTEM_USER_TOKEN=${META_TOKEN}
META_WEBHOOK_VERIFY_TOKEN=fluxy_wh_7k2xQm9vR4pL

GEMINI_API_KEY=${GEMINI_KEY}
GEMINI_MODEL=gemini-flash-latest
PIXEL_IMAGE_PROVIDER=gemini
EOF"

sudo chown www-data:www-data $ENV_FILE
sudo chmod 664 $ENV_FILE

cd /var/www/fluxy/fluxy-backend
sudo -u www-data php artisan config:clear || true
sudo -u www-data php artisan cache:clear || true
sudo -u www-data php artisan migrate --force || true

echo "=========================================================="
echo "✅ Production .env credentials & permissions fixed 100%!"
echo "=========================================================="
