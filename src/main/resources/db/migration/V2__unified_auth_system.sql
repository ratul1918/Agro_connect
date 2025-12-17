-- =============================================
-- UNIFIED AUTHENTICATION SYSTEM - DATABASE MIGRATION
-- =============================================
-- This migration adds support for multiple auth providers per user
-- and enables account linking by email

-- Step 1: Create user_providers table
CREATE TABLE IF NOT EXISTS user_providers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    provider VARCHAR(50) NOT NULL COMMENT 'google, github, email',
    provider_user_id VARCHAR(255) COMMENT 'OAuth provider user ID (null for email)',
    email_verified BOOLEAN DEFAULT FALSE COMMENT 'Email verification status from provider',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key to users table
    CONSTRAINT fk_user_provider_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    
    -- Ensure one provider per user (e.g., can't link Google twice)
    CONSTRAINT unique_user_provider UNIQUE (user_id, provider),
    
    -- Ensure OAuth provider user IDs are unique across the system
    CONSTRAINT unique_oauth_provider UNIQUE (provider, provider_user_id),
    
    -- Index for faster lookups
    INDEX idx_provider_lookup (provider, provider_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 2: Update users table to support OAuth-only accounts
-- Make password_hash nullable
ALTER TABLE users 
    MODIFY COLUMN password_hash VARCHAR(255) NULL 
    COMMENT 'Nullable for OAuth-only users';

-- Add email_verified column if it doesn't exist
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'email_verified'
);

SET @sql = IF(
    @column_exists = 0,
    'ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE AFTER email',
    'SELECT "Column email_verified already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure email is unique (if not already)
SET @index_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND INDEX_NAME = 'unique_email'
);

SET @sql = IF(
    @index_exists = 0,
    'ALTER TABLE users ADD UNIQUE INDEX unique_email (email)',
    'SELECT "Unique index on email already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 3: Migrate existing users to user_providers table
-- For existing email/password users, create an 'email' provider entry
INSERT INTO user_providers (user_id, provider, provider_user_id, email_verified)
SELECT 
    id, 
    'email' AS provider, 
    NULL AS provider_user_id,
    COALESCE(email_verified, FALSE) AS email_verified
FROM users
WHERE id NOT IN (SELECT user_id FROM user_providers WHERE provider = 'email')
AND password_hash IS NOT NULL;

-- For OAuth users (if any exist), we'll need manual migration
-- This is a placeholder - adjust based on your current OAuth implementation
-- INSERT INTO user_providers (user_id, provider, provider_user_id, email_verified)
-- SELECT ... FROM your_oauth_table;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check table structure
SELECT 
    'user_providers table created' AS status,
    COUNT(*) AS row_count
FROM user_providers;

-- Check users table modifications
SELECT 
    'users.password_hash is nullable' AS status,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'users'
AND COLUMN_NAME = 'password_hash';

-- Verify email uniqueness
SELECT 
    'Email uniqueness constraint' AS status,
    COUNT(*) AS constraint_count
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'users'
AND INDEX_NAME = 'unique_email';
