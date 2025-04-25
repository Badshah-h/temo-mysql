-- Migration: 002_seed_data.sql
-- Seed data for initial setup

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('admin', 'Administrator with full access'),
('user', 'Regular user with limited access'),
('moderator', 'User with moderation privileges')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Insert a default admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (email, password, full_name, role) VALUES
('admin@example.com', '$2a$10$JmVmtHCEFIvJBo1CjO/C3.HrAJTbQjKsZ9nJUUL3Vx8X7JNkDJXlS', 'Admin User', 'admin')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), role = VALUES(role);

-- Assign admin role to admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'admin@example.com' AND r.name = 'admin'
ON DUPLICATE KEY UPDATE assigned_at = CURRENT_TIMESTAMP;
