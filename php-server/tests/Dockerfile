FROM php:8.4-cli-bookworm
RUN apt-get update && apt-get install -y --no-install-recommends libpng-dev libjpeg62-turbo-dev libonig-dev && docker-php-ext-configure gd --with-jpeg && docker-php-ext-install gd pdo_mysql mbstring && rm -rf /var/lib/apt/lists/*
WORKDIR /app/httpdocs
CMD ["php","-S","0.0.0.0:8000","/app/tests/router.php"]