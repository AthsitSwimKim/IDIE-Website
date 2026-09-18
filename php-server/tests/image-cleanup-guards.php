<?php
declare(strict_types=1);
if (PHP_SAPI!=='cli') { http_response_code(404); exit; }
require '/app/httpdocs/api/lib/image-cleanup.php';
$root=sys_get_temp_dir().'/idie-cleanup-guards-'.bin2hex(random_bytes(8));
mkdir($root.'/uploads',0700,true); mkdir($root.'/private',0700,true);
function web_root(): string { global $root; return $root; }
function query(string $sql) { global $broken,$references; if ($broken) throw new RuntimeException('test database error'); return new class { function fetchAll(): array { global $references; return $references; } }; }
function check_guard(string $name,bool $ok): void { if (!$ok) throw new RuntimeException($name); echo 'PASS '.$name.PHP_EOL; }
$broken=false;$references=[];
$id=str_repeat('a',32);$managed='/uploads/'.$id.'.png';
file_put_contents($root.'/uploads/static.png','static');
file_put_contents($root.'/private/secret.png','private');
file_put_contents($root.'/uploads/'.$id.'.png','managed');
file_put_contents($root.'/uploads/'.$id.'-small.png','small');
$other=str_repeat('b',32);
symlink($root.'/private/secret.png',$root.'/uploads/'.$other.'.png');
try {
    cleanup_content_images(['/uploads/static.png','/uploads/../private/secret.png','/uploads/'.$other.'.png','https://evil.example/uploads/'.$id.'.png']);
    check_guard('Static images protected',is_file($root.'/uploads/static.png'));
    check_guard('Traversal and symlink target protected',is_file($root.'/private/secret.png') && is_link($root.'/uploads/'.$other.'.png'));
    check_guard('External URLs cannot delete a local file',is_file($root.$managed));
    $broken=true;cleanup_content_images([$managed]);
    check_guard('Failed reference query preserves both files',is_file($root.$managed) && is_file($root.'/uploads/'.$id.'-small.png'));
    $broken=false;$references=[['cover_src'=>$managed]];
    cleanup_content_images([$managed]);
    check_guard('Referenced original protected',is_file($root.$managed));
    check_guard('Unused thumbnail removed',!is_file($root.'/uploads/'.$id.'-small.png'));
    $references=[];cleanup_content_images([$managed]);
    check_guard('Unreferenced managed original removed',!is_file($root.$managed));
    cleanup_content_images([$managed]);
    check_guard('Missing files are harmless',!is_file($root.$managed));
} finally {
    foreach (glob($root.'/uploads/*') as $file) unlink($file);
    unlink($root.'/private/secret.png');rmdir($root.'/uploads');rmdir($root.'/private');rmdir($root);
}
