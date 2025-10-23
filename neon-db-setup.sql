-- Multipanel Database Schema for Neon PostgreSQL
-- Run these queries in your Neon DB console

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    balance DECIMAL(10, 2) DEFAULT 0,
    is_admin BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    referred_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Keys Table
CREATE TABLE IF NOT EXISTS product_keys (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    key_value TEXT NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_by INTEGER,
    used_at TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (used_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Purchases Table
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    key_id INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (key_id) REFERENCES product_keys(id) ON DELETE CASCADE
);

-- Referrals Table
CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    balance DECIMAL(10, 2) DEFAULT 0,
    is_used BOOLEAN DEFAULT FALSE,
    created_by INTEGER NOT NULL,
    used_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (used_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_product_keys_product_id ON product_keys(product_id);
CREATE INDEX idx_product_keys_is_used ON product_keys(is_used);
CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_referrals_code ON referrals(code);

-- Insert default admin user (password: admin123)
-- Password hash is bcrypt hash of "admin123"
INSERT INTO users (username, password, is_admin) 
VALUES ('admin', '$2a$10$K7VqGKZ3XqJ0C5xZ0VqGKZ3XqJ0C5xZ0VqGKZ3XqJ0C5xZ0VqGKZ.', TRUE)
ON CONFLICT (username) DO NOTHING;

-- Note: You'll need to hash the password properly in your application
-- The above hash is just a placeholder. Run this after setting up your backend:
-- Use bcrypt to hash "admin123" and update the password field
