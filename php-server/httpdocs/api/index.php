<?php
declare(strict_types=1);
ini_set('display_errors','0');
require_once __DIR__.'/lib/bootstrap.php';
require_once __DIR__.'/lib/validation.php';
require_once __DIR__.'/lib/content.php';
require_once __DIR__.'/lib/accounts.php';
require_once __DIR__.'/lib/uploads.php';
require_once __DIR__.'/lib/contact.php';
try {
    config(); $route=$_GET['route'] ?? '';
    if (!is_string($route) || !preg_match('~^[a-zA-Z0-9._/-]{0,250}$~D',$route) || str_contains($route,'..')) fail(404,'ไม่พบ endpoint นี้');
    $parts=explode('/',trim($route,'/')); $method=strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    if ($method==='POST' && isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) $method=enum_value($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'],'method',['PUT','DELETE']);
    if (!in_array($method,['GET','POST','PUT','DELETE'],true)) fail(405,'ไม่รองรับคำขอนี้');
    if ($parts[0]==='admin') $actor=require_user();
    if ($method!=='GET') { require_https(); check_mutation(); }
    if ($route==='health' && $method==='GET') { query('SELECT 1'); json_response(['ok'=>true,'backend'=>'php']); }
    if ($parts[0]==='auth' && count($parts)===2) auth_route($parts[1],$method);
    if ($route==='contact' && $method==='POST') contact_route();
    if ($route==='admin/public-content' && $method==='POST') {
        $counts=[];
        foreach (['news','projects','site-references'] as $kind) $counts[$kind]=count(refresh_public_content($kind)['items']);
        json_response(['ok'=>true,'counts'=>$counts]);
    }
    if ($route==='visitors' && in_array($method,['GET','POST'],true)) {
        if ($method==='POST' && empty($_COOKIE['idie_visit'])) {
            rate_limit('visit:'.request_ip(),30,3600);
            query('INSERT INTO visitor_counter (id,total) VALUES (1,1) ON DUPLICATE KEY UPDATE total=total+1');
            setcookie('idie_visit','1',['expires'=>time()+86400,'path'=>'/','secure'=>is_https(),'httponly'=>true,'samesite'=>'Lax']);
        }
        json_response(['total'=>(int)query('SELECT total FROM visitor_counter WHERE id=1')->fetchColumn()]);
    }
    $admin=$parts[0]==='admin'; if ($admin) array_shift($parts);
    if ($admin && $parts[0]==='users') { array_shift($parts); users_route($parts,$method,$actor); }
    if ($admin && $parts===['uploads'] && $method==='POST') save_uploaded_image();
    if (in_array($parts[0],['news','projects','site-references'],true) && count($parts)<=2) content_route($parts[0],$parts[1] ?? null,$admin,$method);
    fail(404,'ไม่พบ endpoint นี้');
} catch (Throwable $e) { public_error($e); }
