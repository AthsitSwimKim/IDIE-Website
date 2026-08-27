-- ---------------------------------------------------------------------------
-- IDIE Website — โครงฐานข้อมูลสำหรับระบบแอดมิน (ข่าวสาร + ผลงาน)
--
-- รันครั้งเดียวตอนติดตั้ง:
--   mysql -u root -p < server/schema.sql
--
-- **ทุกคอลัมน์ข้อความแยก _th / _en เป็นสองคอลัมน์ ไม่ใช่ JSON ก้อนเดียว**
-- เพราะเว็บทั้งเว็บใช้โครง { th, en } และการแยกคอลัมน์ทำให้บังคับ NOT NULL
-- ได้ทั้งสองภาษาตั้งแต่ระดับฐานข้อมูล ตรงกับกติกาที่ IDIE เลือกไว้ว่าต้องกรอกครบทั้งคู่
-- ถ้าเก็บเป็น JSON ฐานข้อมูลจะยอมให้บันทึกแถวที่ขาดภาษาอังกฤษโดยไม่ฟ้อง
-- และคนที่เปิด phpMyAdmin มาแก้ข้อความตรง ๆ จะอ่านไม่ออก
-- ---------------------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS idie_website
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE idie_website;

-- ---------------------------------------------------------------------------
-- ผู้ใช้ระบบแอดมิน — ทุกบัญชีสิทธิ์เท่ากัน (ไม่มี role)
--
-- ไม่เก็บอีเมล เพราะยังไม่มีระบบรีเซ็ตรหัสผ่านทางอีเมล การเก็บข้อมูลส่วนบุคคล
-- ที่ยังไม่มีใครใช้เป็นภาระโดยเปล่าประโยชน์ ถ้าวันหน้าทำ reset password ค่อยเพิ่ม
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(64)   NOT NULL,
  display_name  VARCHAR(120)  NOT NULL,
  -- รูปแบบ: scrypt$N$r$p$<salt-hex>$<hash-hex> — ดู server/src/auth.ts
  password_hash VARCHAR(255)  NOT NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- ข่าวสาร
