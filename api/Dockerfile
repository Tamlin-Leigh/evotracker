FROM php:8.2-cli

ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
RUN chmod +x /usr/local/bin/install-php-extensions \
    && install-php-extensions grpc zip mbstring bcmath

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN cp .env.example .env \
    && composer install --optimize-autoloader --no-dev --no-scripts \
    && composer dump-autoload --optimize \
    && php artisan key:generate \
    && php artisan package:discover --ansi

RUN chmod -R 775 storage bootstrap/cache

EXPOSE 8080

CMD ["sh", "-c", "php artisan config:clear && php artisan route:cache && php artisan serve --host=0.0.0.0 --port=8080"]
