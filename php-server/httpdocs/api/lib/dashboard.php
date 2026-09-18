<?php
declare(strict_types=1);

function dashboard_route(): void {
    $pdo=db(); $pdo->beginTransaction();
    try {
        // Summaries do not load article bodies, images, project galleries or scope items.
        $rows=query("SELECT 'news' AS collection,COUNT(CASE WHEN status='published' THEN 1 END) AS published,COUNT(CASE WHEN status='draft' THEN 1 END) AS draft FROM news
            UNION ALL SELECT 'projects',COUNT(CASE WHEN status='published' THEN 1 END),COUNT(CASE WHEN status='draft' THEN 1 END) FROM projects
            UNION ALL SELECT 'site-references',COUNT(CASE WHEN status='published' THEN 1 END),COUNT(CASE WHEN status='draft' THEN 1 END) FROM site_references")->fetchAll();
        $stats=[];
        foreach ($rows as $row) $stats[$row['collection']]=['published'=>(int)$row['published'],'draft'=>(int)$row['draft']];
        $draftRows=query("SELECT 'news' AS collection,id,title_th AS title FROM news WHERE status='draft'
            UNION ALL SELECT 'projects',id,name_th FROM projects WHERE status='draft'
            UNION ALL SELECT 'site-references',id,name_th FROM site_references WHERE status='draft'
            ORDER BY collection,id")->fetchAll();
        $labels=['news'=>'ข่าวสาร','projects'=>'ผลงาน','site-references'=>'อ้างอิงหน้างาน'];
        $drafts=array_map(fn($r)=>['key'=>$r['collection'].'-'.$r['id'],'kind'=>$labels[$r['collection']],'title'=>$r['title'],'to'=>'/admin/'.$r['collection'].'/'.$r['id']],$draftRows);
        $recent=query('SELECT id,title_th,published_at FROM news ORDER BY published_at DESC,id DESC LIMIT 5')->fetchAll();
        $recent=array_map(fn($r)=>['id'=>(int)$r['id'],'title'=>$r['title_th'],'publishedAt'=>(new DateTimeImmutable($r['published_at'],new DateTimeZone('UTC')))->format('Y-m-d\TH:i:s.000\Z')],$recent);
        $visitors=null;
        try { $visitors=(int)query('SELECT total FROM visitor_counter WHERE id=1')->fetchColumn(); }
        catch (PDOException $e) { /* Optional counter must not prevent reading content summaries. */ }
        $pdo->commit();
    } catch (Throwable $e) { if ($pdo->inTransaction()) $pdo->rollBack(); throw $e; }
    json_response(['stats'=>$stats,'drafts'=>$drafts,'recentNews'=>$recent,'visitors'=>$visitors]);
}
