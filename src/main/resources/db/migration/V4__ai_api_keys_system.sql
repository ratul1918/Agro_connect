-- =================================================================================
-- AI API KEYS MANAGEMENT SYSTEM MIGRATION
-- =================================================================================

-- Create secure API keys table
CREATE TABLE IF NOT EXISTS ai_api_keys (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider VARCHAR(50) NOT NULL UNIQUE, -- 'google', 'openrouter', 'deepseek'
    api_key_encrypted TEXT NOT NULL, -- Encrypted API key
    key_type ENUM('PRODUCTION', 'TESTING') DEFAULT 'PRODUCTION',
    is_active BOOLEAN DEFAULT TRUE,
    last_validated TIMESTAMP NULL, -- Last time the key was successfully validated
    validation_status ENUM('VALID', 'INVALID', 'PENDING', 'EXPIRED') DEFAULT 'PENDING',
    created_by BIGINT, -- Admin who added the key
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_provider (provider),
    INDEX idx_is_active (is_active),
    INDEX idx_validation_status (validation_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create API key usage logs for monitoring
CREATE TABLE IF NOT EXISTS ai_api_usage_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    user_id BIGINT, -- User who made the request
    request_type VARCHAR(50), -- 'chat', 'completion', etc.
    status ENUM('SUCCESS', 'FAILURE', 'RATE_LIMITED') NOT NULL,
    error_message TEXT,
    tokens_used INT DEFAULT 0,
    response_time_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_provider (provider),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Update app_configs to remove API keys from environment variables
DELETE FROM app_configs WHERE config_key IN ('ai_openrouter_key', 'ai_gemini_key', 'ai_deepseek_key');

-- Add new configuration options for AI management
INSERT INTO app_configs (config_key, config_value) VALUES 
('ai_encryption_enabled', 'true'),
('ai_key_rotation_days', '90'),
('ai_usage_tracking_enabled', 'true')
ON DUPLICATE KEY UPDATE config_key=config_key;

-- Create a procedure to encrypt API keys (simple XOR encryption for demonstration)
-- In production, use proper encryption like AES-256
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS EncryptApiKey(IN plain_text TEXT, OUT encrypted_text TEXT)
BEGIN
    DECLARE key VARCHAR(32) DEFAULT 'agro-ai-encryption-key-2024';
    DECLARE i INT DEFAULT 1;
    DECLARE encrypted CHAR(1);
    DECLARE plain_char CHAR(1);
    DECLARE key_char CHAR(1);
    
    SET encrypted_text = '';
    
    WHILE i <= LENGTH(plain_text) DO
        SET plain_char = SUBSTRING(plain_text, i, 1);
        SET key_char = SUBSTRING(key, (i % LENGTH(key)) + 1, 1);
        SET encrypted = CHAR(ASCII(plain_char) ^ ASCII(key_char));
        SET encrypted_text = CONCAT(encrypted_text, encrypted);
        SET i = i + 1;
    END WHILE;
    
    -- Base64 encode for safe storage
    SET encrypted_text = TO_BASE64(encrypted_text);
END //
DELIMITER ;

-- Create a procedure to decrypt API keys
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS DecryptApiKey(IN encrypted_text TEXT, OUT plain_text TEXT)
BEGIN
    DECLARE key VARCHAR(32) DEFAULT 'agro-ai-encryption-key-2024';
    DECLARE i INT DEFAULT 1;
    DECLARE decrypted CHAR(1);
    DECLARE encrypted_char CHAR(1);
    DECLARE key_char CHAR(1);
    DECLARE decoded TEXT;
    
    -- Decode from base64
    SET decoded = FROM_BASE64(encrypted_text);
    SET plain_text = '';
    
    WHILE i <= LENGTH(decoded) DO
        SET encrypted_char = SUBSTRING(decoded, i, 1);
        SET key_char = SUBSTRING(key, (i % LENGTH(key)) + 1, 1);
        SET decrypted = CHAR(ASCII(encrypted_char) ^ ASCII(key_char));
        SET plain_text = CONCAT(plain_text, decrypted);
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;