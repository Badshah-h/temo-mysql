-- Ensure default roles exist
INSERT IGNORE INTO roles (name, description, created_at, updated_at)
VALUES 
('user', 'Regular user with basic permissions', NOW(), NOW()),
('admin', 'Administrator with full access', NOW(), NOW()),
('editor', 'Can edit content but not manage users', NOW(), NOW()),
('viewer', 'Read-only access to content', NOW(), NOW());

-- Ensure default permissions exist
INSERT IGNORE INTO permissions (name, description, created_at, updated_at)
VALUES
('manage_users', 'Create, update, and delete users', NOW(), NOW()),
('manage_roles', 'Create, update, and delete roles', NOW(), NOW()),
('manage_content', 'Create, update, and delete content', NOW(), NOW()),
('view_dashboard', 'View admin dashboard', NOW(), NOW());

-- Assign all permissions to admin role
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'admin';

-- Assign basic permissions to user role
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'user' AND p.name = 'view_dashboard';
