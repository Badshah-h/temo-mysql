-- Insert default tenant if it doesn't exist
INSERT INTO tenants (name, slug, created_at, updated_at)
SELECT 'Default Tenant', 'default', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE slug = 'default');

-- Insert default roles if they don't exist
INSERT INTO roles (name, description, created_at, updated_at)
SELECT 'admin', 'Administrator with full access', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'admin');

INSERT INTO roles (name, description, created_at, updated_at)
SELECT 'user', 'Regular user with limited access', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'user');
