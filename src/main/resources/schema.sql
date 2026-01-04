-- =================================================================================
-- AGRO CONNECT DATABASE SCHEMA
-- =================================================================================
-- Database: MySQL
-- Charset: utf8mb4 (Full Bangla Support)
-- =================================================================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS agro_connect 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE agro_connect;

SET FOREIGN_KEY_CHECKS = 0;

-- =================================================================================
-- 1. CORE AUTHENTICATION & USERS
-- =================================================================================

CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE -- ROLE_FARMER, ROLE_BUYER, ROLE_AGRONOMIST, ROLE_ADMIN, ROLE_GENERAL_CUSTOMER
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL, -- Bangla supported
    email VARCHAR(100) NOT NULL UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    country VARCHAR(50) DEFAULT 'Bangladesh', -- Country (for international buyers)
    division VARCHAR(50), -- Division name (e.g., Dhaka, Chittagong)
    district VARCHAR(50), -- District name
    upazila VARCHAR(50), -- Upazila/Sub-district name
    thana VARCHAR(50), -- Thana/Police Station name
    post_code VARCHAR(10), -- Post code (numeric)
    profile_image_url VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================================
-- 2. MARKETPLACE (Crops, Pricing)
-- =================================================================================

CREATE TABLE IF NOT EXISTS crop_type (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_en VARCHAR(50) NOT NULL,
    name_bn VARCHAR(50) NOT NULL -- Bangla Name
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS crops (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farmer_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL, -- "Fresh Rice" / "তাজা ধান"
    description TEXT,
    crop_type_id INT,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL, -- kg, ton, maund
    
    -- Wholesale pricing (for BUYER role - minimum 80kg)
    min_price DECIMAL(10,2) NOT NULL, -- Farmer's base price
    wholesale_price DECIMAL(10,2), -- Price for wholesale buyers
    min_wholesale_qty DECIMAL(10,2) DEFAULT 80.00, -- Minimum 80kg for wholesale
    
    -- Retail pricing (for GENERAL_CUSTOMER - small quantities)
    retail_price DECIMAL(10,2), -- Consumer price (calculated if null)
    min_retail_qty DECIMAL(10,2) DEFAULT 0.10, -- Minimum 100gm for retail
    max_retail_qty DECIMAL(10,2) DEFAULT 10.00, -- Maximum 10kg for retail
    
    -- Profit configuration
    profit_margin_percent DECIMAL(5,2) DEFAULT 25.00, -- Default 25% profit
    fixed_cost_per_unit DECIMAL(10,2) DEFAULT 5.00, -- Default ৳5 fixed cost per kg
    
    location VARCHAR(100),
    is_sold BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (crop_type_id) REFERENCES crop_type(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS crop_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    crop_id BIGINT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS market_price (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    crop_type_id INT NOT NULL,
    district VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    price_date DATE NOT NULL,
    FOREIGN KEY (crop_type_id) REFERENCES crop_type(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================================
-- 3. BIDDING, ORDERS & TRANSACTIONS
-- =================================================================================

CREATE TABLE IF NOT EXISTS bids (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    crop_id BIGINT NOT NULL,
    buyer_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL, -- Buyer's proposed price per unit
    quantity DECIMAL(10,2) NOT NULL DEFAULT 80.00, -- Quantity for this bid
    farmer_counter_price DECIMAL(10,2), -- Farmer's counter-offer price
    last_action_by ENUM('BUYER', 'FARMER') DEFAULT 'BUYER', -- Who acted last
    bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'COUNTER_OFFER', 'ACCEPTED', 'REJECTED', 'DELETED', 'ORDERED') DEFAULT 'PENDING',
    FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_crop_id (crop_id),
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    buyer_id BIGINT NOT NULL,
    farmer_id BIGINT NOT NULL,
    crop_id BIGINT NOT NULL, -- Allow multiple orders per crop
    total_amount DECIMAL(10,2) NOT NULL,
    advance_amount DECIMAL(10,2) NOT NULL, -- 20%
    due_amount DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING', 'PENDING_ADVANCE', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (farmer_id) REFERENCES users(id),
    FOREIGN KEY (crop_id) REFERENCES crops(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    payer_id BIGINT NOT NULL, -- Buyer usually
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50), -- bKash, Nogod, Card
    transaction_id VARCHAR(100) UNIQUE,
    payment_status ENUM('PENDING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING',
    payment_type ENUM('ADVANCE', 'FULL') DEFAULT 'ADVANCE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================================
-- 3A. WALLET \u0026 CASH MANAGEMENT
-- =================================================================================

-- Wallets table for tracking user balances
CREATE TABLE IF NOT EXISTS wallets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    balance DECIMAL(10,2) DEFAULT 0.00 CHECK (balance >= 0),
    total_earned DECIMAL(10,2) DEFAULT 0.00,
    total_withdrawn DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions table for wallet transaction history
CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    wallet_id BIGINT NOT NULL,
    type ENUM('CREDIT', 'DEBIT') NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    source ENUM('SALE', 'CASHOUT', 'REFUND', 'BONUS', 'ADJUSTMENT', 'ORDER_PAYMENT', 'DEPOSIT') NOT NULL,
    reference_id BIGINT,
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
    INDEX idx_wallet_id (wallet_id),
    INDEX idx_created_at (created_at),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cashout requests table (updated schema)
CREATE TABLE IF NOT EXISTS cashout_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_method ENUM('BANK', 'BKASH', 'NAGAD', 'ROCKET') NOT NULL,
    account_details VARCHAR(500) NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'PAID') DEFAULT 'PENDING',
    admin_note TEXT,
    invoice_url VARCHAR(500),
    transaction_ref VARCHAR(100),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    processed_by BIGINT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_requested_at (requested_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================================
-- 4. DELIVERY & EXPORT
-- =================================================================================

CREATE TABLE IF NOT EXISTS delivery_shipment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'PROCESSING', -- PROCESSING, IN_TRANSIT, DELIVERED
    current_location VARCHAR(100),
    estimated_delivery DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS export_applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farmer_id BIGINT NOT NULL,
    crop_details TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    destination_country VARCHAR(100),
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================================
-- 5. WEATHER & ALERTS
-- =================================================================================

CREATE TABLE IF NOT EXISTS weather_alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    district VARCHAR(50) NOT NULL,
    alert_type VARCHAR(50) NOT NULL, -- STORM, RAIN, PEST
    message_bn TEXT NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================================
-- 6. SUBSIDY
-- =================================================================================

CREATE TABLE IF NOT EXISTS subsidy_schemes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_bn VARCHAR(150) NOT NULL,
    description_bn TEXT,
    amount DECIMAL(10,2),
    deadline DATE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS farmer_subsidy_applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farmer_id BIGINT NOT NULL,
    scheme_id INT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id),
    FOREIGN KEY (scheme_id) REFERENCES subsidy_schemes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================================
-- 7. AI & CHATBOT
-- =================================================================================

CREATE TABLE IF NOT EXISTS ai_chat_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT, -- Can be null for guest? prefer logged in
    query_text TEXT NOT NULL,
    image_url VARCHAR(255),
    response_text TEXT, -- Markdown supported
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================================
-- 8. COMMUNICATION (Chats, Notifications)
-- =================================================================================

CREATE TABLE IF NOT EXISTS chats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user1_id BIGINT NOT NULL,
    user2_id BIGINT NOT NULL,
    last_message TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES users(id),
    FOREIGN KEY (user2_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    chat_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    message_type ENUM('TEXT', 'IMAGE', 'VOICE', 'VIDEO', 'FILE') DEFAULT 'TEXT',
    media_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'NORMAL',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_receiver_read (receiver_id, is_read),
    INDEX idx_conversation (sender_id, receiver_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message_bn TEXT NOT NULL, -- Always Bangla for local users
    type VARCHAR(50), -- ORDER, BID, SYSTEM
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================================
-- 9. BLOGS & AGRICULTURAL TIPS (Agronomist Module)
-- =================================================================================

CREATE TABLE IF NOT EXISTS blogs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    author_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    cover_image_url VARCHAR(255),
    blog_type ENUM('NORMAL', 'TIP') DEFAULT 'NORMAL',
    is_published BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_tags (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    blog_id BIGINT NOT NULL,
    tag VARCHAR(50) NOT NULL,
    FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    blog_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================================
-- 10. REVIEWS
-- =================================================================================

CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reviewer_id BIGINT NOT NULL,
    target_user_id BIGINT NOT NULL, -- Farmer being reviewed
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    FOREIGN KEY (target_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================================
-- 10. SYSTEM CONFIGURATION
-- =================================================================================

CREATE TABLE IF NOT EXISTS app_configs (
    config_key VARCHAR(50) PRIMARY KEY,
    config_value TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;


-- =================================================================================
-- ESSENTIAL DATA (Required for application to function)
-- =================================================================================

-- Roles are required for authorization
INSERT INTO roles (name) VALUES 
('ROLE_FARMER'), ('ROLE_BUYER'), ('ROLE_AGRONOMIST'), ('ROLE_ADMIN'), ('ROLE_GENERAL_CUSTOMER')
ON DUPLICATE KEY UPDATE name=name;


-- =================================================================================
-- MIGRATION SCRIPT: Add location columns if they don't exist
-- =================================================================================

-- Add division column if not exists
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                      WHERE TABLE_SCHEMA = 'agro_connect' 
                      AND TABLE_NAME = 'users' 
                      AND COLUMN_NAME = 'division');
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE users ADD COLUMN division VARCHAR(50) AFTER phone', 
    'SELECT "division column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add upazila column if not exists
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                      WHERE TABLE_SCHEMA = 'agro_connect' 
                      AND TABLE_NAME = 'users' 
                      AND COLUMN_NAME = 'upazila');
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE users ADD COLUMN upazila VARCHAR(50) AFTER district', 
    'SELECT "upazila column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add thana column if not exists
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                      WHERE TABLE_SCHEMA = 'agro_connect' 
                      AND TABLE_NAME = 'users' 
                      AND COLUMN_NAME = 'thana');
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE users ADD COLUMN thana VARCHAR(50) AFTER upazila', 
    'SELECT "thana column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add post_code column if not exists
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                      WHERE TABLE_SCHEMA = 'agro_connect' 
                      AND TABLE_NAME = 'users' 
                      AND COLUMN_NAME = 'post_code');
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE users ADD COLUMN post_code VARCHAR(10) AFTER thana', 
    'SELECT "post_code column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add country column if not exists
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                      WHERE TABLE_SCHEMA = 'agro_connect' 
                      AND TABLE_NAME = 'users' 
                      AND COLUMN_NAME = 'country');
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE users ADD COLUMN country VARCHAR(50) DEFAULT ''Bangladesh'' AFTER phone', 
    'SELECT "country column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =================================================================================
-- MIGRATION: Add pricing columns to crops table
-- =================================================================================

-- Add wholesale_price column
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                      WHERE TABLE_SCHEMA = 'agro_connect' 
                      AND TABLE_NAME = 'crops' 
                      AND COLUMN_NAME = 'wholesale_price');
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE crops ADD COLUMN wholesale_price DECIMAL(10,2) AFTER min_price', 
    'SELECT "wholesale_price column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add min_wholesale_qty column
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                      WHERE TABLE_SCHEMA = 'agro_connect' 
                      AND TABLE_NAME = 'crops' 
                      AND COLUMN_NAME = 'min_wholesale_qty');
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE crops ADD COLUMN min_wholesale_qty DECIMAL(10,2) DEFAULT 80.00 AFTER wholesale_price', 
    'SELECT "min_wholesale_qty column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add retail_price column
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                      WHERE TABLE_SCHEMA = 'agro_connect' 
                      AND TABLE_NAME = 'crops' 
                      AND COLUMN_NAME = 'retail_price');
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE crops ADD COLUMN retail_price DECIMAL(10,2) AFTER min_wholesale_qty', 
    'SELECT "retail_price column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add min_retail_qty column
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                      WHERE TABLE_SCHEMA = 'agro_connect' 
                      AND TABLE_NAME = 'crops' 
                      AND COLUMN_NAME = 'min_retail_qty');
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE crops ADD COLUMN min_retail_qty DECIMAL(10,2) DEFAULT 0.10 AFTER retail_price', 
    'SELECT "min_retail_qty column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add max_retail_qty column
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                      WHERE TABLE_SCHEMA = 'agro_connect' 
                      AND TABLE_NAME = 'crops' 
                      AND COLUMN_NAME = 'max_retail_qty');
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE crops ADD COLUMN max_retail_qty DECIMAL(10,2) DEFAULT 10.00 AFTER min_retail_qty', 
    'SELECT "max_retail_qty column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add profit_margin_percent column
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                      WHERE TABLE_SCHEMA = 'agro_connect' 
                      AND TABLE_NAME = 'crops' 
                      AND COLUMN_NAME = 'profit_margin_percent');
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE crops ADD COLUMN profit_margin_percent DECIMAL(5,2) DEFAULT 25.00 AFTER max_retail_qty', 
    'SELECT "profit_margin_percent column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add fixed_cost_per_unit column
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                      WHERE TABLE_SCHEMA = 'agro_connect' 
                      AND TABLE_NAME = 'crops' 
                      AND COLUMN_NAME = 'fixed_cost_per_unit');
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE crops ADD COLUMN fixed_cost_per_unit DECIMAL(10,2) DEFAULT 5.00 AFTER profit_margin_percent', 
    'SELECT "fixed_cost_per_unit column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing crops to set wholesale_price = min_price * 1.05
