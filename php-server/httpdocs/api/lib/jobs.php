<?php
declare(strict_types=1);

function job_values(array $data): array {
    $values=[];
    foreach (['title','department','location'] as $field) {
        $v=localized($data[$field] ?? null,$field,300);
        $values[$field.'_th']=$v['th']; $values[$field.'_en']=$v['en'];
    }
    $slug=text_value($data['slug'] ?? null,'slug',160);
    if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/D',$slug)) fail(400,'slug ใช้ a-z, 0-9 และขีดกลางเท่านั้น');
    $values['slug']=$slug;
    $values['employment_type']=enum_value($data['employmentType'] ?? null,'employmentType',['full-time','part-time','contract','internship']);
    $values['positions']=int_value($data['positions'] ?? null,'positions',0,9999);
    $values['position']=int_value($data['position'] ?? null,'position',0,9999);
    $values['status']=enum_value($data['status'] ?? null,'status',['draft','published']);
    if (!isset($data['isOpen']) || !is_bool($data['isOpen'])) fail(400,'สถานะเปิดรับสมัครไม่ถูกต้อง');
    $values['is_open']=$data['isOpen']?1:0;
    $date=text_value($data['postedAt'] ?? null,'postedAt',10);
    if (!preg_match('/^(\d{4})-(\d{2})-(\d{2})$/D',$date,$m) || !checkdate((int)$m[2],(int)$m[3],(int)$m[1]) || (int)$m[1]<1900 || (int)$m[1]>2200) fail(400,'วันที่ประกาศไม่ถูกต้อง',['postedAt'=>'ระบุวันที่ในช่วงปี 1900–2200']);
    $values['posted_at']=$date;
    foreach (['responsibilities','qualifications'] as $field) {
        $list=$data[$field] ?? null;
        if (!is_array($list) || !array_is_list_compat($list) || count($list)<1 || count($list)>30) fail(400,'กรอกรายการหน้าที่และคุณสมบัติอย่างละ 1–30 ข้อ',[$field=>'กรอกอย่างน้อย 1 ข้อ และไม่เกิน 30 ข้อ']);
        $items=[];
        foreach ($list as $i=>$v) $items[]=localized($v,$field.'.'.$i,2000);
        $values[$field]=json_encode($items,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
    }
    return $values;
}
function map_job(array $r,bool $admin): array {
    $out=['slug'=>$r['slug'],'title'=>pair($r,'title'),'department'=>pair($r,'department'),'location'=>pair($r,'location'),'employmentType'=>$r['employment_type'],'positions'=>(int)$r['positions'],'postedAt'=>$r['posted_at'],'isOpen'=>(bool)$r['is_open']];
    foreach (['responsibilities','qualifications'] as $field) $out[$field]=json_decode($r[$field],true,512,JSON_THROW_ON_ERROR);
    if ($admin) { $out['id']=(int)$r['id']; $out['status']=$r['status']; $out['position']=(int)$r['position']; }
    return $out;
}
function jobs_initialized(): bool {
    return (bool)query("SELECT 1 FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name='job_openings'")->fetchColumn()
        && (bool)query("SELECT 1 FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name='schema_migrations'")->fetchColumn()
        && (bool)query("SELECT 1 FROM schema_migrations WHERE name='jobs-initial-import-v1'")->fetchColumn();
}
function ensure_jobs(): void {
    if (jobs_initialized()) return;
    // Only invoked by the authenticated, CSRF-protected publish action. DDL must precede the transaction.
    query("CREATE TABLE IF NOT EXISTS job_openings (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(160) NOT NULL UNIQUE,
        title_th VARCHAR(300) NOT NULL,title_en VARCHAR(300) NOT NULL,
        department_th VARCHAR(300) NOT NULL,department_en VARCHAR(300) NOT NULL,
        location_th VARCHAR(300) NOT NULL,location_en VARCHAR(300) NOT NULL,
        employment_type VARCHAR(20) NOT NULL,positions SMALLINT UNSIGNED NOT NULL DEFAULT 0,
        position SMALLINT UNSIGNED NOT NULL DEFAULT 0,status VARCHAR(20) NOT NULL DEFAULT 'draft',
        is_open TINYINT UNSIGNED NOT NULL DEFAULT 1,posted_at DATE NOT NULL,
        responsibilities LONGTEXT NOT NULL,qualifications LONGTEXT NOT NULL,
        INDEX public_jobs (status,is_open,position,id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    query("CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(100) NOT NULL PRIMARY KEY,applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $seeds=json_decode(file_get_contents(__DIR__.'/jobs.seed.json'),true,512,JSON_THROW_ON_ERROR);
    if (!is_array($seeds) || count($seeds)!==2) throw new RuntimeException('Invalid initial job import');
    $pdo=db(); $pdo->beginTransaction();
    try {
        // The unique marker serializes concurrent initializations and prevents re-import after deleting all jobs.
        $first=query("INSERT IGNORE INTO schema_migrations (name) VALUES ('jobs-initial-import-v1')")->rowCount();
        if ($first && (int)query('SELECT COUNT(*) FROM job_openings')->fetchColumn()===0) {
            foreach ($seeds as $i=>$seed) {
                $values=job_values(array_merge($seed,['status'=>'published','position'=>$i]));
                $columns=implode(',',array_keys($values)); $holders=implode(',',array_fill(0,count($values),'?'));
                query("INSERT INTO job_openings ($columns) VALUES ($holders)",array_values($values));
            }
        }
        $pdo->commit();
    } catch (Throwable $e) { if ($pdo->inTransaction()) $pdo->rollBack(); throw $e; }
}