--
-- `status` แยกจาก `published_at` โดยตั้งใจ — ตั้งวันเผยแพร่ล่วงหน้าไว้ก่อนแล้ว
-- ค่อยกดเผยแพร่ทีหลังได้ ถ้าใช้ published_at ตัวเดียวตัดสิน จะแยกไม่ออกระหว่าง
-- "ร่างที่ยังไม่เสร็จ" กับ "เขียนเสร็จแล้วรอวันประกาศ"
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS news (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug          VARCHAR(160)  NOT NULL,
  title_th      VARCHAR(300)  NOT NULL,
  title_en      VARCHAR(300)  NOT NULL,
  excerpt_th    TEXT          NOT NULL,
  excerpt_en    TEXT          NOT NULL,
  -- markdown ทั้งคู่ — ตรงกับคอมเมนต์ใน src/types/content.ts ที่ระบุว่า body เป็น markdown
  body_th       MEDIUMTEXT    NOT NULL,
  body_en       MEDIUMTEXT    NOT NULL,
  category      ENUM('company','project','product','article','event') NOT NULL,
  published_at  DATETIME      NOT NULL,
  status        ENUM('draft','published') NOT NULL DEFAULT 'draft',
  featured      TINYINT(1)    NOT NULL DEFAULT 0,

  cover_src     VARCHAR(300)  NULL,
  cover_src_set VARCHAR(600)  NULL,
  cover_alt_th  VARCHAR(300)  NULL,
  cover_alt_en  VARCHAR(300)  NULL,
  cover_width   SMALLINT UNSIGNED NULL,
  cover_height  SMALLINT UNSIGNED NULL,

  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_news_slug (slug),
  -- ดัชนีตามลำดับที่หน้าเว็บสาธารณะใช้จริง: กรองเฉพาะ published แล้วเรียงตามวันที่
  KEY ix_news_public (status, published_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- ผลงาน
--
-- `client_th/en` เป็นข้อความ ไม่ใช่ FK ไปตารางลูกค้าอ้างอิง — ตามที่คอมเมนต์ไว้ใน
-- src/types/content.ts ว่าบางโครงการลูกค้าไม่ให้เปิดเผยชื่อ ต้องใส่ 'ไม่เปิดเผย' ได้
--
-- `year` ยอมให้ NULL เพราะบางงานอาจยังไม่ระบุปี ตรงกับ `year: number | null` ใน type
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id                       INT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug                     VARCHAR(160)  NOT NULL,
  name_th                  VARCHAR(300)  NOT NULL,
  name_en                  VARCHAR(300)  NOT NULL,
  client_th                VARCHAR(300)  NOT NULL,
  client_en                VARCHAR(300)  NOT NULL,
  industry                 ENUM('petrochemical','oil-gas','chemical','power-plant',
                                'fertilizer','mining','epc','manufacturing') NOT NULL,
  location_th              VARCHAR(300)  NOT NULL,
  location_en              VARCHAR(300)  NOT NULL,
  year                     SMALLINT UNSIGNED NULL,
  overview_th              TEXT          NOT NULL,
  overview_en              TEXT          NOT NULL,
  engineering_solution_th  TEXT          NOT NULL,
  engineering_solution_en  TEXT          NOT NULL,
  status                   ENUM('draft','published') NOT NULL DEFAULT 'draft',
  featured                 TINYINT(1)    NOT NULL DEFAULT 0,

  cover_src                VARCHAR(300)  NULL,
  cover_src_set            VARCHAR(600)  NULL,
  cover_alt_th             VARCHAR(300)  NULL,
  cover_alt_en             VARCHAR(300)  NULL,
  cover_width              SMALLINT UNSIGNED NULL,
  cover_height             SMALLINT UNSIGNED NULL,

  created_at               DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at               DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_projects_slug (slug),
  KEY ix_projects_public (status, year DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- ขอบเขตงานของแต่ละผลงาน (Project.scopeOfWork — เป็น array)
--
-- แยกตารางแทนการยัดเป็น JSON เพราะแต่ละบรรทัดเป็นคู่ th/en ที่ต้องบังคับครบทั้งคู่
-- เหมือนกัน และ `position` ทำให้ลำดับที่แอดมินจัดไว้ไม่สลับตอนอ่านกลับมา
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_scope_items (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  project_id INT UNSIGNED NOT NULL,
  position   SMALLINT UNSIGNED NOT NULL,
  text_th    VARCHAR(500) NOT NULL,
  text_en    VARCHAR(500) NOT NULL,
  CONSTRAINT fk_scope_project FOREIGN KEY (project_id)
    REFERENCES projects (id) ON DELETE CASCADE,
  KEY ix_scope_project (project_id, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- ภาพประกอบของแต่ละผลงาน (Project.gallery — เป็น array ของ ImageAsset)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_images (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  project_id INT UNSIGNED NOT NULL,
  position   SMALLINT UNSIGNED NOT NULL,
  src        VARCHAR(300) NOT NULL,
  src_set    VARCHAR(600) NULL,
  alt_th     VARCHAR(300) NOT NULL,
  alt_en     VARCHAR(300) NOT NULL,
  width      SMALLINT UNSIGNED NULL,
  height     SMALLINT UNSIGNED NULL,
  CONSTRAINT fk_images_project FOREIGN KEY (project_id)
    REFERENCES projects (id) ON DELETE CASCADE,
  KEY ix_images_project (project_id, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- เซสชันของ express-session (express-mysql-session สร้างเองได้ แต่ประกาศไว้ที่นี่
-- ให้เห็นครบในไฟล์เดียว และกันไม่ให้ผู้ใช้ฐานข้อมูลของแอปต้องมีสิทธิ์ CREATE TABLE)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(128) NOT NULL PRIMARY KEY,
  expires    INT UNSIGNED NOT NULL,
  data       MEDIUMTEXT   NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