UPDATE crops SET wholesale_price = min_price * 1.05 WHERE wholesale_price IS NULL;

-- =================================================================================
-- MIGRATION: Enable all users (remove disabled state)
-- =================================================================================

-- Update all users to be verified and email verified
UPDATE users SET is_verified = TRUE, email_verified = TRUE WHERE is_verified = FALSE OR email_verified = FALSE;

-- =================================================================================
-- MIGRATION: E-Commerce Enhancements
-- =================================================================================

-- Add marketplace_type column to crops table
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                      WHERE TABLE_SCHEMA = 'agro_connect' 
                      AND TABLE_NAME = 'crops' 
                      AND COLUMN_NAME = 'marketplace_type');
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE crops ADD COLUMN marketplace_type ENUM(''B2B'', ''RETAIL'', ''BOTH'') DEFAULT ''BOTH'' AFTER location', 
    'SELECT "marketplace_type column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add delivery_status column to orders table
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                      WHERE TABLE_SCHEMA = 'agro_connect' 
                      AND TABLE_NAME = 'orders' 
                      AND COLUMN_NAME = 'delivery_status');
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE orders ADD COLUMN delivery_status ENUM(''PENDING'', ''PROCESSING'', ''SHIPPED'', ''OUT_FOR_DELIVERY'', ''DELIVERED'', ''CANCELLED'') DEFAULT ''PENDING'' AFTER status', 
    'SELECT "delivery_status column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add customer_mobile column to orders table
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                      WHERE TABLE_SCHEMA = 'agro_connect' 
                      AND TABLE_NAME = 'orders' 
                      AND COLUMN_NAME = 'customer_mobile');
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE orders ADD COLUMN customer_mobile VARCHAR(15) AFTER delivery_status', 
    'SELECT "customer_mobile column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add customer_address column to orders table
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                      WHERE TABLE_SCHEMA = 'agro_connect' 
                      AND TABLE_NAME = 'orders' 
                      AND COLUMN_NAME = 'customer_address');
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE orders ADD COLUMN customer_address TEXT AFTER customer_mobile', 
    'SELECT "customer_address column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create cart table
