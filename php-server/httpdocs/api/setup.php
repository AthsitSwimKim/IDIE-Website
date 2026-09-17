<?php
declare(strict_types=1);
ini_set('display_errors','0');
require_once __DIR__.'/lib/bootstrap.php';
require_once __DIR__.'/lib/validation.php';
require_once __DIR__.'/lib/png.php';
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
// HTML form POSTs need a non-opaque Origin; suppress referrers to other sites.
header('Referrer-Policy: same-origin');
function setup_database_error(PDOException $e): string {
    $code=(int)($e->errorInfo[1] ?? 0);
    return match($code) {
        1045=>'MariaDB ปฏิเสธชื่อผู้ใช้หรือรหัสผ่าน กรุณาตรวจ db.user และ db.password ใน config.php (1045)',
        1044,1142,1227=>'บัญชี MariaDB ไม่มีสิทธิ์ที่จำเป็น กรุณาตรวจการผูกผู้ใช้กับฐานข้อมูล ('.$code.')',
        1049=>'ไม่พบฐานข้อมูลที่กำหนด กรุณาตรวจ db.name ใน config.php (1049)',
        2002,2003,2005=>'เชื่อมต่อเซิร์ฟเวอร์ MariaDB ไม่ได้ กรุณาตรวจ db.host และ db.port กับผู้ให้บริการ ('.$code.')',
        default=>'ระบบฐานข้อมูลยังไม่พร้อม กรุณาตรวจ config.php และสิทธิ์ผู้ใช้ฐานข้อมูล',
    };
}

