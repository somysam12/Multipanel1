-- ========================================
-- COMPLETE MULTIHACK PANEL DATABASE SETUP
-- For Neon PostgreSQL & Vercel Deployment
-- ========================================
-- Run this ENTIRE file in your Neon DB SQL Editor
-- After running this, redeploy to Vercel and everything will work!

-- Drop all existing tables (CLEAN START)
DROP TABLE IF EXISTS user_ip_resets CASCADE;
DROP TABLE IF EXISTS user_devices CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS license_keys CASCADE;
DROP TABLE IF EXISTS user_referrals CASCADE;
DROP TABLE IF EXISTS referral_codes CASCADE;
DROP TABLE IF EXISTS mods CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop old tables if they exist
DROP TABLE IF EXISTS product_keys CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;

-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- USERS TABLE
-- ========================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    is_admin BOOLEAN DEFAULT FALSE,
    referral_code VARCHAR(20) UNIQUE,
    device_ip_limit INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_is_admin ON users(is_admin);

-- ========================================
-- MODS TABLE (Game Mods/APKs)
-- ========================================
CREATE TABLE mods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    version VARCHAR(20),
    apk_url TEXT,
    icon_url TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mods_name ON mods(name);
CREATE INDEX idx_mods_created_by ON mods(created_by);

-- ========================================
-- REFERRAL CODES TABLE
-- ========================================
CREATE TABLE referral_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    reward_amount DECIMAL(10, 2) DEFAULT 0.00,
    max_uses INTEGER DEFAULT NULL,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT NULL
);

CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referral_codes_created_by ON referral_codes(created_by);
CREATE INDEX idx_referral_codes_is_active ON referral_codes(is_active);

-- ========================================
-- USER REFERRALS TRACKING
-- ========================================
CREATE TABLE user_referrals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    referral_code_id INTEGER REFERENCES referral_codes(id) ON DELETE SET NULL,
    referral_code VARCHAR(20) NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX idx_user_referrals_user_id ON user_referrals(user_id);
CREATE INDEX idx_user_referrals_code_id ON user_referrals(referral_code_id);
CREATE INDEX idx_user_referrals_code ON user_referrals(referral_code);

-- ========================================
-- LICENSE KEYS TABLE
-- ========================================
CREATE TABLE license_keys (
    id SERIAL PRIMARY KEY,
    key_value VARCHAR(100) UNIQUE NOT NULL,
    mod_id INTEGER REFERENCES mods(id) ON DELETE CASCADE,
    duration_days INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    used_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT NULL
);

CREATE INDEX idx_license_keys_mod_id ON license_keys(mod_id);
CREATE INDEX idx_license_keys_is_used ON license_keys(is_used);
CREATE INDEX idx_license_keys_used_by ON license_keys(used_by);
CREATE INDEX idx_license_keys_key_value ON license_keys(key_value);

-- ========================================
-- PURCHASES TABLE
-- ========================================
CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    mod_id INTEGER REFERENCES mods(id) ON DELETE SET NULL,
    license_key_id INTEGER REFERENCES license_keys(id) ON DELETE SET NULL,
    key_value VARCHAR(100),
    mod_name VARCHAR(100),
    duration_days INTEGER,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type VARCHAR(20) DEFAULT 'purchase',
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_purchases_mod_id ON purchases(mod_id);
CREATE INDEX idx_purchases_created_at ON purchases(created_at DESC);
CREATE INDEX idx_purchases_transaction_type ON purchases(transaction_type);

-- ========================================
-- USER DEVICES TABLE (IP-based security)
-- ========================================
CREATE TABLE user_devices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ip_address_hash VARCHAR(255) NOT NULL,
    device_fingerprint TEXT,
    user_agent TEXT,
    last_login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX idx_user_devices_ip_hash ON user_devices(ip_address_hash);
CREATE INDEX idx_user_devices_is_active ON user_devices(is_active);

-- ========================================
-- USER IP RESETS TABLE (24-hour cooldown)
-- ========================================
CREATE TABLE user_ip_resets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    old_ip_hash VARCHAR(255),
    new_ip_hash VARCHAR(255),
    reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    next_reset_allowed_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_user_ip_resets_user_id ON user_ip_resets(user_id);
