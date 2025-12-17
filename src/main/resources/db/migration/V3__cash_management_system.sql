-- Cash Management System Tables

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Transactions table for wallet transaction history
CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    wallet_id BIGINT NOT NULL,
    type ENUM('CREDIT', 'DEBIT') NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    source ENUM('SALE', 'CASHOUT', 'REFUND', 'BONUS', 'ADJUSTMENT') NOT NULL,
    reference_id BIGINT,
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
    INDEX idx_wallet_id (wallet_id),
    INDEX idx_created_at (created_at),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Cashout requests table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- DEMO DATA - Create wallets and sample transactions for testing
-- ============================================================================

-- Create wallets for existing farmers with demo balances
INSERT INTO wallets (user_id, balance, total_earned, total_withdrawn)
SELECT u.id, 
    CASE 
        WHEN u.id % 3 = 0 THEN 15000.00
        WHEN u.id % 3 = 1 THEN 8500.00
        ELSE 6200.00
    END as balance,
    CASE 
        WHEN u.id % 3 = 0 THEN 20000.00
        WHEN u.id % 3 = 1 THEN 12000.00
        ELSE 8000.00
    END as total_earned,
    CASE 
        WHEN u.id % 3 = 0 THEN 5000.00
        WHEN u.id % 3 = 1 THEN 3500.00
        ELSE 1800.00
    END as total_withdrawn
FROM users u
WHERE u.role = 'ROLE_FARMER'
AND NOT EXISTS (SELECT 1 FROM wallets w WHERE w.user_id = u.id);

-- Insert sample transactions for demo wallets
INSERT INTO transactions (wallet_id, type, amount, source, description, created_at)
SELECT 
    w.id,
    'CREDIT',
    2500.00,
    'SALE',
    'Payment from crop sale - Aman Rice (500kg)',
    DATE_SUB(NOW(), INTERVAL 5 DAY)
FROM wallets w
WHERE w.user_id IN (SELECT id FROM users WHERE role = 'ROLE_FARMER')
LIMIT 3;

INSERT INTO transactions (wallet_id, type, amount, source, description, created_at)
SELECT 
    w.id,
    'CREDIT',
    3200.00,
    'SALE',
    'Payment from crop sale - Organic Tomatoes (200kg)',
    DATE_SUB(NOW(), INTERVAL 3 DAY)
FROM wallets w
WHERE w.user_id IN (SELECT id FROM users WHERE role = 'ROLE_FARMER')
LIMIT 2
OFFSET 1;

INSERT INTO transactions (wallet_id, type, amount, source, description, created_at)
SELECT 
    w.id,
    'DEBIT',
    2000.00,
    'CASHOUT',
    'Cashout to bKash Account',
    DATE_SUB(NOW(), INTERVAL 2 DAY)
FROM wallets w
WHERE w.user_id IN (SELECT id FROM users WHERE role = 'ROLE_FARMER')
LIMIT 1;

INSERT INTO transactions (wallet_id, type, amount, source, description, created_at)
SELECT 
    w.id,
    'CREDIT',
    500.00,
    'BONUS',
    'Early seller bonus for this month',
    DATE_SUB(NOW(), INTERVAL 1 DAY)
FROM wallets w
WHERE w.user_id IN (SELECT id FROM users WHERE role = 'ROLE_FARMER')
LIMIT 2;

-- Insert sample cashout requests with different statuses
-- PENDING requests
INSERT INTO cashout_requests (user_id, amount, payment_method, account_details, status, requested_at)
SELECT 
    u.id,
    5000.00,
    'BKASH',
    '01712345678 - Abdul Karim',
    'PENDING',
    DATE_SUB(NOW(), INTERVAL 2 HOUR)
FROM users u
WHERE u.role = 'ROLE_FARMER'
LIMIT 1;

INSERT INTO cashout_requests (user_id, amount, payment_method, account_details, status, requested_at)
SELECT 
    u.id,
    3500.00,
    'NAGAD',
    '01812345678 - Rahim Uddin',
    'PENDING',
    DATE_SUB(NOW(), INTERVAL 5 HOUR)
FROM users u
WHERE u.role = 'ROLE_FARMER'
LIMIT 1
OFFSET 1;

-- APPROVED request with invoice
INSERT INTO cashout_requests (user_id, amount, payment_method, account_details, status, admin_note, invoice_url, requested_at, processed_at, processed_by)
SELECT 
    u.id,
    2000.00,
    'BKASH',
    '01912345678 - Jamal Hossain',
    'APPROVED',
    'Approved for processing',
    '/invoices/INV-2024-001.pdf',
    DATE_SUB(NOW(), INTERVAL 1 DAY),
    DATE_SUB(NOW(), INTERVAL 6 HOUR),
    (SELECT id FROM users WHERE role = 'ROLE_ADMIN' LIMIT 1)
FROM users u
WHERE u.role = 'ROLE_FARMER'
LIMIT 1
OFFSET 2;

-- PAID request
INSERT INTO cashout_requests (user_id, amount, payment_method, account_details, status, admin_note, invoice_url, transaction_ref, requested_at, processed_at, processed_by)
SELECT 
    u.id,
    1500.00,
    'ROCKET',
    '01612345678 - Kamal Ahmed',
    'PAID',
    'Payment completed successfully',
    '/invoices/INV-2024-002.pdf',
    'TXN-ROCKET-20240314-12345',
    DATE_SUB(NOW(), INTERVAL 3 DAY),
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    (SELECT id FROM users WHERE role = 'ROLE_ADMIN' LIMIT 1)
FROM users u
WHERE u.role = 'ROLE_FARMER'
LIMIT 1
OFFSET 3;

-- REJECTED request
INSERT INTO cashout_requests (user_id, amount, payment_method, account_details, status, admin_note, requested_at, processed_at, processed_by)
SELECT 
    u.id,
    10000.00,
    'BANK',
    'Bank AC: 1234567890 - DBBL',
    'REJECTED',
    'Insufficient documentation provided. Please submit bank statement.',
    DATE_SUB(NOW(), INTERVAL 4 DAY),
    DATE_SUB(NOW(), INTERVAL 3 DAY),
    (SELECT id FROM users WHERE role = 'ROLE_ADMIN' LIMIT 1)
FROM users u
WHERE u.role = 'ROLE_FARMER'
LIMIT 1
OFFSET 4;

-- Verification queries
SELECT 'Wallets created:' as info, COUNT(*) as count FROM wallets;
SELECT 'Transactions created:' as info, COUNT(*) as count FROM transactions;
SELECT 'Cashout requests created:' as info, COUNT(*) as count FROM cashout_requests;
SELECT 'Pending cashouts:' as info, COUNT(*) as count FROM cashout_requests WHERE status = 'PENDING';
SELECT 'Total wallet balance:' as info, SUM(balance) as total FROM wallets;
