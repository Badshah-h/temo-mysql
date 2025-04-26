-- Migration: 006_remove_role_column.sql
-- Remove the role column from users table and ensure all users have proper roles in user_roles

-- First, ensure all users have at least one role in user_roles table
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT 
  u.id, 
  (SELECT id FROM roles WHERE name = u.role)
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id
);

-- Now remove the role column from users table
ALTER TABLE users DROP COLUMN role;
