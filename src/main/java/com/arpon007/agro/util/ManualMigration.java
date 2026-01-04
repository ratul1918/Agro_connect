package com.arpon007.agro.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;

@Component
public class ManualMigration implements CommandLineRunner {

    @Autowired
    private DataSource dataSource;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("Running manual migration...");
        
        try (var connection = dataSource.getConnection();
             var stmt = connection.createStatement()) {
            
            // Create ai_api_keys table
            String createTableSql = """
                CREATE TABLE IF NOT EXISTS ai_api_keys (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    provider VARCHAR(50) NOT NULL UNIQUE,
                    api_key_encrypted TEXT NOT NULL,
                    key_type ENUM('PRODUCTION', 'TESTING') DEFAULT 'PRODUCTION',
                    is_active BOOLEAN DEFAULT TRUE,
                    last_validated TIMESTAMP NULL,
                    validation_status ENUM('VALID', 'INVALID', 'PENDING', 'EXPIRED') DEFAULT 'PENDING',
                    created_by BIGINT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
                    INDEX idx_provider (provider),
                    INDEX idx_is_active (is_active),
                    INDEX idx_validation_status (validation_status)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """;
            
            stmt.execute(createTableSql);
            System.out.println("Created ai_api_keys table");
            
            // Create ai_api_usage_logs table
            String createLogsTableSql = """
                CREATE TABLE IF NOT EXISTS ai_api_usage_logs (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    provider VARCHAR(50) NOT NULL,
                    user_id BIGINT,
                    request_type VARCHAR(50),
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
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """;
            
            stmt.execute(createLogsTableSql);
            System.out.println("Created ai_api_usage_logs table");
            
            System.out.println("Manual migration completed successfully!");
            
        } catch (Exception e) {
            System.err.println("Error running manual migration: " + e.getMessage());
            e.printStackTrace();
        }
    }
}