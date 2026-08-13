#!/bin/sh
set -e

if [ ! -f vendor/autoload.php ]; then
  composer install --no-security-blocking
fi

if ! grep -q "^APP_KEY=base64" .env 2>/dev/null; then
  php artisan key:generate --ansi
fi

php artisan migrate --force

if [ ! -L public/storage ]; then
  php artisan storage:link
fi

exec php artisan serve --host=0.0.0.0 --port=8080
