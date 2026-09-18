<?php
declare(strict_types=1);
function auth_route(string $action,string $method): void {
    if ($action==='me' && $method==='GET') {
        $body=['user'=>current_user(),'csrfToken'=>csrf_token()];
        release_read_session(); json_response($body);
    }
    if ($action==='login' && $method==='POST') {
        require_https(); rate_limit('login-ip:'.request_ip(),10,900); $input=json_input();
        $username=text_value($input['username'] ?? null,'username',64); $password=$input['password'] ?? null;
        if (!is_string($password) || $password==='' || strlen($password)>200) fail(400,'กรอกรหัสผ่านให้ถูกต้อง');
        rate_limit('login-user:'.strtolower($username),20,900);
        $row=query('SELECT * FROM users WHERE username=? LIMIT 1',[$username])->fetch();
        $dummy='$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.';
        $valid=password_verify($password,$row['password_hash'] ?? $dummy);
        if (!$row || !$valid) fail(401,'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        json_response(['user'=>sign_in($row)]);
    }
    if ($action==='logout' && $method==='POST') {
        $_SESSION=[]; session_regenerate_id(true); $_SESSION['csrf']=bin2hex(random_bytes(32)); json_response(['ok'=>true]);
    }
    fail(404,'ไม่พบ endpoint นี้');
}
function users_route(array $parts,string $method,array $actor): void {
    if ($parts===[] && $method==='GET') {
        $rows=query('SELECT id,username,display_name,created_at FROM users ORDER BY id')->fetchAll();
        json_response(array_map(fn($r)=>['id'=>(int)$r['id'],'username'=>$r['username'],'displayName'=>$r['display_name'],'createdAt'=>(new DateTimeImmutable($r['created_at']))->format('Y-m-d\TH:i:s\Z')],$rows));
    }
    if ($parts===[] && $method==='POST') {
        $data=json_input(); $name=username_value($data['username'] ?? null); $display=text_value($data['displayName'] ?? null,'displayName',120); $password=password_value($data['password'] ?? null);
        query('INSERT INTO users (username,display_name,password_hash) VALUES (?,?,?)',[$name,$display,password_hash($password,PASSWORD_BCRYPT)]);
        json_response(['id'=>(int)db()->lastInsertId()],201);
    }
    if (count($parts)===2 && $parts[1]==='password' && $method==='POST') {
        $own=$parts[0]==='me'; if (!$own && (!ctype_digit($parts[0]) || (int)$parts[0]<1)) fail(400,'รหัสบัญชีไม่ถูกต้อง');
        $id=$own?$actor['id']:(int)$parts[0]; $data=json_input(); $password=password_value($data['newPassword'] ?? null,'newPassword');
        $row=query('SELECT * FROM users WHERE id=?',[$id])->fetch(); if (!$row) fail(404,'ไม่พบบัญชีนี้');
        // Own-password changes must always require the current password, even via /:id/password.
        if ($id===$actor['id']) {
            if (!is_string($data['currentPassword'] ?? null) || !password_verify($data['currentPassword'],$row['password_hash'])) fail(400,'รหัสผ่านปัจจุบันไม่ถูกต้อง',['currentPassword'=>'กรอกรหัสผ่านปัจจุบัน']);
        }
        $row['password_hash']=password_hash($password,PASSWORD_BCRYPT); query('UPDATE users SET password_hash=? WHERE id=?',[$row['password_hash'],$id]);
        if ($id===$actor['id']) sign_in($row);
        json_response(['ok'=>true]);
    }
    if (count($parts)===1 && $method==='DELETE') {
        if (!ctype_digit($parts[0]) || (int)$parts[0]<1) fail(400,'รหัสบัญชีไม่ถูกต้อง'); $id=(int)$parts[0];
        if ($id===$actor['id']) fail(400,'ลบบัญชีของตัวเองไม่ได้');
        if (!query('DELETE FROM users WHERE id=?',[$id])->rowCount()) fail(404,'ไม่พบบัญชีนี้'); json_response(['ok'=>true]);
    }
    fail(404,'ไม่พบ endpoint นี้');
}
