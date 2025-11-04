const { Pool } = require('pg');
const crypto = require('crypto');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

function hashIP(ip) {
  return crypto.createHash('sha256').update(ip + (process.env.IP_SALT || 'default_salt')).digest('hex');
}

const db = {
  query: (text, params) => pool.query(text, params),
  
  getPool: () => pool,

  async getUser(username) {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0];
  },

  async getUserById(id) {
    const result = await pool.query(
      'SELECT id, username, balance, is_admin, referral_code, device_ip_limit, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async createUser(username, hashedPassword, referralCode = null) {
    const result = await pool.query(
      `INSERT INTO users (username, password, balance, is_admin, referral_code, device_ip_limit) 
       VALUES ($1, $2, 0, FALSE, NULL, 1) 
       RETURNING id, username, balance, is_admin`,
      [username, hashedPassword]
    );
    
    const user = result.rows[0];
    
    if (referralCode) {
      const refCodeResult = await pool.query(
        'SELECT id, reward_amount FROM referral_codes WHERE code = $1 AND is_active = TRUE',
        [referralCode]
      );
      
      if (refCodeResult.rows.length > 0) {
        const refCode = refCodeResult.rows[0];
        
        await pool.query(
          'INSERT INTO user_referrals (user_id, referral_code_id, referral_code) VALUES ($1, $2, $3)',
          [user.id, refCode.id, referralCode]
        );
        
        if (refCode.reward_amount > 0) {
          await pool.query(
            'UPDATE users SET balance = balance + $1 WHERE id = $2',
            [refCode.reward_amount, user.id]
          );
          user.balance = parseFloat(refCode.reward_amount);
        }
      }
    }
    
    return user;
  },

  async getAllUsers() {
    const result = await pool.query(
      `SELECT id, username, balance, is_admin, referral_code, device_ip_limit, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );
    return result.rows;
  },

  async searchUsers(searchTerm) {
    const result = await pool.query(
      `SELECT id, username, balance, is_admin, created_at 
       FROM users 
       WHERE username ILIKE $1 
       ORDER BY username ASC 
       LIMIT 50`,
      [`%${searchTerm}%`]
    );
    return result.rows;
  },

  async updateUserBalance(userId, amount) {
    const result = await pool.query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING balance',
      [amount, userId]
    );
    return result.rows[0];
  },

  async setUserBalance(userId, newBalance) {
    const result = await pool.query(
      'UPDATE users SET balance = $1 WHERE id = $2 RETURNING balance',
      [newBalance, userId]
    );
    return result.rows[0];
  },

  async updateDeviceLimit(userId, newLimit) {
    const result = await pool.query(
      'UPDATE users SET device_ip_limit = $1 WHERE id = $2 RETURNING device_ip_limit',
      [newLimit, userId]
    );
    return result.rows[0];
  },

  async getAllMods() {
    const result = await pool.query(
      `SELECT m.*, u.username as created_by_username 
       FROM mods m 
       LEFT JOIN users u ON m.created_by = u.id 
       ORDER BY m.created_at DESC`
    );
    return result.rows;
  },

  async createMod(name, description, version, apkUrl, iconUrl, createdBy) {
    const result = await pool.query(
      `INSERT INTO mods (name, description, version, apk_url, icon_url, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [name, description, version, apkUrl, iconUrl, createdBy]
    );
    return result.rows[0];
  },

  async deleteMod(modId) {
    await pool.query('DELETE FROM mods WHERE id = $1', [modId]);
    return { success: true };
  },

  async createLicenseKeys(modId, durationDays, price, count) {
    const keys = [];
    
    for (let i = 0; i < count; i++) {
      const keyValue = this.generateLicenseKey();
      const result = await pool.query(
        `INSERT INTO license_keys (key_value, mod_id, duration_days, price, is_used) 
         VALUES ($1, $2, $3, $4, FALSE) 
         RETURNING *`,
        [keyValue, modId, durationDays, price]
      );
      keys.push(result.rows[0]);
    }
    
    return keys;
  },

  generateLicenseKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segments = 4;
    const segmentLength = 4;
    const key = [];
    
    for (let i = 0; i < segments; i++) {
      let segment = '';
      for (let j = 0; j < segmentLength; j++) {
        segment += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      key.push(segment);
    }
    
    return key.join('-');
  },

  async getAvailableKeys(modId) {
    const result = await pool.query(
      `SELECT * FROM license_keys 
       WHERE mod_id = $1 AND is_used = FALSE 
       ORDER BY created_at ASC`,
      [modId]
    );
    return result.rows;
  },

  async getAllLicenseKeys() {
    const result = await pool.query(
      `SELECT lk.*, m.name as mod_name, u.username as used_by_username 
       FROM license_keys lk 
       LEFT JOIN mods m ON lk.mod_id = m.id 
       LEFT JOIN users u ON lk.used_by = u.id 
       ORDER BY lk.created_at DESC`
    );
    return result.rows;
  },

  async getLicenseKeysByMod(modId) {
    const result = await pool.query(
      `SELECT lk.*, u.username as used_by_username 
       FROM license_keys lk 
       LEFT JOIN users u ON lk.used_by = u.id 
       WHERE lk.mod_id = $1 
       ORDER BY lk.created_at DESC`,
      [modId]
    );
    return result.rows;
  },

  async deleteLicenseKey(keyId) {
    await pool.query('DELETE FROM license_keys WHERE id = $1', [keyId]);
    return { success: true };
  },

  async deleteAllLicenseKeys() {
    const result = await pool.query('DELETE FROM license_keys RETURNING id');
    return { success: true, count: result.rowCount };
  },

  async deleteLicenseKeysByMod(modId) {
    const result = await pool.query('DELETE FROM license_keys WHERE mod_id = $1 RETURNING id', [modId]);
    return { success: true, count: result.rowCount };
  },

  async purchaseLicenseKey(userId, modId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const userResult = await client.query('SELECT balance FROM users WHERE id = $1', [userId]);
      const user = userResult.rows[0];
      
      const keyResult = await client.query(
        `SELECT * FROM license_keys 
         WHERE mod_id = $1 AND is_used = FALSE 
         ORDER BY created_at ASC 
         LIMIT 1`,
        [modId]
      );
      
      if (keyResult.rows.length === 0) {
        throw new Error('No available keys for this mod');
      }
      
      const key = keyResult.rows[0];
      
      if (user.balance < key.price) {
        throw new Error('Insufficient balance');
      }
      
      await client.query(
        'UPDATE users SET balance = balance - $1 WHERE id = $2',
        [key.price, userId]
      );
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + key.duration_days);
      
      await client.query(
        `UPDATE license_keys 
         SET is_used = TRUE, used_by = $1, used_at = CURRENT_TIMESTAMP, expires_at = $2 
         WHERE id = $3`,
        [userId, expiresAt, key.id]
      );
      
      const modResult = await client.query('SELECT name FROM mods WHERE id = $1', [modId]);
      const modName = modResult.rows[0]?.name || 'Unknown Mod';
      
      await client.query(
        `INSERT INTO purchases (user_id, mod_id, license_key_id, key_value, mod_name, duration_days, amount, transaction_type, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'purchase', 'completed')`,
        [userId, modId, key.id, key.key_value, modName, key.duration_days, key.price]
      );
      
      await client.query('COMMIT');
      
      return {
        key: key.key_value,
        expiresAt: expiresAt,
        price: key.price,
        duration: key.duration_days
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getAllPurchases() {
    const result = await pool.query(
      `SELECT * FROM purchase_tracking ORDER BY purchase_date DESC`
    );
    return result.rows;
  },

  async getUserPurchases(userId) {
    const result = await pool.query(
      `SELECT * FROM purchase_tracking WHERE user_id = $1 ORDER BY purchase_date DESC`,
      [userId]
    );
    return result.rows;
  },

  async createReferralCode(code, createdBy, rewardAmount, maxUses = null) {
    const result = await pool.query(
      `INSERT INTO referral_codes (code, created_by, reward_amount, max_uses, is_active) 
       VALUES ($1, $2, $3, $4, TRUE) 
       RETURNING *`,
      [code, createdBy, rewardAmount, maxUses]
    );
    return result.rows[0];
  },

  async getAllReferralCodes() {
    const result = await pool.query(
      `SELECT * FROM referral_usage ORDER BY registered_at DESC`
    );
    return result.rows;
  },

  async getReferralCodeStats(code) {
    const result = await pool.query(
      `SELECT * FROM referral_usage WHERE referral_code = $1`,
      [code]
    );
    return result.rows;
  },

  async checkUserDevice(userId, ipAddress) {
    const ipHash = hashIP(ipAddress);
    
    const result = await pool.query(
      `SELECT * FROM user_devices 
       WHERE user_id = $1 AND ip_address_hash = $2 AND is_active = TRUE`,
      [userId, ipHash]
    );
    
    return result.rows[0];
  },

  async getUserActiveDevices(userId) {
    const result = await pool.query(
      `SELECT * FROM user_devices 
       WHERE user_id = $1 AND is_active = TRUE 
       ORDER BY last_login_at DESC`,
      [userId]
    );
    return result.rows;
  },

  async addUserDevice(userId, ipAddress, userAgent = null) {
    const ipHash = hashIP(ipAddress);
    
    const result = await pool.query(
      `INSERT INTO user_devices (user_id, ip_address_hash, user_agent, is_active) 
       VALUES ($1, $2, $3, TRUE) 
       RETURNING *`,
      [userId, ipHash, userAgent]
    );
    
    return result.rows[0];
  },

  async updateDeviceLogin(userId, ipAddress) {
    const ipHash = hashIP(ipAddress);
    
    await pool.query(
      `UPDATE user_devices 
       SET last_login_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1 AND ip_address_hash = $2 AND is_active = TRUE`,
      [userId, ipHash]
    );
  },

  async canResetIP(userId) {
    const result = await pool.query(
      `SELECT * FROM user_ip_resets 
       WHERE user_id = $1 
       ORDER BY reset_at DESC 
       LIMIT 1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return { canReset: true, nextResetAt: null };
    }
    
    const lastReset = result.rows[0];
    const nextAllowed = new Date(lastReset.next_reset_allowed_at);
    const now = new Date();
    
    return {
      canReset: now >= nextAllowed,
      nextResetAt: nextAllowed
    };
  },

  async resetUserIP(userId, oldIP, newIP) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const oldIpHash = hashIP(oldIP);
      const newIpHash = hashIP(newIP);
      
      await client.query(
        'UPDATE user_devices SET is_active = FALSE WHERE user_id = $1',
        [userId]
      );
      
      const nextResetAllowed = new Date();
      nextResetAllowed.setHours(nextResetAllowed.getHours() + 24);
      
      await client.query(
        `INSERT INTO user_ip_resets (user_id, old_ip_hash, new_ip_hash, next_reset_allowed_at) 
         VALUES ($1, $2, $3, $4)`,
        [userId, oldIpHash, newIpHash, nextResetAllowed]
      );
      
      await client.query('COMMIT');
      
      return { success: true, nextResetAllowed };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getTransactions() {
    const result = await pool.query(
      `SELECT p.*, u.username 
       FROM purchases p 
       LEFT JOIN users u ON p.user_id = u.id 
       ORDER BY p.created_at DESC`
    );
    return result.rows;
  },

  async createTransaction(userId, amount, type, description) {
    const result = await pool.query(
      `INSERT INTO purchases (user_id, amount, transaction_type, status) 
       VALUES ($1, $2, $3, 'completed') 
       RETURNING *`,
      [userId, amount, type]
    );
    return result.rows[0];
  }
};

module.exports = db;
