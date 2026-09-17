<?php
declare(strict_types=1);
function contact_route(): void {
    $input=json_input();
    if (!empty($input['website'])) { text_value($input['website'],'website',200,false); json_response(['ok'=>true]); }
    $data=[];
    foreach (['name'=>200,'company'=>200,'email'=>320,'phone'=>60,'subject'=>300,'message'=>5000] as $field=>$max) $data[$field]=text_value($input[$field] ?? (in_array($field,['company','phone'],true)?'':null),$field,$max,!in_array($field,['company','phone'],true));
    if (!filter_var($data['email'],FILTER_VALIDATE_EMAIL)) fail(400,'รูปแบบอีเมลไม่ถูกต้อง',['email'=>'กรอกอีเมลที่ถูกต้อง']);
    $data['locale']=enum_value($input['locale'] ?? 'th','locale',['th','en']);
    rate_limit('contact:'.request_ip(),5,3600);
    $smtp=config()['smtp'] ?? [];
    if (empty($smtp['host']) || empty($smtp['from']) || empty($smtp['to'])) fail(503,'ระบบส่งอีเมลยังไม่พร้อมใช้งาน กรุณาติดต่อทางโทรศัพท์หรืออีเมลโดยตรง');
    foreach (['from','to'] as $key) if (!filter_var($smtp[$key],FILTER_VALIDATE_EMAIL)) fail(503,'การตั้งค่าอีเมลยังไม่ครบ');
    require_once __DIR__.'/vendor/PHPMailer/Exception.php'; require_once __DIR__.'/vendor/PHPMailer/PHPMailer.php'; require_once __DIR__.'/vendor/PHPMailer/SMTP.php';
    $mail=new PHPMailer\PHPMailer\PHPMailer(true);
    try {
        $mail->isSMTP(); $mail->Host=$smtp['host']; $mail->Port=(int)($smtp['port'] ?? 587); $mail->Timeout=20; $mail->CharSet='UTF-8';
        $mail->SMTPAuth=!empty($smtp['user']); $mail->Username=$smtp['user'] ?? ''; $mail->Password=$smtp['password'] ?? '';
        if (!in_array($smtp['encryption'] ?? 'tls',['tls','ssl'],true)) fail(503,'SMTP ต้องใช้ TLS หรือ SSL');
        $mail->SMTPSecure=$smtp['encryption'] ?? 'tls';
        $mail->setFrom($smtp['from'],$smtp['from_name'] ?? 'IDIE Website'); $mail->addAddress($smtp['to']); $mail->addReplyTo($data['email'],$data['name']);
        $mail->Subject='[IDIE Inquiry] '.$data['subject']; $mail->isHTML(false);
        $mail->Body="Name: {$data['name']}\nCompany: {$data['company']}\nEmail: {$data['email']}\nPhone: {$data['phone']}\nLanguage: {$data['locale']}\n\n{$data['message']}";
        $mail->send();
    } catch (Throwable $e) { error_log('[IDIE PHP] SMTP delivery failed'); fail(502,'ส่งคำถามไม่สำเร็จ กรุณาลองใหม่ หรือติดต่อทางโทรศัพท์โดยตรง'); }
    json_response(['ok'=>true]);
}
