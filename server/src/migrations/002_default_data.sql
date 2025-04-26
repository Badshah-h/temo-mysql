-- Insert default roles
INSERT IGNORE INTO roles (name, description) VALUES
('admin', 'Administrator with full access'),
('user', 'Regular user with basic permissions'),
('editor', 'Can edit content but not manage users'),
('viewer', 'Read-only access to content');

-- Insert default permissions
INSERT IGNORE INTO permissions (name, description, category) VALUES
('manage_users', 'Create, update, and delete users', 'user'),
('manage_roles', 'Create, update, and delete roles', 'user'),
('manage_permissions', 'Assign and remove permissions', 'user'),
('view_dashboard', 'View admin dashboard', 'dashboard'),
('manage_templates', 'Create, update, and delete templates', 'content'),
('manage_response_formats', 'Create, update, and delete response formats', 'content'),
('manage_widget_configs', 'Create, update, and delete widget configs', 'widget'),
('view_conversations', 'View conversation history', 'conversation');

-- Assign all permissions to admin role
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'admin';

-- Assign basic permissions to user role
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'user' AND p.name IN ('view_dashboard', 'view_conversations');

-- Assign content permissions to editor role
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'editor' AND p.name IN ('view_dashboard', 'manage_templates', 'manage_response_formats', 'view_conversations');

-- Assign view permissions to viewer role
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'viewer' AND p.name IN ('view_dashboard', 'view_conversations');

-- Create default admin user (password: admin123)
INSERT IGNORE INTO users (email, password, full_name, created_at, updated_at)
VALUES ('admin@example.com', '$2a$10$JcmAHe5eUZ0q7rV4JFwXkO.1/AqSxK6LZ.oEgiFCzrxnxaXwIEF4G', 'Admin User', NOW(), NOW());

-- Assign admin role to admin user
INSERT IGNORE INTO user_roles (user_id, role_id, created_at)
SELECT u.id, r.id, NOW() FROM users u, roles r
WHERE u.email = 'admin@example.com' AND r.name = 'admin';
