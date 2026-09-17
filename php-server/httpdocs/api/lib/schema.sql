





















CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(64)   NOT NULL,
  display_name  VARCHAR(120)  NOT NULL,

  password_hash VARCHAR(255)  NOT NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;







CREATE TABLE IF NOT EXISTS news (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug          VARCHAR(160)  NOT NULL,
  title_th      VARCHAR(300)  NOT NULL,
  title_en      VARCHAR(300)  NOT NULL,
  excerpt_th    TEXT          NOT NULL,
  excerpt_en    TEXT          NOT NULL,

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

  KEY ix_news_public (status, published_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;








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











CREATE TABLE IF NOT EXISTS site_references (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name_th       VARCHAR(300)  NOT NULL,
  name_en       VARCHAR(300)  NOT NULL,
  customer_th   VARCHAR(300)  NOT NULL,
  customer_en   VARCHAR(300)  NOT NULL,
  location_th   VARCHAR(300)  NOT NULL,
  location_en   VARCHAR(300)  NOT NULL,


  position      SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  status        ENUM('draft','published') NOT NULL DEFAULT 'draft',

  image_src     VARCHAR(300)  NULL,
  image_src_set VARCHAR(600)  NULL,
  image_alt_th  VARCHAR(300)  NULL,
  image_alt_en  VARCHAR(300)  NULL,
  image_width   SMALLINT UNSIGNED NULL,
  image_height  SMALLINT UNSIGNED NULL,

  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  KEY ix_site_references_public (status, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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










CREATE TABLE IF NOT EXISTS visitor_counter (
  id         TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  total      BIGINT UNSIGNED  NOT NULL DEFAULT 0,
  updated_at DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO visitor_counter (id, total) VALUES (1, 0);





CREATE TABLE IF NOT EXISTS php_rate_limits (
  bucket CHAR(64) NOT NULL,
  window_start BIGINT NOT NULL,
  hits INT UNSIGNED NOT NULL,
  expires_at BIGINT NOT NULL,
  PRIMARY KEY (bucket,window_start),
  KEY ix_rate_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS php_installation (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  installed_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;