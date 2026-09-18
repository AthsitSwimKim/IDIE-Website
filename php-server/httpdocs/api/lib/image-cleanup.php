<?php
declare(strict_types=1);

// Serialize image-bearing writes across collections: a shared file must not
// disappear between another editor's file validation and database commit.
function content_image_lock() {
    $lock=fopen(private_root().'/content-images.lock','c');
    if (!$lock || !flock($lock,LOCK_EX)) fail(503,'ไม่สามารถตรวจไฟล์รูปได้ กรุณาลองอีกครั้ง');
    return $lock;
}
function managed_image_paths(array $values): array {
    $paths=[];
    foreach ($values as $value) {
        if (is_array($value)) { foreach (managed_image_paths($value) as $path) $paths[$path]=true; }
        elseif (is_string($value)) {
            preg_match_all('~/uploads/[a-f0-9]{32}(?:-small)?\.(?:webp|png|jpg)(?![a-zA-Z0-9_.-])~',$value,$matches);
            foreach ($matches[0] as $path) $paths[$path]=true;
        }
    }
    return array_keys($paths);
}
function old_content_images(string $kind,int $id,array $row): array {
    if ($kind==='jobs') return [];
    $values=[$row];
    if ($kind==='projects') $values[]=query('SELECT src,src_set FROM project_images WHERE project_id=?',[$id])->fetchAll();
    return managed_image_paths($values);
}
function cleanup_content_images(array $oldPaths): void {
    if (!$oldPaths) return;
    try {
        // No status filter: drafts, scheduled posts and closed records still own images.
        $rows=query('SELECT cover_src,cover_src_set,body_th,body_en FROM news')->fetchAll();
        $rows[]=query('SELECT cover_src,cover_src_set,overview_th,overview_en,engineering_solution_th,engineering_solution_en FROM projects')->fetchAll();
        $rows[]=query('SELECT src,src_set FROM project_images')->fetchAll();
        $rows[]=query('SELECT image_src,image_src_set FROM site_references')->fetchAll();
        $used=array_fill_keys(managed_image_paths($rows),true);
        $candidates=[];
        foreach ($oldPaths as $path) {
            // Strictly allow server-generated names in the upload root only.
            if (!preg_match('~^/uploads/([a-f0-9]{32})(?:-small)?\.(webp|png|jpg)$~D',$path,$m)) continue;
            foreach (['','-small'] as $suffix) $candidates['/uploads/'.$m[1].$suffix.'.'.$m[2]]=true;
        }
        $directory=realpath(web_root().'/uploads');
        if ($directory===false) return;
        foreach (array_keys($candidates) as $path) {
            if (isset($used[$path])) continue;
            $file=web_root().$path;
            $resolved=realpath($file);
            // Never follow symlinks, delete directories, static media or private files.
            if (is_link($file) || $resolved===false || dirname($resolved)!==$directory || !is_file($file)) continue;
            if (!@unlink($file)) error_log('IDIE: unused upload could not be removed');
        }
    } catch (Throwable $error) {
        // An uncertain reference check must preserve files; content is already committed.
        error_log('IDIE: unused upload cleanup deferred');
    }
}
