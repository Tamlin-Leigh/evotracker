FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    curl unzip git libzip-dev libonig-dev \
    && docker-php-ext-install zip mbstring bcmath \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

# --no-scripts skips grpc's post-install compile step which fails without build tools
RUN cp .env.example .env \
    && composer install --optimize-autoloader --no-dev --no-scripts \
    && composer dump-autoload --optimize \
    && php artisan key:generate \
    && php artisan package:discover --ansi

RUN chmod -R 775 storage bootstrap/cache

EXPOSE 8080

# config:cache runs at startup so it picks up Render's injected env vars (APP_KEY, FIREBASE_CREDENTIALS, etc.)
CMD ["sh", "-c", "php artisan config:clear && php artisan route:cache && php artisan serve --host=0.0.0.0 --port=8080"]
