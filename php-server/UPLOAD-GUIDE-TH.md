# อัปเดต IDIE บน RapidCloud — PHP + MariaDB

ชุดนี้เปลี่ยน API เป็น PHP บน hosting เดิม ข่าวสาร ผลงาน และหน้างานอ้างอิงจัดการผ่านแอดมินได้ แบบฟอร์มสอบถามส่งผ่าน SMTP ไม่มี Node, Docker, npm หรือ Composer ที่ต้องรันบน RapidCloud

## ไฟล์ที่ต้องลง

| ไฟล์/โฟลเดอร์ | ปลายทาง |
| --- | --- |
| 01-php-api.zip | อัปโหลดและ Extract ที่ /idindustrial.com/httpdocs |
| 02-assets.zip | อัปโหลดและ Extract ที่ /idindustrial.com/httpdocs |
| 03-root-files.zip | อัปโหลดและ Extract ที่ /idindustrial.com/httpdocs เป็นลำดับสุดท้าย |
| PRIVATE-OUTSIDE-HTTPDOCS/idie-private | วางโฟลเดอร์ idie-private ที่ /idindustrial.com อยู่ระดับเดียวกับ httpdocs |
| LOCAL-SETUP-KEY.txt | เก็บในเครื่องคุณ ใช้รหัสในไฟล์ตอนสร้างบัญชีแรกเท่านั้น |

ZIP แต่ละไฟล์ต่ำกว่า 4,000,000 bytes มีชื่อโฟลเดอร์ภายในพร้อมแล้ว ไม่ต้องสร้าง api/api หรือ assets/assets
รูปและ PDF ใน httpdocs/images กับ httpdocs/documents ที่อัปโหลดไว้แล้วใช้ต่อได้ ชุดนี้ไม่รวมไฟล์ใหญ่เหล่านั้น
อย่าอัปโหลดทั้งโฟลเดอร์ชุดติดตั้งเข้าเว็บรูท เพราะจะนำไฟล์รหัสติดตั้งและ config ไปไว้ในที่สาธารณะ

โครงสร้างที่ถูกต้อง:
~~~
idindustrial.com/
  idie-private/
    config.php
    sessions/              # PHP สร้างให้
  httpdocs/
    index.html
    web.config
    assets/
    api/
      index.php
      setup.php
      lib/                 # ถูกปิดการเข้าถึงจากเว็บ
    uploads/
      web.config
    images/
    documents/
~~~

## 1. เตรียมฐานข้อมูลและ HTTPS

1. สำรอง httpdocs/index.html, assets และ web.config เดิมใน File Manager หรือดาวน์โหลดเก็บในเครื่องก่อนลงชุดใหม่ ถ้า web.config เดิมมี handlers, PHP mapping, connectionStrings หรือการตั้งค่า hosting อื่น ให้รวมกฎของชุดนี้เข้ากับไฟล์เดิมก่อนอัปโหลด ห้ามเขียนทับจนค่าของ hosting หาย
2. เข้า RapidCloud > MariaDB สร้างฐานข้อมูลใหม่สำหรับเว็บไซต์นี้ สร้างผู้ใช้ฐานข้อมูล และผูกผู้ใช้กับฐานข้อมูลนั้น ให้มีสิทธิ์ CREATE, SELECT, INSERT, UPDATE, DELETE และ INDEX สำหรับติดตั้งตาราง
3. จด Server/Host, Database name, Username ที่แผงแสดง ชื่อฐานข้อมูลอาจมี prefix บัญชี hosting ให้ใช้ชื่อเต็มจริง ห้ามเดาว่าเป็น localhost
4. เปิด PHP ใน Web Sites > idindustrial.com > Extensions เลือกรุ่นที่ผู้ให้บริการรองรับอยู่ โค้ดใช้ไวยากรณ์ PHP 8.0 ขึ้นไป
5. เปิด SSL certificate ของโดเมนและตรวจว่า https://www.idindustrial.com เปิดได้ก่อนสร้างแอดมิน ระบบจะปฏิเสธ Login, อัปโหลด และส่งแบบฟอร์มผ่าน HTTP
6. Hosting ต้องมี PHP pdo_mysql, mbstring, gd, fileinfo, openssl และ IIS URL Rewrite หน้าติดตั้งตรวจส่วน PHP ให้ ถ้าขาดให้ผู้ให้บริการเปิดให้
7. uploads และ idie-private ต้องให้ PHP เขียนได้ ภายใน uploads ต้องมี web.config จากชุดนี้เพื่อปิดการรันสคริปต์

