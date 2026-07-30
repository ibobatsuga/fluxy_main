# Multi-stage Dockerfile for Fluxy Monorepo (Frontend + Backend in 1 Railway Container)

# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY fluxy-frontend-main/package*.json ./
RUN npm ci
COPY fluxy-frontend-main/ ./
RUN npm run build

# Stage 2: PHP Runtime & Backend
FROM php:8.2-cli-alpine
WORKDIR /app

# Install system dependencies & PHP extensions
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
COPY fluxy-backend/ ./

# Install Backend Dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Copy Frontend Built Assets to Backend Public Directory
COPY --from=frontend-builder /app/frontend/dist/ ./public/

# Ensure storage directories exist and have proper permissions
RUN mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 8000

# Startup script: Run database migrations & start Laravel server on Railway $PORT
CMD ["sh", "-c", "php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]
