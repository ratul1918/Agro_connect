-- Add role_id column to users table
ALTER TABLE users ADD COLUMN role_id INT DEFAULT NULL;

-- Add foreign key constraint
ALTER TABLE users ADD CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id);

-- Migrate existing roles (taking the first role found for each user)
UPDATE users u
JOIN user_roles ur ON u.id = ur.user_id
SET u.role_id = ur.role_id;

-- Make role_id NOT NULL only after migration (optional, keeping nullable for now to be safe or set default)
-- ALTER TABLE users MODIFY role_id INT NOT NULL;