PHP 8.0 ที่เห็นในแผงเดิมเป็นรุ่นเก่าที่หมดการสนับสนุนแล้ว ควรให้ RapidCloud เปิดรุ่นที่ยังได้รับการสนับสนุนก่อนใช้งานจริง ดู [PHP supported versions](https://www.php.net/supported-versions.php)

## 2. ใส่การตั้งค่า

แก้ PRIVATE-OUTSIDE-HTTPDOCS/idie-private/config.php ในเครื่องก่อนอัปโหลด หรือแก้ด้วย File Manager หลังวางถูกตำแหน่งแล้ว

- public_url: URL ที่เปิดเว็บจริง เช่น https://www.idindustrial.com ใช้ host และ scheme ตรงกัน กำหนด www/non-www ให้เป็น URL เดียวในแผง hosting
- require_https: คง true
- app_key, setup_token_hash: ชุดติดตั้งสร้างค่าให้แล้ว เก็บไว้เหมือนเดิม
- db.host, db.port, db.name, db.user, db.password: ใช้ข้อมูล MariaDB จากขั้นก่อน
- smtp.host: Server ส่งเมลของบัญชีบริษัท
- smtp.port, smtp.encryption: ตามผู้ให้บริการ เช่น port 587 คู่กับ tls หรือ port 465 คู่กับ ssl
- smtp.user, smtp.password: บัญชี SMTP; บางบริการใช้ App password โดยเฉพาะ
- smtp.from: อีเมลผู้ส่งที่ SMTP อนุญาต
- smtp.to: อีเมลบริษัทที่จะรับคำถาม
- smtp.from_name: ชื่อผู้ส่ง เช่น IDIE Website

ค่ารหัสผ่านอยู่ระหว่าง single quotes ของ PHP ถ้ามี ' ให้เขียน \' และถ้ามี \ ให้เขียน \\
ไฟล์นี้มีรหัสฐานข้อมูลและ SMTP ต้องอยู่ **นอก httpdocs** อย่าส่งรหัสผ่านผ่านแชตหรืออัปโหลด .env เข้าเว็บรูท
ไม่ต้องกรอก ENV ในช่องฟอร์มสอบถาม และไม่ต้องมี API key ใน frontend

ถ้ายังไม่ได้ตั้ง SMTP ข่าวสาร/ผลงานและแอดมินใช้ได้ แต่แบบฟอร์มจะบอกว่าส่งไม่ได้

## 3. อัปโหลดและสร้างแอดมิน

1. วาง config ที่ /idindustrial.com/idie-private/config.php ถ้า File Manager ไม่ให้เขียนระดับนี้ ให้ผู้ให้บริการจัดโฟลเดอร์ private และสิทธิ์ให้ อย่าย้าย config เข้า httpdocs
2. อัปโหลดและ Extract ZIP 3 ไฟล์ตามตาราง ยืนยันว่าอยู่ใน httpdocs จริง
3. ลบ ZIP หลัง Extract สำเร็จ
4. เปิด https://www.idindustrial.com/api/setup.php
5. ถ้าทุกรายการขึ้น “พร้อม” ใส่รหัสจาก LOCAL-SETUP-KEY.txt ตั้งชื่อผู้ใช้ ชื่อที่แสดง และรหัสผ่านอย่างน้อย 12 ตัวอักษร
6. หน้านี้สร้างตารางและบัญชีแรกให้ ไม่ต้องรัน SQL ใน CMD หรือมีบัญชีแอดมินเดิม
7. เมื่อขึ้น “สร้างบัญชีเรียบร้อยแล้ว” เปิด https://www.idindustrial.com/admin/login แล้วใช้บัญชีที่เพิ่งตั้ง
8. ลบ api/setup.php ผ่าน File Manager หลังสำเร็จ การติดตั้งซ้ำถูกปิดในฐานข้อมูลแล้วอยู่ดี

บัญชี PHP ใช้ password hash คนละรูปแบบกับ Node เดิม ให้ใช้ฐานข้อมูลใหม่ หากมีข่าว/ผลงานจริงในฐานข้อมูล Node ต้องวางแผนย้ายข้อมูลก่อน ห้ามชี้ฐานข้อมูลเดิมแล้วติดตั้งซ้ำ
การตั้งรหัสใหม่ให้แอดมินคนอื่นจะยกเลิกเซสชันเดิมของคนนั้น ทุกบัญชีมีสิทธิ์จัดการเนื้อหาและบัญชีเท่ากัน

## 4. ตรวจหลังลง

- เปิด /api/index.php?route=health ต้องได้ {"ok":true,"backend":"php"} โดยไม่มีข้อมูลรหัสผ่าน
- เพิ่มหน้างานจากเมนู “หน้างานอ้างอิง” ใส่ทั้งสองภาษา อัปโหลดรูป เผยแพร่ ตรวจ /reference
- เพิ่มโครงการจากเมนูผลงาน ตรวจ /projects และหน้ารายละเอียด
- เพิ่มข่าวพร้อมปกและวันเผยแพร่ ตรวจ /news ข่าวร่างหรือวันเผยแพร่ในอนาคตจะไม่ออกหน้าเว็บ
- ลองแก้แล้วบันทึกซ้ำ และอัปโหลด JPEG/PNG/WebP ไม่เกิน 3 MB PHP ย่อและแปลงใหม่ หาก GD ไม่รองรับ WebP จะใช้ PNG/JPEG
- Refresh ตรง /admin/login, /news, /reference ต้องไม่เป็น 404
- ส่งแบบฟอร์มด้วยอีเมลคุณเอง ตรวจกล่องบริษัทและ Spam ระบบตอบสำเร็จเมื่อ SMTP รับเมลแล้ว การเข้าถึง Inbox จริงขึ้นกับผู้ให้บริการอีเมลด้วย
- Logout แล้วเปิดหลังบ้าน ต้องกลับหน้า Login

ข่าวและหน้างานเริ่มว่างจนกว่าจะเพิ่มข้อมูลจริง โลโก้ลูกค้าอ้างอิงเดิมยังมาจากข้อมูลเว็บไซต์
สำรอง MariaDB และ httpdocs/uploads เป็นระยะ หากย้อน frontend ให้คืน index.html/assets/web.config ที่สำรองไว้ โดยรักษาฐานข้อมูลและ uploads

## ถ้าเจอปัญหา

- **503**: ตรวจ config, ชื่อ DB, สิทธิ์ และส่วนขยาย PHP
- **426**: ใช้ HTTPS และติดตั้งใบรับรองให้ถูกต้อง
- **403 ตอนบันทึก**: โหลดหน้าใหม่แล้ว Login ตรวจ public_url ให้ตรง www/non-www และ HTTPS จริง
- **500.19 หลังลง web.config**: ให้ RapidCloud ตรวจ IIS URL Rewrite และสิทธิ์ configuration section ส่งเฉพาะข้อความ error ห้ามส่ง config ที่มีรหัส อย่าลบการป้องกัน private/uploads เพื่อให้ผ่าน
- **รูป 404**: ตรวจตำแหน่ง uploads, สิทธิ์อ่าน และ MIME .webp = image/webp
- **แบบฟอร์มส่งไม่ได้**: ตรวจ SMTP host/port/encryption/App password/สิทธิ์ From และพอร์ต SMTP outbound ของ hosting
- **413 ตอนอัปโหลด**: ย่อรูปต่ำกว่า 3 MB หรือให้ hosting ตั้ง upload_max_filesize ≥ 3M, post_max_size ≥ 4M, memory_limit ≥ 128M
- **ลืมรหัสแอดมิน**: ให้แอดมินอีกคนตั้งใหม่ ถ้าไม่มีใครเข้าได้ ให้ผู้ดูแลรีเซ็ตผ่านฐานข้อมูลอย่างปลอดภัย หน้าติดตั้งไม่เปิดให้สร้างบัญชีซ้ำ

## สร้างชุดใหม่จากเครื่องพัฒนา

~~~
node scripts/build-rapidcloud.mjs
~~~
ผลอยู่ tmp/rapidcloud-package คง app key และรหัสติดตั้งของ output เดิมเมื่อ build ซ้ำ ต้องมี Node/dependencies เฉพาะเครื่องพัฒนา
ZIP frontend/API ไม่รวม config หรือรหัสติดตั้ง แยกโฟลเดอร์ private สำหรับวางนอกเว็บรูท