$error=null; $success=false; $ready=false; $checks=[];
try {
    config(); require_https();
    $checks=[
        'PHP 8.0 ขึ้นไป'=>PHP_VERSION_ID>=80000,
        'PDO MySQL'=>extension_loaded('pdo_mysql'),
        'mbstring'=>extension_loaded('mbstring'),
        'ระบบจัดการรูป'=>portable_png_available() || (extension_loaded('gd') && extension_loaded('fileinfo')),
        'OpenSSL'=>extension_loaded('openssl'),
        'เขียนโฟลเดอร์ idie-private ได้'=>is_writable(private_root()),
        'เขียนโฟลเดอร์ uploads ได้'=>is_writable(web_root().'/uploads'),
        'ไฟล์ schema.sql'=>is_file(__DIR__.'/lib/schema.sql'),
        'ไลบรารีส่งอีเมล'=>is_file(__DIR__.'/lib/vendor/PHPMailer/PHPMailer.php'),
    ];
    try { db(); $checks['เชื่อมต่อ MariaDB']=true; }
    catch (PDOException $e) { $checks['เชื่อมต่อ MariaDB']=false; $error=setup_database_error($e); }
    $ready=!in_array(false,$checks,true); csrf_token();
    if ($_SERVER['REQUEST_METHOD']==='POST') {
        if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0)>8192) fail(413,'ข้อมูลมีขนาดใหญ่เกินไป');
        $_SERVER['HTTP_X_CSRF_TOKEN']=$_POST['csrf'] ?? ''; check_mutation();
        $token=$_POST['setupToken'] ?? ''; $hash=config()['setup_token_hash'] ?? '';
        if (!is_string($token) || !preg_match('/^[a-f0-9]{64}$/D',$hash) || !hash_equals($hash,hash('sha256',$token))) fail(403,'รหัสติดตั้งไม่ถูกต้อง');
        if (!$ready) fail(503,$error ?? 'กรุณาแก้รายการที่ยังไม่พร้อมก่อนติดตั้ง');
        $username=username_value($_POST['username'] ?? null);
        $display=text_value($_POST['displayName'] ?? null,'displayName',120);
        $password=password_value($_POST['password'] ?? null);
        if ($password!==($_POST['confirmPassword'] ?? null)) fail(400,'รหัสผ่านทั้งสองช่องไม่ตรงกัน');
        $pdo=db(); $lock='idie-setup-'.substr(hash('sha256',config()['db']['name']),0,32);
        if ((int)query('SELECT GET_LOCK(?,10)',[$lock])->fetchColumn()!==1) fail(409,'มีการติดตั้งอยู่ กรุณารอสักครู่');
        try {
            $sql=file_get_contents(__DIR__.'/lib/schema.sql');
            foreach (explode(';',$sql) as $statement) if (trim($statement)!=='') $pdo->exec($statement);
            if (query('SELECT id FROM php_installation WHERE id=1')->fetch() || (int)query('SELECT COUNT(*) FROM users')->fetchColumn()>0) fail(409,'ระบบนี้ติดตั้งแล้ว กรุณาเข้าสู่ระบบที่หน้า /admin/login');
            $pdo->beginTransaction();
            query('INSERT INTO users (username,display_name,password_hash) VALUES (?,?,?)',[$username,$display,password_hash($password,PASSWORD_BCRYPT,['cost'=>12])]);
            query('INSERT INTO php_installation (id,installed_at) VALUES (1,UTC_TIMESTAMP())');
            $pdo->commit(); $success=true;
        } finally {
            if ($pdo->inTransaction()) $pdo->rollBack();
            query('SELECT RELEASE_LOCK(?)',[$lock]);
        }
    }
} catch (Throwable $e) {
    if ($e instanceof ApiError) { http_response_code($e->status); $error=$e->getMessage(); }
    else { http_response_code(503); $error='เชื่อมต่อฐานข้อมูลไม่ได้ กรุณาตรวจ config.php และสิทธิ์ผู้ใช้ฐานข้อมูล'; error_log('[IDIE setup] '.get_class($e)); }
}
function h(string $v): string { return htmlspecialchars($v,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8'); }
?>
<!doctype html>
<html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ตั้งค่าผู้ดูแลเว็บไซต์ IDIE</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#F7F7F8;color:#17171a;font:16px/1.6 "Helvetica Neue",Arial,sans-serif}
main{max-width:720px;margin:48px auto;padding:32px;background:#FFFFFF;border:1px solid #d9d9df}
header{border-bottom:1px solid #d9d9df;padding-bottom:24px}header p{color:#002FA7;margin:0}h1{font-size:28px;margin:8px 0}
p{margin:12px 0}section{border-bottom:1px solid #d9d9df;padding:24px 0}h2{font-size:20px;margin:0 0 16px}
.number{display:inline-block;color:#002FA7;font-size:24px;width:48px}ul{list-style:none;padding:0;margin:0}li{display:flex;justify-content:space-between;gap:16px;border-top:1px solid #e3e3e7;padding:8px 0}
label{display:block;margin-top:16px;font-weight:bold}input{font:inherit;width:100%;padding:10px 12px;border:1px solid #aaaab4;background:#FFFFFF}
input:focus{outline:2px solid #002FA7;outline-offset:2px}button{background:#002FA7;color:#FFFFFF;border:0;padding:12px 24px;font:inherit;margin-top:24px;cursor:pointer}button:disabled{opacity:.5;cursor:default}a{color:#002FA7}
.error{border-left:4px solid #b30020;padding:12px;background:#F7F7F8}.muted{font-size:14px;color:#55555e}
@media(max-width:740px){main{margin:16px;padding:24px}h1{font-size:24px}}
</style></head><body><main>
<header><p>ID INDUSTRIAL ENGINEERING CO., LTD.</p><h1>ตั้งค่าผู้ดูแลเว็บไซต์</h1><p class="muted">สร้างบัญชีแรกสำหรับจัดการข่าวสารและผลงาน</p></header>
<?php if ($error): ?><p role="alert" class="error"><?=h($error)?></p><?php endif ?>
<?php if ($success): ?>
<section><h2>สร้างบัญชีเรียบร้อยแล้ว</h2><p>เข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่านที่คุณเพิ่งตั้งไว้</p><p><a href="/admin/login">เข้าสู่ระบบแอดมิน</a></p><p class="muted">การติดตั้งซ้ำถูกปิดแล้ว คุณสามารถลบไฟล์ api/setup.php ผ่าน File Manager ได้</p></section>
<?php else: ?>
<section><h2><span class="number">01</span>ตรวจความพร้อม</h2><ul>
<?php foreach($checks as $name=>$ok): ?><li><span><?=h($name)?></span><strong><?=$ok?'พร้อม':'ต้องแก้ไข'?></strong></li><?php endforeach ?>
</ul></section>
<section><h2><span class="number">02</span>สร้างบัญชีแรก</h2>
<p class="muted">ใช้รหัสติดตั้งจากไฟล์ LOCAL-SETUP-KEY.txt ในชุดอัปโหลด เก็บไฟล์นั้นไว้ในเครื่องคุณ</p>
<form method="post" autocomplete="off">
<input type="hidden" name="csrf" value="<?=h(session_status()===PHP_SESSION_ACTIVE?csrf_token():'')?>">
<label for="setupToken">รหัสติดตั้ง</label><input id="setupToken" name="setupToken" type="password" required maxlength="128">
<label for="username">ชื่อผู้ใช้</label><input id="username" name="username" required minlength="3" maxlength="64" pattern="[a-z0-9._-]{3,64}" autocomplete="username">
<p class="muted">ใช้ a-z, 0-9, จุด, ขีดล่าง หรือขีดกลาง</p>
<label for="displayName">ชื่อที่แสดง</label><input id="displayName" name="displayName" required maxlength="120">
<label for="password">รหัสผ่าน</label><input id="password" name="password" type="password" required minlength="12" maxlength="72" autocomplete="new-password">
<p class="muted">อย่างน้อย 12 ตัวอักษร และไม่เกิน 72 bytes</p>
<label for="confirmPassword">ยืนยันรหัสผ่าน</label><input id="confirmPassword" name="confirmPassword" type="password" required minlength="12" maxlength="72" autocomplete="new-password">
<button type="submit" <?=$ready?'':'disabled'?>>สร้างบัญชีแอดมิน</button></form>
</section>
<?php endif ?><p class="muted"><a href="/">กลับหน้าเว็บไซต์</a></p>
</main></body></html>
