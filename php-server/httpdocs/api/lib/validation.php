<?php
declare(strict_types=1);
function text_value($value, string $field, int $max, bool $required=true): string {
    if (!is_string($value)) fail(400,'ข้อมูลไม่ครบหรือไม่ถูกต้อง',[$field=>'กรอกข้อมูลให้ถูกต้อง']);
    $value=trim($value);
    if (($required && $value==='') || mb_strlen($value,'UTF-8')>$max) fail(400,'ข้อมูลไม่ครบหรือไม่ถูกต้อง',[$field=>'กรอกข้อมูลให้ครบและไม่เกิน '.$max.' ตัวอักษร']);
    return $value;
}
function localized($value, string $field, int $max): array {
    if (!is_array($value)) fail(400,'กรอกข้อมูลให้ครบทั้งสองภาษา',[$field=>'กรอกภาษาไทยและภาษาอังกฤษ']);
    return ['th'=>text_value($value['th'] ?? null,$field.'.th',$max),'en'=>text_value($value['en'] ?? null,$field.'.en',$max)];
}
function enum_value($value,string $field,array $allowed): string { if (!is_string($value) || !in_array($value,$allowed,true)) fail(400,'ข้อมูลไม่ถูกต้อง',[$field=>'เลือกค่าที่ถูกต้อง']); return $value; }
function int_value($v,string $field,int $min,int $max): int { if (!is_int($v) || $v<$min || $v>$max) fail(400,'ข้อมูลไม่ถูกต้อง',[$field=>'ระบุตัวเลขในช่วง '.$min.'–'.$max]); return $v; }
function upload_path($v,string $field): string {
    $p=text_value($v,$field,300);
    if (!preg_match('~^/uploads/[a-f0-9]{32}(?:-small)?\.(?:webp|png|jpg)$~D',$p) || !is_file(web_root().$p)) fail(400,'ที่อยู่รูปต้องเป็นไฟล์ที่อัปโหลดผ่านระบบเท่านั้น',[$field=>'อัปโหลดรูปใหม่ผ่านระบบ']);
    return $p;
}
function image_value($v,string $field): ?array {
    if ($v===null) return null;
    if (!is_array($v)) fail(400,'ข้อมูลรูปไม่ถูกต้อง');
    $out=['src'=>upload_path($v['src'] ?? null,$field.'.src'),'alt'=>localized($v['alt'] ?? null,$field.'.alt',300)];
    if (!empty($v['srcSet'])) {
        $set=text_value($v['srcSet'],$field.'.srcSet',600); $parts=explode(',',$set);
        foreach ($parts as $part) { if (!preg_match('~^\s*(/uploads/\S+)\s+([1-9][0-9]{0,4})w\s*$~D',$part,$match)) fail(400,'srcSet ไม่ถูกต้อง'); upload_path($match[1],$field.'.srcSet'); }
        $out['srcSet']=$set;
    }
    foreach (['width','height'] as $key) if (isset($v[$key])) $out[$key]=int_value($v[$key],$field.'.'.$key,1,20000);
    return $out;
}
function password_value($v,string $field='password'): string {
    if (!is_string($v) || mb_strlen($v,'UTF-8')<12 || strlen($v)>72 || str_contains($v,chr(0))) fail(400,'รหัสผ่านต้องยาวอย่างน้อย 12 ตัวอักษร และไม่เกิน 72 bytes',[$field=>'ใช้รหัสผ่านอย่างน้อย 12 ตัวอักษร (ภาษาอังกฤษได้สูงสุด 72 ตัว)']);
    return $v;
}
function username_value($v): string { $v=text_value($v,'username',64); if (!preg_match('/^[a-z0-9._-]{3,64}$/D',$v)) fail(400,'ชื่อผู้ใช้ใช้ a-z 0-9 จุด ขีดล่าง ขีดกลาง ยาว 3–64 ตัว'); return $v; }
function content_values(string $kind,array $data): array {
    $values=[];
    $fields=$kind==='news' ? ['title'=>300,'excerpt'=>1000,'body'=>60000] : ($kind==='site-references' ? ['name'=>300,'customer'=>300,'location'=>300] : ['name'=>300,'client'=>300,'location'=>300,'overview'=>5000,'engineeringSolution'=>5000]);
    foreach ($fields as $field=>$max) { $pair=localized($data[$field] ?? null,$field,$max); $column=$field==='engineeringSolution'?'engineering_solution':$field; $values[$column.'_th']=$pair['th']; $values[$column.'_en']=$pair['en']; }
    $values['status']=enum_value($data['status'] ?? null,'status',['draft','published']);
    if ($kind==='site-references') $values['position']=int_value($data['position'] ?? null,'position',0,9999);
    else {
        $slug=text_value($data['slug'] ?? null,'slug',160); if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/D',$slug)) fail(400,'slug ใช้ a-z, 0-9 และขีดกลางเท่านั้น'); $values['slug']=$slug;
        if (!isset($data['featured']) || !is_bool($data['featured'])) fail(400,'featured ไม่ถูกต้อง'); $values['featured']=$data['featured']?1:0;
        if ($kind==='news') {
            $values['category']=enum_value($data['category'] ?? null,'category',['company','project','product','article','event']);
            $date=text_value($data['publishedAt'] ?? null,'publishedAt',40);
            if (!preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?$/D',$date)) fail(400,'รูปแบบวันที่ไม่ถูกต้อง');
            try { $dt=new DateTimeImmutable($date,new DateTimeZone('UTC')); $errors=DateTimeImmutable::getLastErrors(); if ($errors && ($errors['warning_count'] || $errors['error_count'])) fail(400,'วันที่ไม่ถูกต้อง'); $values['published_at']=$dt->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s'); } catch (Exception $e) { fail(400,'วันที่ไม่ถูกต้อง'); }
        } else {
            $values['industry']=enum_value($data['industry'] ?? null,'industry',['petrochemical','oil-gas','chemical','power-plant','fertilizer','mining','epc','manufacturing']);
            if (!array_key_exists('year',$data)) fail(400,'ข้อมูลปีไม่ถูกต้อง'); $values['year']=$data['year']===null ? null : int_value($data['year'],'year',1900,2200);
        }
    }
    $imageKey=$kind==='site-references'?'image':'cover';
    if (!array_key_exists($imageKey,$data)) fail(400,'ข้อมูลรูปไม่ครบ');
    $image=image_value($data[$imageKey],$imageKey);
    foreach (['src','src_set','alt_th','alt_en','width','height'] as $key) $values[$imageKey.'_'.$key]=match($key) {'src'=>$image['src'] ?? null,'src_set'=>$image['srcSet'] ?? null,'alt_th'=>$image['alt']['th'] ?? null,'alt_en'=>$image['alt']['en'] ?? null,default=>$image[$key] ?? null};
    return $values;
}