CREATE TABLE IF NOT EXISTS cart (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    crop_id BIGINT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
    price_at_addition DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
    FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE CASCADE,
    INDEX idx_cart_id (cart_id),
    INDEX idx_crop_id (crop_id),
    UNIQUE KEY unique_cart_crop (cart_id, crop_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create customer_addresses table
CREATE TABLE IF NOT EXISTS customer_addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    post_code VARCHAR(10),
    phone VARCHAR(15) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create platform_income table
CREATE TABLE IF NOT EXISTS platform_income (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    fee_percentage DECIMAL(5,2) DEFAULT 2.00,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_recorded_at (recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================================
-- MIGRATION: Add bidding columns to bids table
-- =================================================================================

-- Add quantity column to bids
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                      WHERE TABLE_SCHEMA = 'agro_connect' 
                      AND TABLE_NAME = 'bids' 
                      AND COLUMN_NAME = 'quantity');
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE bids ADD COLUMN quantity DECIMAL(10,2) NOT NULL DEFAULT 80.00 AFTER amount', 
    'SELECT "quantity column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add farmer_counter_price column to bids
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                      WHERE TABLE_SCHEMA = 'agro_connect' 
                      AND TABLE_NAME = 'bids' 
                      AND COLUMN_NAME = 'farmer_counter_price');
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE bids ADD COLUMN farmer_counter_price DECIMAL(10,2) AFTER quantity', 
    'SELECT "farmer_counter_price column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add last_action_by column to bids
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                      WHERE TABLE_SCHEMA = 'agro_connect' 
                      AND TABLE_NAME = 'bids' 
                      AND COLUMN_NAME = 'last_action_by');
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE bids ADD COLUMN last_action_by ENUM(''BUYER'', ''FARMER'') DEFAULT ''BUYER'' AFTER farmer_counter_price', 
    'SELECT "last_action_by column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add updated_at column to bids
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                      WHERE TABLE_SCHEMA = 'agro_connect' 
                      AND TABLE_NAME = 'bids' 
                      AND COLUMN_NAME = 'updated_at');
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE bids ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER bid_time', 
    'SELECT "updated_at column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;
