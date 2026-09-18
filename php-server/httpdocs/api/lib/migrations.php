<?php
declare(strict_types=1);

function ensure_site_reference_year(): void {
    static $ready=false;
    if ($ready) return;
    try {
        if (!query("SHOW COLUMNS FROM site_references LIKE 'year'")->fetch()) {
            // Additive only: existing records keep their IDs, images and text.
            query('ALTER TABLE site_references ADD COLUMN year SMALLINT UNSIGNED NULL AFTER location_en');
        }
    } catch (PDOException $e) {
        $code=(int)($e->errorInfo[1] ?? 0);
        // Two authenticated requests may both see the pre-migration schema.
        if ($code===1060 && query("SHOW COLUMNS FROM site_references LIKE 'year'")->fetch()) {
            $ready=true; return;
        }
        if (in_array($code,[1044,1142,1143],true)) {
            fail(503,'เพิ่มช่อง Year ในฐานข้อมูลไม่ได้ กรุณาให้บัญชีฐานข้อมูลมีสิทธิ์ ALTER แล้วลองอีกครั้ง');
        }
        throw $e;
    }
    $ready=true;
}
