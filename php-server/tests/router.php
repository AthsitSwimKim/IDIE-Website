<?php
$path=parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH);
if (str_starts_with($path,'/api/lib') || $path==='/web.config' || (str_starts_with($path,'/uploads/') && !preg_match('~^/uploads/(?:[a-f0-9]{32}(?:-small)?\.(?:png|jpg|webp)|content-cache/(?:news|projects|site-references|jobs)\.json)$~D',$path))) { http_response_code(404); exit; }
if (is_file('/app/httpdocs'.$path)) return false;
if (preg_match('~^/(?:api|uploads|assets|images|documents)(?:/|$)~',$path)) { http_response_code(404); exit; }
header('Content-Type: text/html; charset=utf-8'); readfile('/app/httpdocs/index.html');
