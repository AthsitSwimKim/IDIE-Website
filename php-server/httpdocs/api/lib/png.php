<?php
declare(strict_types=1);

function portable_png_available(): bool {
    return function_exists('gzcompress') && function_exists('gzuncompress');
}
function png_chunk(string $type, string $data): string {
    return pack('N',strlen($data)).$type.$data.pack('N',crc32($type.$data));
}
/** Validate pixel-stream structure and rebuild a static PNG without metadata or trailing data. */
function normalize_uploaded_png(string $bytes): array {
    if (!portable_png_available()) fail(503,'โฮสต์ยังไม่รองรับการจัดการรูป PNG');
    if (substr($bytes,0,8)!=="\x89PNG\r\n\x1a\n") fail(400,'กรุณาอัปโหลดรูปผ่านปุ่มเลือกรูปของเว็บไซต์');
    $length=strlen($bytes); $offset=8; $header=null; $compressed=''; $seenData=false; $endedData=false; $ended=false;
    while ($offset<$length) {
        if ($length-$offset<12) fail(400,'ไฟล์ PNG ไม่สมบูรณ์');
        $size=unpack('N',substr($bytes,$offset,4))[1];
        if ($size>$length-$offset-12) fail(400,'ไฟล์ PNG ไม่สมบูรณ์');
        $type=substr($bytes,$offset+4,4); $data=substr($bytes,$offset+8,$size);
        if (!preg_match('/^[A-Za-z]{4}$/D',$type) || substr($bytes,$offset+8+$size,4)!==pack('N',crc32($type.$data))) fail(400,'ไฟล์ PNG เสียหาย');
        if ($header===null && $type!=='IHDR') fail(400,'ไฟล์ PNG ไม่สมบูรณ์');
        if ($seenData && $type!=='IDAT') $endedData=true;
        if ($type==='IHDR') {
            if ($header!==null || $size!==13) fail(400,'ไฟล์ PNG ไม่สมบูรณ์');
            $header=$data; $info=unpack('Nwidth/Nheight/Cdepth/Ccolor/Ccompression/Cfilter/Cinterlace',$data);
            $w=$info['width']; $h=$info['height'];
            if ($w<1 || $h<1 || $w>10000 || $h>10000 || $w*$h>16000000) fail(400,'รูปมีความละเอียดสูงเกินไป กรุณาย่อรูปก่อนอัปโหลด');
            if ($info['depth']!==8 || !in_array($info['color'],[0,2,4,6],true) || $info['compression']!==0 || $info['filter']!==0 || $info['interlace']!==0) fail(400,'กรุณาอัปโหลดรูปผ่านปุ่มเลือกรูปของเว็บไซต์');
        } elseif ($type==='IDAT') {
            if ($endedData) fail(400,'ไฟล์ PNG ไม่สมบูรณ์');
            $seenData=true; $compressed.=$data;
        } elseif ($type==='IEND') {
            if ($size!==0 || !$seenData || $offset+12!==$length) fail(400,'ไฟล์ PNG ไม่สมบูรณ์');
            $ended=true; break;
        } elseif ($type==='PLTE') {
            if ($seenData || !in_array($info['color'],[2,6],true) || $size===0 || $size>768 || $size%3!==0) fail(400,'ไฟล์ PNG ไม่สมบูรณ์');
        } elseif ((ord($type[0])&32)===0 || in_array($type,['acTL','fcTL','fdAT','tRNS'],true)) {
            fail(400,'กรุณาอัปโหลดรูปผ่านปุ่มเลือกรูปของเว็บไซต์');
        }
        $offset+=12+$size;
    }
    if (!$ended || $header===null || $compressed==='') fail(400,'ไฟล์ PNG ไม่สมบูรณ์');
    $channels=[0=>1,2=>3,4=>2,6=>4][$info['color']]; $stride=1+$w*$channels; $expected=$stride*$h;
    $pixels=@gzuncompress($compressed,$expected+1);
    if ($pixels===false || strlen($pixels)!==$expected) fail(400,'ข้อมูลภาพ PNG ไม่สมบูรณ์');
    for ($row=0;$row<$h;$row++) if (ord($pixels[$row*$stride])>4) fail(400,'ข้อมูลภาพ PNG ไม่สมบูรณ์');
    $clean=gzcompress($pixels,6);
    if ($clean===false) fail(503,'บันทึกรูปไม่สำเร็จ');
    $out="\x89PNG\r\n\x1a\n".png_chunk('IHDR',$header).png_chunk('IDAT',$clean).png_chunk('IEND','');
    if (strlen($out)>3000000) fail(413,'รูปต้องมีขนาดไม่เกิน 3 MB กรุณาย่อรูปก่อนอัปโหลด');
    return ['bytes'=>$out,'width'=>$w,'height'=>$h];
}
