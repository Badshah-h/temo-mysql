-- Migration: 004_tenants.sql
-- Add tenants table and tenant_id columns for multi-tenancy

CREATE TABLE IF NOT EXISTS tenants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  logo_url VARCHAR(255),
  primary_color VARCHAR(20),
  secondary_color VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- The following ALTER TABLE statements are commented out to prevent duplicate column/constraint errors.
-- ALTER TABLE users ADD COLUMN tenant_id INT AFTER id;
-- ALTER TABLE users ADD CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- ALTER TABLE widget_configs ADD COLUMN tenant_id INT AFTER id;
-- ALTER TABLE widget_configs ADD CONSTRAINT fk_widget_configs_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- ALTER TABLE widget_themes ADD COLUMN tenant_id INT AFTER id;
-- ALTER TABLE widget_themes ADD CONSTRAINT fk_widget_themes_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id); 