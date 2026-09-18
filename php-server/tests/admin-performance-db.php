<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
$config=require '/app/idie-private/config.php';
if (($config['db']['host'] ?? '')!=='db' || ($config['db']['name'] ?? '')!=='idie_php_test' || ($config['db']['user'] ?? '')!=='idie_test') throw new RuntimeException('Disposable database only');
$pdo=new PDO('mysql:host=db;dbname=idie_php_test;charset=utf8mb4','root','local-test-root',[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
$marker='/app/idie-private/performance-db-locked';
try {
    $pdo->exec('LOCK TABLES visitor_counter WRITE');
    file_put_contents($marker,'locked');
    usleep(3000000);
} finally {
    $pdo->exec('UNLOCK TABLES');
    if (is_file($marker)) unlink($marker);
}
