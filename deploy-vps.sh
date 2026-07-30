#!/usr/bin/env bash

# Automated 1-Click Production Setup Script for Fluxy on Ubuntu 24.04 (Biznet Gio VPS)
set -e

echo "🚀 Starting Fluxy Automated Production Setup on Biznet Gio VPS (Ubuntu 24.04)..."

# 1. Update System Packages
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get install -y curl software-properties-common git unzip zip nginx supervisor sqlite3 libsqlite3-dev

# 2. Add Ondrej PHP PPA for PHP 8.4
sudo add-apt-repository -y ppa:ondrej/php
sudo apt-get update -y

# 3. Install PHP 8.4 & Extensions
sudo apt-get install -y php8.4-fpm php8.4-cli php8.4-common php8.4-sqlite3 php8.4-mysql php8.4-mbstring php8.4-xml php8.4-curl php8.4-gd php8.4-zip php8.4-intl php8.4-bcmath

# 4. Install Composer
if ! command -v composer &> /dev/null; then
    curl -sS https://getcomposer.org/installer | php
    sudo mv composer.phar /usr/local/bin/composer
fi

# 5. Prepare Web Directory
WEB_ROOT="/var/www/fluxy"
sudo mkdir -p $WEB_ROOT
sudo chown -R $USER:$USER $WEB_ROOT

# 6. Clone or Pull Latest Code
if [ ! -d "$WEB_ROOT/.git" ]; then
    git clone https://github.com/ibobatsuga/fluxy_main.git $WEB_ROOT
else
    cd $WEB_ROOT
    git pull origin main
fi

cd $WEB_ROOT/fluxy-backend

# 7. Configure Production Environment (.env)
if [ ! -f ".env" ]; then
    cp .env.example .env
fi

# Set Production Config
sed -i 's/APP_ENV=local/APP_ENV=production/g' .env
sed -i 's/APP_DEBUG=true/APP_DEBUG=false/g' .env

# Generate Fresh Application Key
php artisan key:generate --force

# Create SQLite Database File
mkdir -p database
touch database/database.sqlite

# 8. Install PHP Dependencies & Run Migrations
composer install --no-dev --optimize-autoloader --no-interaction
php artisan migrate --force

# 9. Set File Permissions for Webserver
sudo chown -R www-data:www-data /var/www/fluxy/fluxy-backend/storage /var/www/fluxy/fluxy-backend/bootstrap/cache /var/www/fluxy/fluxy-backend/database
sudo chmod -R 775 /var/www/fluxy/fluxy-backend/storage /var/www/fluxy/fluxy-backend/bootstrap/cache /var/www/fluxy/fluxy-backend/database

# 10. Configure Nginx Webserver
cat << 'EOF' | sudo tee /etc/nginx/sites-available/fluxy
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root /var/www/fluxy/fluxy-backend/public;
    index index.php index.html;

    client_max_body_size 64M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}
EOF

sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/fluxy /etc/nginx/sites-enabled/fluxy
sudo nginx -t
sudo systemctl restart nginx

echo "=========================================================="
echo "✅ FLUXI PRODUCTION DEPLOYMENT COMPLETE!"
echo "🌐 Your Fluxy AI Employee Platform is now LIVE on your Biznet Gio VPS IP address!"
echo "=========================================================="
