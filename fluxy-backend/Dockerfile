# Production Dockerfile for Fluxy Backend (Laravel PHP 8.4)
FROM php:8.4-cli-alpine
WORKDIR /app

# Install system dependencies & PHP 8.4 extensions
RUN apk add --no-cache \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    zip \
    libzip-dev \
    unzip \
    sqlite-dev \
    icu-dev \
    oniguruma-dev \
    curl \
    git \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo_sqlite pdo_mysql zip intl bcmath

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy Backend Source
COPY . ./

# Install Backend Dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Permissions
RUN mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 8000

# Startup Script
CMD ["sh", "-c", "php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]
