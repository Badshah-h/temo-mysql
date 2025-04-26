-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  granted_by INT,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
  FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default permissions (using INSERT IGNORE to skip duplicates)
INSERT IGNORE INTO permissions (name, description, category) VALUES
-- User management permissions
('users.view', 'View users', 'user_management'),
('users.create', 'Create users', 'user_management'),
('users.edit', 'Edit users', 'user_management'),
('users.delete', 'Delete users', 'user_management'),

-- Role management permissions
('roles.view', 'View roles', 'role_management'),
('roles.create', 'Create roles', 'role_management'),
('roles.edit', 'Edit roles', 'role_management'),
('roles.delete', 'Delete roles', 'role_management'),

-- Permission management permissions
('permissions.view', 'View permissions', 'permission_management'),
('permissions.assign', 'Assign permissions to roles', 'permission_management'),

-- Widget management permissions
('widget.configure', 'Configure widget settings', 'widget_management'),
('widget.embed', 'Generate and manage embed codes', 'widget_management'),

-- Content management permissions
('content.view', 'View content', 'content_management'),
('content.create', 'Create content', 'content_management'),
('content.edit', 'Edit content', 'content_management'),
('content.delete', 'Delete content', 'content_management'),

-- System permissions
('system.settings', 'Manage system settings', 'system'),
('system.logs', 'View system logs', 'system');

-- Assign all permissions to admin role (using INSERT IGNORE to skip duplicates)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'admin'), 
  id 
FROM permissions;

-- Assign basic permissions to user role (using INSERT IGNORE to skip duplicates)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'user'),
  id
FROM permissions 
WHERE name IN ('content.view');

-- Assign moderator permissions (using INSERT IGNORE to skip duplicates)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'moderator'),
  id
FROM permissions 
WHERE name IN ('content.view', 'content.edit', 'users.view');