CREATE INDEX idx_user_ip_resets_reset_at ON user_ip_resets(reset_at DESC);
CREATE INDEX idx_user_ip_resets_next_allowed ON user_ip_resets(next_reset_allowed_at);

-- ========================================
-- INSERT DEFAULT ADMIN USER
-- Username: admin
-- Password: admin123
-- ========================================
INSERT INTO users (username, password, balance, is_admin, referral_code, device_ip_limit) 
VALUES (
    'admin', 
    '$2b$10$x2KygijR5e9elVEyojJfEO7ob1gfloH3Ij2qVbM0Bi79PbSu7x2pK',
    1000.00,
    TRUE,
    'ADMIN2025',
    999
);

-- ========================================
-- INSERT SAMPLE MODS
-- ========================================
INSERT INTO mods (name, description, version, created_by) VALUES
('GTA 5 Mod Menu', 'Advanced mod menu for GTA 5 mobile with unlimited features', '2.1.0', 1),
('PUBG UC Generator', 'Generate unlimited UC for PUBG Mobile', '1.5.2', 1),
('Free Fire Diamonds', 'Get free diamonds in Free Fire', '3.0.1', 1);

-- ========================================
-- INSERT SAMPLE REFERRAL CODES
-- ========================================
INSERT INTO referral_codes (code, created_by, reward_amount, is_active) VALUES
('WELCOME2025', 1, 50.00, TRUE),
('NEWUSER100', 1, 100.00, TRUE);

-- ========================================
-- CREATE UPDATE TIMESTAMP FUNCTION
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ========================================
-- CREATE TRIGGERS FOR UPDATED_AT
-- ========================================
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mods_updated_at BEFORE UPDATE ON mods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- CREATE REFERRAL USAGE INCREMENT FUNCTION
-- ========================================
CREATE OR REPLACE FUNCTION increment_referral_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE referral_codes 
    SET current_uses = current_uses + 1 
    WHERE id = NEW.referral_code_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ========================================
-- CREATE TRIGGER FOR REFERRAL USAGE
-- ========================================
CREATE TRIGGER update_referral_usage AFTER INSERT ON user_referrals
    FOR EACH ROW EXECUTE FUNCTION increment_referral_usage();

-- ========================================
-- CREATE VIEWS FOR EASIER QUERYING
-- ========================================

-- Purchase tracking view
CREATE VIEW purchase_tracking AS
SELECT 
    p.id,
    p.user_id,
    u.username,
    p.mod_id,
    p.mod_name,
    p.key_value,
    p.duration_days,
    p.amount,
    p.transaction_type,
    p.status,
    p.created_at as purchase_date
FROM purchases p
LEFT JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC;

-- Referral usage view
CREATE VIEW referral_usage AS
SELECT 
    rc.id as referral_id,
    rc.code as referral_code,
    rc.created_by as admin_id,
    admin.username as admin_username,
    ur.user_id,
    u.username as registered_username,
    ur.registered_at,
    rc.reward_amount,
    rc.current_uses,
    rc.max_uses,
    rc.is_active
FROM referral_codes rc
LEFT JOIN users admin ON rc.created_by = admin.id
LEFT JOIN user_referrals ur ON rc.id = ur.referral_code_id
LEFT JOIN users u ON ur.user_id = u.id
ORDER BY ur.registered_at DESC;

-- Available keys by mod view
CREATE VIEW available_keys_by_mod AS
SELECT 
    m.id as mod_id,
    m.name as mod_name,
    lk.duration_days,
    COUNT(*) as available_count,
    lk.price
FROM license_keys lk
JOIN mods m ON lk.mod_id = m.id
WHERE lk.is_used = FALSE
GROUP BY m.id, m.name, lk.duration_days, lk.price
ORDER BY m.name, lk.duration_days;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================
SELECT 
    'SUCCESS! Database setup complete!' as status,
    'Admin username: admin' as admin_username,
    'Admin password: admin123' as admin_password,
    'Balance: 1000.00' as admin_balance,
    'Now add your DATABASE_URL to Vercel environment variables and redeploy!' as next_step;
