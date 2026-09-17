<?php
declare(strict_types=1);
require_once __DIR__.'/content-cache.php';
function pair(array $r,string $key): array { return ['th'=>$r[$key.'_th'],'en'=>$r[$key.'_en']]; }
function row_image(array $r,string $prefix): ?array {
    if (empty($r[$prefix.'src'])) return null;
    $image=['src'=>$r[$prefix.'src'],'alt'=>['th'=>$r[$prefix.'alt_th'] ?? '', 'en'=>$r[$prefix.'alt_en'] ?? '']];
    if (!empty($r[$prefix.'src_set'])) $image['srcSet']=$r[$prefix.'src_set'];
    foreach (['width','height'] as $key) if (!empty($r[$prefix.$key])) $image[$key]=(int)$r[$prefix.$key];
    return $image;
}
function map_content(string $kind,array $r,bool $admin,?array $children=null): array {
    if ($kind==='news') $out=['slug'=>$r['slug'],'title'=>pair($r,'title'),'excerpt'=>pair($r,'excerpt'),'body'=>pair($r,'body'),'category'=>$r['category'],'publishedAt'=>(new DateTimeImmutable($r['published_at'],new DateTimeZone('UTC')))->format('Y-m-d\TH:i:s.000\Z'),'featured'=>(bool)$r['featured']];
    elseif ($kind==='site-references') $out=['id'=>(int)$r['id'],'name'=>pair($r,'name'),'customer'=>pair($r,'customer'),'location'=>pair($r,'location'),'image'=>row_image($r,'image_')];
    else {
        $out=['slug'=>$r['slug'],'name'=>pair($r,'name'),'client'=>pair($r,'client'),'location'=>pair($r,'location'),'industry'=>$r['industry'],'year'=>$r['year']===null?null:(int)$r['year'],'overview'=>pair($r,'overview'),'engineeringSolution'=>pair($r,'engineering_solution'),'featured'=>(bool)$r['featured']];
        $scope=$children===null?query('SELECT text_th,text_en FROM project_scope_items WHERE project_id=? ORDER BY position',[$r['id']])->fetchAll():($children['scope'][$r['id']] ?? []);
        $gallery=$children===null?query('SELECT * FROM project_images WHERE project_id=? ORDER BY position',[$r['id']])->fetchAll():($children['gallery'][$r['id']] ?? []);
        $out['scopeOfWork']=array_map(fn($s)=>pair($s,'text'),$scope);
        $out['gallery']=array_map(fn($i)=>row_image($i,''),$gallery);
    }
    if ($kind!=='site-references') $out['cover']=row_image($r,'cover_') ?? ($admin?null:['src'=>'/images/placeholder.svg','alt'=>['th'=>'ยังไม่มีภาพปก','en'=>'No cover image yet']]);
    if ($admin) { $out['id']=(int)$r['id']; $out['status']=$r['status']; if ($kind==='site-references') $out['position']=(int)$r['position']; }
    return $out;
}
function map_content_rows(string $kind,array $rows,bool $admin): array {
    $children=null;
    if ($kind==='projects' && $rows) {
        $children=['scope'=>[],'gallery'=>[]];
        $ids=array_column($rows,'id'); $holders=implode(',',array_fill(0,count($ids),'?'));
        foreach (query("SELECT project_id,text_th,text_en FROM project_scope_items WHERE project_id IN ($holders) ORDER BY project_id,position",$ids)->fetchAll() as $child) $children['scope'][$child['project_id']][]=$child;
        foreach (query("SELECT * FROM project_images WHERE project_id IN ($holders) ORDER BY project_id,position",$ids)->fetchAll() as $child) $children['gallery'][$child['project_id']][]=$child;
    }
    return array_map(fn($r)=>map_content($kind,$r,$admin,$children),$rows);
}
function replace_project_children(int $id,array $data): void {
    $scope=$data['scopeOfWork'] ?? null; $gallery=$data['gallery'] ?? null;
    if (!is_array($scope) || !array_is_list_compat($scope) || count($scope)>30 || !is_array($gallery) || !array_is_list_compat($gallery) || count($gallery)>20) fail(400,'ขอบเขตงานหรือแกลเลอรีไม่ถูกต้อง');
    query('DELETE FROM project_scope_items WHERE project_id=?',[$id]); query('DELETE FROM project_images WHERE project_id=?',[$id]);
    foreach ($scope as $position=>$v) { $v=localized($v,'scopeOfWork.'.$position,500); query('INSERT INTO project_scope_items (project_id,position,text_th,text_en) VALUES (?,?,?,?)',[$id,$position,$v['th'],$v['en']]); }
    foreach ($gallery as $position=>$v) {
        $v=image_value($v,'gallery.'.$position); if ($v===null) fail(400,'ข้อมูลรูปแกลเลอรีไม่ถูกต้อง');
        query('INSERT INTO project_images (project_id,position,src,src_set,alt_th,alt_en,width,height) VALUES (?,?,?,?,?,?,?,?)',[$id,$position,$v['src'],$v['srcSet'] ?? null,$v['alt']['th'],$v['alt']['en'],$v['width'] ?? null,$v['height'] ?? null]);
    }
}
function array_is_list_compat(array $a): bool { return $a===[] || array_keys($a)===range(0,count($a)-1); }
function content_route(string $kind,?string $rawId,bool $admin,string $method): void {
    $table=['news'=>'news','projects'=>'projects','site-references'=>'site_references'][$kind];
    $order=$kind==='news'?'published_at DESC,id DESC':($kind==='projects'?'year DESC,id DESC':'position,id');
    $id=null;
    if ($admin && $rawId!==null) { if (!ctype_digit($rawId) || (int)$rawId<1) fail(400,'รหัสรายการไม่ถูกต้อง'); $id=(int)$rawId; }
    if ($method==='GET') {
        if (!$admin && $rawId===null) { $snapshot=refresh_public_content($kind); json_response($snapshot['items']); }
        $where=$admin?'1=1':"status='published'"; $params=[];
        if (!$admin && $kind==='news') $where.=' AND published_at <= UTC_TIMESTAMP()';
        if ($rawId!==null) { $where.=$admin?' AND id=?':($kind==='site-references'?' AND id=?':' AND slug=?'); $params[]=$admin?$id:$rawId; }
        $rows=query("SELECT * FROM $table WHERE $where ORDER BY $order",$params)->fetchAll();
        if ($rawId!==null) { if (!$rows) fail(404,'ไม่พบรายการนี้'); json_response(map_content($kind,$rows[0],$admin)); }
        json_response(map_content_rows($kind,$rows,$admin));
    }
    if (!$admin) fail(405,'ไม่รองรับคำขอนี้');
    if ($method==='DELETE' && $id!==null) {
        $cacheLock=public_content_lock($kind); $temp=null; $pdo=db(); $pdo->beginTransaction();
        try {
            $s=query("DELETE FROM $table WHERE id=?",[$id]); if (!$s->rowCount()) fail(404,'ไม่พบรายการนี้');
            [$temp,$snapshot]=prepare_public_content($kind);
            invalidate_public_content($kind); $pdo->commit();
            install_public_content($kind,$temp); $temp=null;
        } catch (Throwable $e) { if ($pdo->inTransaction()) $pdo->rollBack(); throw $e; }
        finally { if ($temp && is_file($temp)) @unlink($temp); flock($cacheLock,LOCK_UN); fclose($cacheLock); }
        json_response(['ok'=>true]);
    }
    if (($method==='POST' && $id===null) || ($method==='PUT' && $id!==null)) {
        $data=json_input(); $values=content_values($kind,$data); $cacheLock=public_content_lock($kind); $temp=null; $pdo=db(); $pdo->beginTransaction();
        try {
            if ($id===null) {
                $columns=implode(',',array_keys($values)); $holders=implode(',',array_fill(0,count($values),'?'));
                query("INSERT INTO $table ($columns) VALUES ($holders)",array_values($values)); $id=(int)$pdo->lastInsertId();
            } else {
                if (!query("SELECT id FROM $table WHERE id=? FOR UPDATE",[$id])->fetch()) fail(404,'ไม่พบรายการนี้');
                $set=implode(',',array_map(fn($col)=>"$col=?",array_keys($values)));
                query("UPDATE $table SET $set WHERE id=?",array_merge(array_values($values),[$id]));
            }
            if ($kind==='projects') replace_project_children($id,$data);
            [$temp,$snapshot]=prepare_public_content($kind);
            invalidate_public_content($kind); $pdo->commit();
            install_public_content($kind,$temp); $temp=null;
        } catch (Throwable $e) { if ($pdo->inTransaction()) $pdo->rollBack(); throw $e; }
        finally { if ($temp && is_file($temp)) @unlink($temp); flock($cacheLock,LOCK_UN); fclose($cacheLock); }
        json_response($method==='POST'?['id'=>$id]:['ok'=>true],$method==='POST'?201:200);
    }
    fail(405,'ไม่รองรับคำขอนี้');
}
