<?php
// Upload this folder NEXT TO httpdocs, never inside it. Copy to config.php.
return [
    'public_url' => 'https://idindustrial.com',
    'require_https' => true,
    'app_key' => 'REPLACE_WITH_RANDOM_APP_KEY_FROM_LOCAL_KEYS_FILE',
    'setup_token_hash' => 'REPLACE_WITH_SHA256_FROM_LOCAL_KEYS_FILE',
    'db' => [
        'host' => 'REPLACE_WITH_MARIADB_SERVER_FROM_SOLIDCP',
        'port' => 3306,
        'name' => 'REPLACE_WITH_DATABASE_NAME',
        'user' => 'REPLACE_WITH_DATABASE_USER',
        'password' => '',
    ],
    'smtp' => [
        'host' => '', 'port' => 587, 'encryption' => 'tls',
        'user' => '', 'password' => '',
        'from' => '', 'from_name' => 'IDIE Website', 'to' => '',
    ],
];
