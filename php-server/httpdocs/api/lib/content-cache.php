<?php
declare(strict_types=1);

function public_content_kind(string $kind): string {
    if (!in_array($kind,['news','projects','site-references','jobs'],true)) fail(404,'ไม่พบรายการข้อมูลนี้');
    return $kind;
}
function public_content_directory(): string {
    $dir=web_root().'/uploads/content-cache';
    if (!is_dir($dir) || !is_file($dir.'/web.config') || !is_writable($dir)) {
        fail(503,'กรุณาอัปโหลด uploads/content-cache/web.config และให้เว็บไซต์เขียนโฟลเดอร์ uploads/content-cache ได้');
    }
    return $dir;
}
function public_content_lock(string $kind) {
    public_content_kind($kind); public_content_directory();
    $lock=fopen(private_root().'/public-content-'.$kind.'.lock','c');
    if (!$lock || !flock($lock,LOCK_EX)) fail(503,'ไม่สามารถอัปเดตข้อมูลหน้าเว็บไซต์ได้ กรุณาลองอีกครั้ง');
    return $lock;
}
function invalidate_public_content(string $kind): void {
    $path=public_content_directory().'/'.public_content_kind($kind).'.json';
    if (is_file($path) && !unlink($path)) fail(503,'ไม่สามารถอัปเดตข้อมูลหน้าเว็บไซต์ได้ กรุณาตรวจสิทธิ์โฟลเดอร์ uploads/content-cache');
}
function public_content_snapshot(string $kind): array {
    $kind=public_content_kind($kind);
    $table=['news'=>'news','projects'=>'projects','site-references'=>'site_references','jobs'=>'job_openings'][$kind];
    $order=$kind==='news'?'published_at DESC,id DESC':($kind==='projects'?'year DESC,id DESC':'position,id');
    $where="status='published'";
    if ($kind==='jobs') $where.=' AND is_open=1';
    $params=[]; $now=null;
    if ($kind==='news') {
        $now=query('SELECT UTC_TIMESTAMP()')->fetchColumn();
        $where.=' AND published_at <= ?'; $params=[$now];
    }
    $rows=query("SELECT * FROM $table WHERE $where ORDER BY $order",$params)->fetchAll();
    $items=map_content_rows($kind,$rows,false);
    $expires=null;
    if ($kind==='news') {
        $next=query("SELECT MIN(published_at) FROM news WHERE status='published' AND published_at > ?",[$now])->fetchColumn();
        if ($next) $expires=(new DateTimeImmutable($next,new DateTimeZone('UTC')))->format('c');
    }
    return ['version'=>1,'kind'=>$kind,'generatedAt'=>gmdate('c'),'expiresAt'=>$expires,'items'=>$items];
}
function prepare_public_content(string $kind): array {
    $snapshot=public_content_snapshot($kind);
    $encoded=json_encode($snapshot,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR);
    $temp=tempnam(public_content_directory(),'pending-');
    if (!$temp) fail(503,'ไม่สามารถเตรียมข้อมูลหน้าเว็บไซต์ได้');
    if (file_put_contents($temp,$encoded,LOCK_EX)!==strlen($encoded)) {
        @unlink($temp); fail(503,'ไม่สามารถบันทึกข้อมูลหน้าเว็บไซต์ได้');
    }
    return [$temp,$snapshot];
}
function install_public_content(string $kind,string $temp): void {
    $path=public_content_directory().'/'.public_content_kind($kind).'.json';
    // IIS only serves .json here; incomplete pending files cannot be downloaded.
    invalidate_public_content($kind);
    if (!rename($temp,$path)) {
        @unlink($temp);
        fail(503,'บันทึกฐานข้อมูลแล้ว แต่ยังอัปเดตหน้าเว็บไซต์ไม่ได้ กรุณากดอัปเดตข้อมูลหน้าเว็บไซต์อีกครั้ง');
    }
}
function refresh_public_content(string $kind): array {
    $lock=public_content_lock($kind); $temp=null;
    try {
        [$temp,$snapshot]=prepare_public_content($kind);
        install_public_content($kind,$temp); $temp=null;
        return $snapshot;
    } finally {
        if ($temp && is_file($temp)) @unlink($temp);
        flock($lock,LOCK_UN); fclose($lock);
    }
}
