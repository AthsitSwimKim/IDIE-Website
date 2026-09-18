<?php
declare(strict_types=1);

final class ApiError extends RuntimeException {
    public int $status;
    public array $details;
    public function __construct(int $status, string $message, array $details = []) {
        parent::__construct($message); $this->status = $status; $this->details = $details;
    }
}
function fail(int $status, string $message, array $details = []): void { throw new ApiError($status, $message, $details); }
function web_root(): string { return dirname(__DIR__, 2); }
function private_root(): string { return dirname(web_root()) . '/idie-private'; }
function config(): array {
    static $config;
    if ($config !== null) return $config;
    $path = private_root() . '/config.php';
    if (!is_file($path)) fail(503, 'ยังไม่ได้ตั้งค่าระบบหลังบ้าน กรุณาตั้งค่า idie-private/config.php');
    $config = require $path;
    if (!is_array($config) || strlen($config['app_key'] ?? '') < 32 || str_starts_with($config['app_key'], 'REPLACE_')) fail(503, 'การตั้งค่าระบบหลังบ้านยังไม่ครบ');
    $url = parse_url($config['public_url'] ?? '');
    if (!$url || !isset($url['host'], $url['scheme']) || !in_array($url['scheme'], ['https', 'http'], true)) fail(503, 'ยังไม่ได้กำหนด public_url');
    date_default_timezone_set('UTC');
    return $config;
}
function is_https(): bool { return (!empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off') || ($_SERVER['SERVER_PORT'] ?? '') == 443; }
function require_https(): void {
    if ((config()['require_https'] ?? true) && !is_https()) fail(426, 'กรุณาเปิดเว็บไซต์ผ่าน HTTPS ก่อนใช้งานระบบนี้');
}
function start_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $dir = private_root() . '/sessions';
    if (!is_dir($dir) && !mkdir($dir, 0700, true) && !is_dir($dir)) fail(503, 'โฟลเดอร์เซสชันยังไม่พร้อม กรุณาตรวจสิทธิ์โฟลเดอร์ idie-private');
    ini_set('session.use_strict_mode', '1'); ini_set('session.use_only_cookies', '1'); ini_set('session.gc_maxlifetime', '28800');
    session_save_path($dir); session_name('idie_php_sid');
    session_set_cookie_params(['lifetime'=>28800, 'path'=>'/', 'secure'=>is_https(), 'httponly'=>true, 'samesite'=>'Lax']);
    if (!session_start()) fail(503, 'เปิดเซสชันไม่ได้');
    $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
}
function csrf_token(): string { start_session(); return $_SESSION['csrf']; }
function release_read_session(): void {
    if (session_status() !== PHP_SESSION_ACTIVE) return;
    // Keep the CSRF response header without reopening the session during JSON output.
    header('X-CSRF-Token: '.($_SESSION['csrf'] ?? ''));
    session_write_close();
}
function check_mutation(): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '') {
        $expected=parse_url(config()['public_url']); $actual=parse_url($origin);
        $expectedHost=strtolower($expected['host'] ?? '');
        $actualHost=strtolower($actual['host'] ?? '');
        // The public site intentionally serves both the apex and www host.
        // Treat only those two configured hosts as same-site API origins.
        $allowedHosts=[$expectedHost];
        if (str_starts_with($expectedHost,'www.')) $allowedHosts[]=substr($expectedHost,4);
        else $allowedHosts[]='www.'.$expectedHost;
        if (!$actual || !in_array($actualHost,$allowedHosts,true) || ($actual['scheme'] ?? '') !== $expected['scheme'] || ($actual['port'] ?? null) !== ($expected['port'] ?? null)) fail(403, 'คำขอไม่ได้มาจากเว็บไซต์นี้');
    }
    $fetchSite=$_SERVER['HTTP_SEC_FETCH_SITE'] ?? '';
    if ($fetchSite === 'cross-site') fail(403, 'คำขอไม่ได้มาจากเว็บไซต์นี้');
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($token) || !hash_equals(csrf_token(), $token)) fail(403, 'เซสชันหมดอายุ กรุณาโหลดหน้าใหม่แล้วลองอีกครั้ง');
}
function db(): PDO {
    static $db;
    if ($db) return $db;
    $c=config()['db'];
    if (!preg_match('/^[A-Za-z0-9_.-]+$/', $c['host'] ?? '') || !preg_match('/^[A-Za-z0-9_-]+$/', $c['name'] ?? '') || empty($c['user'])) fail(503, 'การตั้งค่าฐานข้อมูลยังไม่ครบ');
    $db = new PDO('mysql:host='.$c['host'].';port='.(int)($c['port'] ?? 3306).';dbname='.$c['name'].';charset=utf8mb4', $c['user'], $c['password'] ?? '', [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES=>false]);
    $db->exec("SET time_zone = '+00:00'"); return $db;
}
function query(string $sql, array $params=[]): PDOStatement { $s=db()->prepare($sql); $s->execute($params); return $s; }
function current_user(): ?array {
    start_session(); $id=$_SESSION['user_id'] ?? null;
    if (!$id) return null;
    if (time()-($_SESSION['authenticated_at'] ?? 0)>28800) { unset($_SESSION['user_id']); return null; }
    $row=query('SELECT id,username,display_name,password_hash FROM users WHERE id=?',[$id])->fetch();
    if (!$row || !hash_equals($_SESSION['password_version'] ?? '',hash('sha256',$row['password_hash']))) { unset($_SESSION['user_id']); return null; }
    return ['id'=>(int)$row['id'],'username'=>$row['username'],'displayName'=>$row['display_name']];
}
function require_user(): array { require_https(); $u=current_user(); if (!$u) fail(401, 'กรุณาเข้าสู่ระบบ'); return $u; }
function sign_in(array $row): array {
    start_session(); session_regenerate_id(true);
    $_SESSION['user_id']=(int)$row['id']; $_SESSION['authenticated_at']=time(); $_SESSION['password_version']=hash('sha256',$row['password_hash']); $_SESSION['csrf']=bin2hex(random_bytes(32));
    return ['id'=>(int)$row['id'],'username'=>$row['username'],'displayName'=>$row['display_name']];
}
function json_response($data, int $status=200): void {
    http_response_code($status); header('Content-Type: application/json; charset=utf-8'); header('Cache-Control: no-store'); header('X-Content-Type-Options: nosniff');
    if (session_status() === PHP_SESSION_ACTIVE) header('X-CSRF-Token: '.csrf_token());
    echo json_encode($data, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR); exit;
}
function json_input(): array {
    if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) fail(415, 'ชนิดข้อมูลไม่ถูกต้อง');
    $raw=file_get_contents('php://input',false,null,0,1048577);
    if (strlen($raw)>1048576) fail(413, 'ข้อมูลมีขนาดใหญ่เกินไป');
    try { $object=json_decode($raw,false,64,JSON_THROW_ON_ERROR); } catch (JsonException $e) { fail(400, 'รูปแบบ JSON ไม่ถูกต้อง'); }
    if (!is_object($object)) fail(400, 'รูปแบบข้อมูลไม่ถูกต้อง');
    return json_decode($raw,true,64,JSON_THROW_ON_ERROR);
}
function rate_limit(string $bucket, int $limit, int $seconds): void {
    $key=hash_hmac('sha256',$bucket,config()['app_key']); $window=(int)(floor(time()/$seconds)*$seconds);
    query('INSERT INTO php_rate_limits (bucket,window_start,hits,expires_at) VALUES (?,?,1,?) ON DUPLICATE KEY UPDATE hits=hits+1',[$key,$window,$window+$seconds]);
    $hits=query('SELECT hits FROM php_rate_limits WHERE bucket=? AND window_start=?',[$key,$window])->fetchColumn();
    if ((int)$hits>$limit) { header('Retry-After: '.($window+$seconds-time())); fail(429, 'ส่งคำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่'); }
    if (random_int(1,100)===1) query('DELETE FROM php_rate_limits WHERE expires_at < ?',[time()]);
}
function request_ip(): string { return $_SERVER['REMOTE_ADDR'] ?? 'unknown'; }
function public_error(Throwable $e): void {
    if ($e instanceof ApiError) { json_response(['error'=>$e->getMessage(),'details'=>(object)$e->details],$e->status); }
    if ($e instanceof PDOException && ($e->errorInfo[1] ?? null)==1062) json_response(['error'=>'มีชื่อผู้ใช้หรือ slug นี้ในระบบแล้ว'],409);
    // Never log credentials or request bodies, or return database/SMTP exception details.
    error_log('[IDIE PHP] '.get_class($e).' code='.$e->getCode());
    json_response(['error'=>'ระบบหลังบ้านยังไม่พร้อมใช้งาน กรุณาตรวจฐานข้อมูลและการตั้งค่า หรือติดต่อผู้ดูแลเว็บไซต์'],503);
}
