-- Migration: 003_widget_tables.sql
-- Tables for widget configuration and customization

-- Widget configurations table
CREATE TABLE IF NOT EXISTS widget_configs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  config_json JSON NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Widget themes table
CREATE TABLE IF NOT EXISTS widget_themes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  primary_color VARCHAR(20) NOT NULL DEFAULT '#6366F1',
  secondary_color VARCHAR(20) NOT NULL DEFAULT '#4F46E5',
  text_color VARCHAR(20) NOT NULL DEFAULT '#1F2937',
  background_color VARCHAR(20) NOT NULL DEFAULT '#FFFFFF',
  border_radius VARCHAR(20) NOT NULL DEFAULT '0.5rem',
  font_family VARCHAR(100) NOT NULL DEFAULT 'Inter, system-ui, sans-serif',
  custom_css TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Widget embed codes table
CREATE TABLE IF NOT EXISTS widget_embeds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  widget_config_id INT NOT NULL,
  embed_key VARCHAR(64) NOT NULL UNIQUE,
  domain VARCHAR(255),
  allowed_origins TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (widget_config_id) REFERENCES widget_configs(id) ON DELETE CASCADE,
  INDEX idx_embed_key (embed_key),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
