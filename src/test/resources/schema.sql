-- Test Schema for H2 Database
-- This file creates the necessary tables for testing AI API Key Management

-- Create ai_api_keys table (simplified version for testing)
CREATE TABLE IF NOT EXISTS ai_api_keys (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    encrypted_key TEXT NOT NULL,
    key_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT
);

-- Create app_configs table (simplified version for testing)
CREATE TABLE IF NOT EXISTS app_configs (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert test configuration values
INSERT INTO app_configs (config_key, config_value, description) VALUES 
('ai_model', 'gemini-1.5-flash', 'Default AI model'),
('ai_system_prompt', 'You are a test assistant.', 'System prompt for AI'),
('ai_key_rotation_days', '90', 'Key rotation period in days'),
('admin.default', 'true', 'Default admin configuration');