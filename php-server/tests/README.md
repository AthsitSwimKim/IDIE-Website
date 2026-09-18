# Local validation

This is a disposable local environment. It does not use the existing IDIE containers or any RapidCloud credentials.
Build frontend first, then prepare test files. Python preparation requires cryptography for the local SMTP TLS certificate.

~~~
node scripts/build-rapidcloud.mjs
python php-server/tests/prepare.py
docker compose -p idie-php-validation -f php-server/tests/compose.yaml up -d --build
python php-server/tests/integration.py
python php-server/tests/public-content.py
python php-server/tests/site-reference-year.py
python php-server/tests/careers.py
python php-server/tests/admin-performance.py
node php-server/tests/public-content-client.mjs
node php-server/tests/admin-performance-client.mjs
python php-server/tests/smtp.py
python php-server/tests/edge.py
python php-server/tests/small-upload.py
docker compose -p idie-php-validation -f php-server/tests/compose.yaml exec -T php php /app/tests/lint.php
~~~

The core integration suite requires a fresh test database. For a fresh run, stop only this named compose project before preparation/start:
~~~
docker compose -p idie-php-validation -f php-server/tests/compose.yaml down
~~~
The database uses tmpfs; stopping/recreating its container discards test data. Do not run this command against any other compose project.
API and frontend are served at http://127.0.0.1:8099. Mailpit is on http://127.0.0.1:8100. All published ports bind only 127.0.0.1.
Mailpit captures mail locally and has no forwarding configuration. SMTP requires authenticated STARTTLS and the PHP test runtime trusts only its generated certificate in addition to configured local test behavior.
HTTP and fixed test passwords are allowed exclusively in generated tmp/php-test/private/config.php for localhost. Deployment config requires HTTPS and has no preset admin password.
IIS web.config handling requires verification on the real Windows host; the test PHP router approximates protected paths and SPA fallback, but does not execute IIS rules.

PHP_CLI_SERVER_WORKERS=4 enables real concurrent requests. The admin performance test briefly locks only the disposable visitor table to verify that another GET with the same session remains responsive.
