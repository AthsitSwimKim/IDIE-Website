<?php
// CLI-only fixture controls. Never included in deployment archives.
require '/app/httpdocs/api/lib/bootstrap.php';
if (PHP_SAPI!=='cli' || (config()['db']['host'] ?? '')!=='db' || (config()['db']['name'] ?? '')!=='idie_php_test' || (config()['db']['user'] ?? '')!=='idie_test') {
    throw new RuntimeException('Disposable local validation database required');
}
switch ($argv[1] ?? '') {
    case 'column':
        echo json_encode(query("SHOW COLUMNS FROM site_references LIKE 'year'")->fetch() ?: null); break;
    case 'drop-year':
        if (query("SHOW COLUMNS FROM site_references LIKE 'year'")->fetch()) query('ALTER TABLE site_references DROP COLUMN year');
        echo 'true'; break;
    case 'deny-alter':
    case 'allow-alter':
        $pdo=new PDO('mysql:host=db;dbname=idie_php_test','root','local-test-root',[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
        // The MariaDB image escapes underscores in its database grant pattern.
        $pdo->exec(($argv[1]==='deny-alter'?'REVOKE ALTER ON `idie\_php\_test`.* FROM':'GRANT ALTER ON `idie\_php\_test`.* TO')." 'idie_test'@'%'");
        echo 'true'; break;
    default: throw new RuntimeException('Unknown fixture action');
}
