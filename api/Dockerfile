FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    curl unzip git libzip-dev libonig-dev \
    && docker-php-ext-install zip mbstring \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install --optimize-autoloader --no-dev

RUN php artisan config:cache \
    && php artisan route:cache

EXPOSE 8080

CMD php artisan serve --host=0.0.0.0 --port=8080
