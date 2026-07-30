#!/usr/bin/env bash

# Automated ENV Injector for Fluxy VPS
set -e

ENV_FILE="/var/www/fluxy/fluxy-backend/.env"

echo "Updating Production .env configuration..."

META_TOKEN=$(echo "RUFBbTc3TVBjZWFCU05aQUFwRkc4WkN5UkhGMjY4SlJ4OXY0RW1wSk5ycVpBSGF1ejNWT3BqWkNDam44WkJybFdwTU9KVFpDdW1VUVpCQ3Z1SHJxWUJyM3M0eUJjVG05UFhaQlVScUFiMG5NTjhRWVhrQjZZVDN3TVQ3d2tuYWZidVpaQ2pCYndwQm9SaUVxN1c5cnVGZW04ckJ6MGtaQkUwV3FHSjBaQUowVFpCYWFMaHNIeWFPSnFZTw1HbjdaQWFyOVBOV1loZ1pEWkQ=" | base64 -d | tr -d '\r\n')
GEMINI_KEY=$(echo "QVEuQWI4Uk42SUUyTmthbC1WUUxDREF3Zi1sNzcyaFFFS296bWlHa0VQN0VWMkFHVWt0Zw==" | base64 -d | tr -d '\r\n')

cat << EOF > $ENV_FILE
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
EOF

cd /var/www/fluxy/fluxy-backend
php artisan config:clear || true
php artisan cache:clear || true

echo "=========================================================="
echo "✅ Production .env credentials injected successfully!"
echo "=========================================================="
