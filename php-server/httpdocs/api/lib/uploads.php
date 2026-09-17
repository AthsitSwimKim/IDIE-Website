<?php
declare(strict_types=1);
require_once __DIR__.'/png.php';
function save_uploaded_image(): void {
    $file=$_FILES['file'] ?? null;
    if (!$file || !is_array($file) || is_array($file['error'] ?? null)) fail(400,'ไม่พบไฟล์ที่อัปโหลด');
    if (in_array($file['error'],[UPLOAD_ERR_INI_SIZE,UPLOAD_ERR_FORM_SIZE],true)) fail(413,'รูปใหญ่เกินเพดานของโฮสต์ กรุณาย่อรูปก่อนอัปโหลด');
    if ($file['error']!==UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) fail(400,'อัปโหลดไฟล์ไม่สำเร็จ');
    if ($file['size']>3000000) fail(413,'รูปต้องมีขนาดไม่เกิน 3 MB กรุณาย่อรูปก่อนอัปโหลด');
    if (!extension_loaded('gd') || !extension_loaded('fileinfo')) {
        $png=normalize_uploaded_png(file_get_contents($file['tmp_name']));
        $dir=web_root().'/uploads';
        if (!is_dir($dir) || !is_writable($dir) || !is_file($dir.'/web.config')) fail(503,'โฟลเดอร์ uploads ยังไม่พร้อม กรุณาตรวจสิทธิ์และไฟล์ป้องกันการรันสคริปต์');
        $name=bin2hex(random_bytes(16)).'.png'; $path=$dir.'/'.$name;
        if (file_put_contents($path,$png['bytes'],LOCK_EX)!==strlen($png['bytes'])) { if (is_file($path)) unlink($path); fail(503,'บันทึกรูปไม่สำเร็จ'); }
        json_response(['src'=>'/uploads/'.$name,'width'=>$png['width'],'height'=>$png['height']],201);
    }
    $mime=(new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    if (!in_array($mime,['image/jpeg','image/png','image/webp'],true)) fail(400,'รองรับรูป JPEG, PNG และ WebP เท่านั้น');
    $info=@getimagesize($file['tmp_name']);
    if (!$info || $info[0]<1 || $info[1]<1 || $info[0]>10000 || $info[1]>10000 || $info[0]*$info[1]>16000000) fail(400,'รูปมีความละเอียดสูงเกินไป กรุณาย่อรูปก่อนอัปโหลด');
    $image=@imagecreatefromstring(file_get_contents($file['tmp_name'])); if (!$image) fail(400,'อ่านไฟล์รูปไม่ได้');
    $dir=web_root().'/uploads';
    if (!is_dir($dir) && !mkdir($dir,0755,true) && !is_dir($dir)) fail(503,'โฟลเดอร์ uploads ยังไม่พร้อม กรุณาตรวจสิทธิ์เขียนโฟลเดอร์');
    if (!is_file($dir.'/web.config')) fail(503,'ยังไม่ได้ติดตั้งไฟล์ป้องกันการรันสคริปต์ใน uploads');
    $id=bin2hex(random_bytes(16)); $webp=function_exists('imagewebp'); $extension=$webp?'webp':($mime==='image/png'?'png':'jpg'); $paths=[]; $sizes=[];
    try {
        foreach ([1400,700] as $index=>$max) {
            $scale=min(1,$max/max($info[0],$info[1])); $w=max(1,(int)round($info[0]*$scale)); $h=max(1,(int)round($info[1]*$scale));
            $target=imagecreatetruecolor($w,$h); imagealphablending($target,false); imagesavealpha($target,true); imagefill($target,0,0,imagecolorallocatealpha($target,0,0,0,127));
            imagecopyresampled($target,$image,0,0,0,0,$w,$h,$info[0],$info[1]);
            $name=$id.($index===1?'-small':'').'.'.$extension; $path=$dir.'/'.$name;
            $ok=$webp?imagewebp($target,$path,80):($extension==='png'?imagepng($target,$path,8):imagejpeg($target,$path,80));
            imagedestroy($target); if (!$ok || !is_file($path) || filesize($path)===0) fail(503,'บันทึกรูปไม่สำเร็จ');
            $paths[]='/uploads/'.$name; $sizes[]=['width'=>$w,'height'=>$h];
        }
    } catch (Throwable $e) { foreach ($paths as $path) if (is_file(web_root().$path)) unlink(web_root().$path); throw $e; }
    finally { imagedestroy($image); }
    $out=['src'=>$paths[0],'width'=>$sizes[0]['width'],'height'=>$sizes[0]['height']];
    if ($sizes[1]['width']!==$sizes[0]['width']) $out['srcSet']=$paths[1].' '.$sizes[1]['width'].'w, '.$paths[0].' '.$sizes[0]['width'].'w';
    json_response($out,201);
}
