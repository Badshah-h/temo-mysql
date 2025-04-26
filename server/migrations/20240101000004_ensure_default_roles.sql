-- Ensure default roles exist
INSERT IGNORE INTO roles (name, description, created_at, updated_at)
VALUES 
('user', 'Regular user with basic permissions', NOW(), NOW()),
('admin', 'Administrator with full access', NOW(), NOW()),
('editor', 'Can edit content but not manage users', NOW(), NOW()),
('viewer', 'Read-only access to content', NOW(), NOW());
