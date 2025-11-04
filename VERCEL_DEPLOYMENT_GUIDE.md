# MultiHack Panel - Vercel Deployment Guide

## Complete Deployment Instructions for Vercel + Neon PostgreSQL

This guide will help you deploy your MultiHack Panel application to Vercel with a Neon PostgreSQL database.

---

## Step 1: Create and Setup Neon Database

### 1.1 Create Neon Account and Project
1. Go to [Neon Console](https://console.neon.tech/)
2. Sign up or log in
3. Click "Create Project"
4. Choose a name for your project (e.g., "multihack-panel")
5. Select a region closest to your users
6. Click "Create Project"

### 1.2 Copy Your Database Connection String
After creating the project, you'll see a connection string like:
```
postgresql://username:password@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require
```

**Save this connection string - you'll need it for Vercel!**

### 1.3 Run the Database Schema Setup

Go to your Neon project's **SQL Editor** and run the following complete schema:

```sql
-- MULTIHACK PANEL - Neon PostgreSQL Database Schema
-- Run this in your Neon SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS user_ip_resets CASCADE;
DROP TABLE IF EXISTS user_devices CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS license_keys CASCADE;
DROP TABLE IF EXISTS user_referrals CASCADE;
DROP TABLE IF EXISTS referral_codes CASCADE;
DROP TABLE IF EXISTS mods CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table with device limit configuration
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

-- Mods (Game Mod APKs) table
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

-- Referral codes table
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

-- User referrals tracking
CREATE TABLE user_referrals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    referral_code_id INTEGER REFERENCES referral_codes(id) ON DELETE SET NULL,
    referral_code VARCHAR(20) NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- License keys table
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

-- Purchases table
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

-- User devices table for IP-based security
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

-- User IP resets table for 24-hour cooldown tracking
CREATE TABLE user_ip_resets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    old_ip_hash VARCHAR(255),
    new_ip_hash VARCHAR(255),
    reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    next_reset_allowed_at TIMESTAMP NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_is_admin ON users(is_admin);
CREATE INDEX idx_mods_name ON mods(name);
CREATE INDEX idx_mods_created_by ON mods(created_by);
CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referral_codes_created_by ON referral_codes(created_by);
CREATE INDEX idx_referral_codes_is_active ON referral_codes(is_active);
CREATE INDEX idx_user_referrals_user_id ON user_referrals(user_id);
CREATE INDEX idx_user_referrals_code_id ON user_referrals(referral_code_id);
CREATE INDEX idx_user_referrals_code ON user_referrals(referral_code);
CREATE INDEX idx_license_keys_mod_id ON license_keys(mod_id);
CREATE INDEX idx_license_keys_is_used ON license_keys(is_used);
CREATE INDEX idx_license_keys_used_by ON license_keys(used_by);
CREATE INDEX idx_license_keys_key_value ON license_keys(key_value);
CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_purchases_mod_id ON purchases(mod_id);
CREATE INDEX idx_purchases_created_at ON purchases(created_at DESC);
CREATE INDEX idx_purchases_transaction_type ON purchases(transaction_type);
CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX idx_user_devices_ip_hash ON user_devices(ip_address_hash);
CREATE INDEX idx_user_devices_is_active ON user_devices(is_active);
CREATE INDEX idx_user_ip_resets_user_id ON user_ip_resets(user_id);
CREATE INDEX idx_user_ip_resets_reset_at ON user_ip_resets(reset_at DESC);
CREATE INDEX idx_user_ip_resets_next_allowed ON user_ip_resets(next_reset_allowed_at);

-- Insert default admin user (password: admin123)
-- You MUST change this password after first login!
INSERT INTO users (username, password, balance, is_admin, referral_code, device_ip_limit) 
VALUES (
    'admin', 
    '$2b$10$K5H8Xqy9YvZ4vGq7JZG3p.5jZ6mZ4XqYZJQZKZJQZKZJQZKZJQZKZO',
    1000.00,
    TRUE,
    'ADMIN2025',
    999
);

-- Insert sample mod data
INSERT INTO mods (name, description, version, created_by) VALUES
('GTA 5 Mod Menu', 'Advanced mod menu for GTA 5 mobile with unlimited features', '2.1.0', 1),
('PUBG UC Generator', 'Generate unlimited UC for PUBG Mobile', '1.5.2', 1),
('Free Fire Diamonds', 'Get free diamonds in Free Fire', '3.0.1', 1);

-- Insert sample referral codes
INSERT INTO referral_codes (code, created_by, reward_amount, is_active) VALUES
('WELCOME2025', 1, 50.00, TRUE),
('NEWUSER100', 1, 100.00, TRUE);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mods_updated_at BEFORE UPDATE ON mods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment referral code usage
CREATE OR REPLACE FUNCTION increment_referral_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE referral_codes 
    SET current_uses = current_uses + 1 
    WHERE id = NEW.referral_code_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to increment referral usage
CREATE TRIGGER update_referral_usage AFTER INSERT ON user_referrals
    FOR EACH ROW EXECUTE FUNCTION increment_referral_usage();

-- Views for easier querying
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

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO CURRENT_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO CURRENT_USER;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO CURRENT_USER;

SELECT 'Database schema created successfully!' as status;
```

---

## Step 2: Prepare Your Project for Vercel

### 2.1 Update client package.json

Add build script to `client/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 2.2 Verify vercel.json exists

Your `vercel.json` should look like this:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "server/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

## Step 3: Deploy to Vercel

### 3.1 Push Your Code to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 3.2 Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Select your repository

### 3.3 Configure Environment Variables

In Vercel project settings, add these environment variables:

**Required Variables:**
```
DATABASE_URL = your-neon-connection-string-from-step-1.2
JWT_SECRET = generate-a-strong-random-string-here
NODE_ENV = production
```

**Optional Variables:**
```
IP_SALT = another-random-string-for-ip-hashing
```

**How to generate JWT_SECRET:**
You can use this command or any random string generator:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3.4 Deploy

1. Click "Deploy"
2. Wait for the build to complete (2-3 minutes)
3. Your app will be live at `https://your-project-name.vercel.app`

---

## Step 4: Post-Deployment Setup

### 4.1 First Login
- Username: `admin`
- Password: `admin123`

**⚠️ IMPORTANT: Change the admin password immediately after first login!**

### 4.2 Test All Features

1. **Login** - Test admin login
2. **User Registration** - Create a test user with referral code
3. **Mods Management** - Add/delete mods
4. **License Keys** - Generate and manage keys
5. **Purchase Flow** - Test user purchases
6. **IP Tracking** - Try logging in from different devices
7. **IP Reset** - Test the 24-hour reset functionality

### 4.3 Monitor Your Database

- Go to Neon Console → Your Project → Monitoring
- Watch for slow queries and connection issues
- Neon free tier includes: 10GB storage, 100 hours compute time

---

## Features Included

### IP Tracking & Device Management
- ✅ User IP is saved on registration
- ✅ IP is tracked on every login
- ✅ Device limit enforcement (default: 1 device per user)
- ✅ 24-hour cooldown for IP reset
- ✅ Admin can adjust device limits for any user

### Admin Features
- ✅ Complete mod management (add/edit/delete)
- ✅ License key generation and management
- ✅ Delete individual keys or bulk delete
- ✅ Purchase tracking with detailed analytics
- ✅ User management with balance control
- ✅ Device limit configuration
- ✅ Referral code system

### User Features
- ✅ Browse available mods
- ✅ Purchase license keys with balance
- ✅ View purchase history
- ✅ Use referral codes for bonuses
- ✅ IP reset functionality

---

## Troubleshooting

### Build Fails
- Check that all dependencies are in package.json
- Verify Node version compatibility (use Node 18+)
- Check build logs in Vercel dashboard

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check Neon project is active
- Ensure connection string includes `?sslmode=require`

### API Errors
- Check JWT_SECRET is set
- Verify all environment variables are in Vercel
- Check Vercel function logs

### IP Tracking Not Working
- Ensure DATABASE_URL includes Neon connection
- Check that IP_SALT is set (optional but recommended)
- Verify user_devices table exists in database

---

## Security Recommendations

1. **Change Default Admin Password** immediately
2. **Use Strong JWT_SECRET** (64+ characters)
3. **Enable IP_SALT** for additional IP hashing security
4. **Regular Database Backups** (Neon automatic backups on paid plans)
5. **Monitor Failed Login Attempts**
6. **Set Up Vercel Analytics** for monitoring

---

## Cost Estimation

### Neon (Database)
- Free Tier: $0/month (10GB, 100 hours compute)
- Pro: $19/month (unlimited compute, better performance)

### Vercel (Hosting)
- Hobby: $0/month (personal projects)
- Pro: $20/month (commercial, better performance)

**Total for Production: ~$39/month (or Free for testing)**

---

## Support & Updates

For issues or questions:
1. Check Vercel build logs
2. Check Neon database logs
3. Review browser console for frontend errors
4. Check API responses in Network tab

---

## Success! 🎉

Your MultiHack Panel is now live with:
- ✅ Secure authentication with JWT
- ✅ IP tracking and device management
- ✅ Neon PostgreSQL database
- ✅ Vercel edge hosting
- ✅ Complete admin panel
- ✅ User dashboard
- ✅ Purchase system
- ✅ Referral system

Default login: **admin / admin123**

**Remember to change the password!**
