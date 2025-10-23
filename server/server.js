const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(bodyParser.json());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (user.is_blocked) {
    return res.status(403).json({ error: 'Account is blocked' });
  }

  const validPassword = bcrypt.compareSync(password, user.password);
  
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, is_admin: user.is_admin },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      balance: user.balance,
      is_admin: user.is_admin
    }
  });
});

app.post('/api/register', (req, res) => {
  const { username, password, referralCode } = req.body;

  if (!referralCode) {
    return res.status(400).json({ error: 'Referral code required' });
  }

  const referral = db.prepare('SELECT * FROM referrals WHERE code = ? AND is_used = 0').get(referralCode);
  
  if (!referral) {
    return res.status(400).json({ error: 'Invalid or used referral code' });
  }

  const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  
  if (existingUser) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const result = db.prepare(
      'INSERT INTO users (username, password, balance, referred_by) VALUES (?, ?, ?, ?)'
    ).run(username, hashedPassword, referral.balance, referralCode);

    db.prepare('UPDATE referrals SET is_used = 1, used_by = ? WHERE code = ?')
      .run(result.lastInsertRowid, referralCode);

    res.json({ message: 'Account created successfully', balance: referral.balance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create account' });
  }
});

app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  const users = db.prepare('SELECT id, username, balance, is_blocked, referred_by, created_at FROM users WHERE is_admin = 0').all();
  res.json(users);
});

app.post('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  const { username, password, balance } = req.body;
  
  const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  
  if (existingUser) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    db.prepare('INSERT INTO users (username, password, balance) VALUES (?, ?, ?)')
      .run(username, hashedPassword, balance || 0);
    res.json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/admin/users/:id/balance', authenticateToken, requireAdmin, (req, res) => {
  const { balance } = req.body;
  db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(balance, req.params.id);
  res.json({ message: 'Balance updated' });
});

app.put('/api/admin/users/:id/block', authenticateToken, requireAdmin, (req, res) => {
  const { blocked } = req.body;
  db.prepare('UPDATE users SET is_blocked = ? WHERE id = ?').run(blocked ? 1 : 0, req.params.id);
  res.json({ message: blocked ? 'User blocked' : 'User unblocked' });
});

app.get('/api/admin/users/search/:username', authenticateToken, requireAdmin, (req, res) => {
  const users = db.prepare(
    'SELECT id, username, balance, is_blocked, referred_by, created_at FROM users WHERE username LIKE ? AND is_admin = 0'
  ).all(`%${req.params.username}%`);
  res.json(users);
});

app.get('/api/admin/users/:id/purchases', authenticateToken, requireAdmin, (req, res) => {
  const purchases = db.prepare(`
    SELECT p.*, pr.name as product_name, 
           pv.duration_value, pv.duration_unit, pv.price,
           pk.key_value 
    FROM purchases p
    JOIN product_variants pv ON p.variant_id = pv.id
    JOIN products pr ON pv.product_id = pr.id
    JOIN product_keys pk ON p.key_id = pk.id
    WHERE p.user_id = ?
    ORDER BY p.purchased_at DESC
  `).all(req.params.id);
  res.json(purchases);
});

app.get('/api/admin/products', authenticateToken, requireAdmin, (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  const productsWithVariants = products.map(product => {
    const variants = db.prepare(`
      SELECT v.*, 
             (SELECT COUNT(*) FROM product_keys WHERE variant_id = v.id AND is_used = 0) as available_keys,
             (SELECT COUNT(*) FROM product_keys WHERE variant_id = v.id) as total_keys
      FROM product_variants v 
      WHERE v.product_id = ? 
      ORDER BY v.duration_value
    `).all(product.id);
    return { ...product, variants };
  });
  res.json(productsWithVariants);
});

app.post('/api/admin/products', authenticateToken, requireAdmin, (req, res) => {
  const { name, description, variants } = req.body;
  
  if (!variants || variants.length === 0) {
    return res.status(400).json({ error: 'At least one variant is required' });
  }

  try {
    const result = db.prepare('INSERT INTO products (name, description) VALUES (?, ?)')
      .run(name, description);
    
    const productId = result.lastInsertRowid;
    const variantStmt = db.prepare('INSERT INTO product_variants (product_id, duration_value, duration_unit, price) VALUES (?, ?, ?, ?)');
    
    variants.forEach(variant => {
      variantStmt.run(productId, variant.duration_value, variant.duration_unit, variant.price);
    });
    
    res.json({ message: 'Product created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.delete('/api/admin/products/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.get('/api/admin/variants/:id/keys', authenticateToken, requireAdmin, (req, res) => {
  const keys = db.prepare('SELECT * FROM product_keys WHERE variant_id = ? ORDER BY is_used, id DESC').all(req.params.id);
  res.json(keys);
});

app.post('/api/admin/variants/:id/keys', authenticateToken, requireAdmin, (req, res) => {
  const { keys } = req.body;
  
  try {
    const stmt = db.prepare('INSERT INTO product_keys (variant_id, key_value) VALUES (?, ?)');
    keys.forEach(key => {
      stmt.run(req.params.id, key);
    });
    res.json({ message: 'Keys added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add keys' });
  }
});

app.delete('/api/admin/variants/:variantId/keys/:keyId', authenticateToken, requireAdmin, (req, res) => {
  try {
    db.prepare('DELETE FROM product_keys WHERE id = ?').run(req.params.keyId);
    res.json({ message: 'Key deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete key' });
  }
});

app.delete('/api/admin/variants/:variantId/keys', authenticateToken, requireAdmin, (req, res) => {
  try {
    db.prepare('DELETE FROM product_keys WHERE variant_id = ?').run(req.params.variantId);
    res.json({ message: 'All keys deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete keys' });
  }
});

app.get('/api/admin/referrals', authenticateToken, requireAdmin, (req, res) => {
  const referrals = db.prepare(`
    SELECT r.*, u.username as used_by_username 
    FROM referrals r
    LEFT JOIN users u ON r.used_by = u.id
    ORDER BY r.created_at DESC
  `).all();
  res.json(referrals);
});

app.post('/api/admin/referrals', authenticateToken, requireAdmin, (req, res) => {
  const { balance } = req.body;
  const code = 'REF' + Math.random().toString(36).substring(2, 10).toUpperCase();
  
  try {
    db.prepare('INSERT INTO referrals (code, balance, created_by) VALUES (?, ?, ?)')
      .run(code, balance, req.user.id);
    res.json({ code, balance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create referral' });
  }
});

app.get('/api/products', authenticateToken, (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  const productsWithVariants = products.map(product => {
    const variants = db.prepare(`
      SELECT v.*, 
             (SELECT COUNT(*) FROM product_keys WHERE variant_id = v.id AND is_used = 0) as available_keys
      FROM product_variants v 
      WHERE v.product_id = ? 
      ORDER BY v.duration_value
    `).all(product.id);
    const hasAvailableKeys = variants.some(v => v.available_keys > 0);
    return { ...product, variants, available: hasAvailableKeys };
  });
  res.json(productsWithVariants);
});

app.post('/api/purchase/:variantId', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const variantId = req.params.variantId;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const variant = db.prepare(`
    SELECT v.*, p.name as product_name 
    FROM product_variants v 
    JOIN products p ON v.product_id = p.id 
    WHERE v.id = ?
  `).get(variantId);
  
  if (!variant) {
    return res.status(404).json({ error: 'Product variant not found' });
  }

  if (user.balance < variant.price) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  const availableKey = db.prepare('SELECT * FROM product_keys WHERE variant_id = ? AND is_used = 0 LIMIT 1').get(variantId);
  
  if (!availableKey) {
    return res.status(400).json({ error: 'Product out of stock' });
  }

  try {
    db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').run(variant.price, userId);
    db.prepare('UPDATE product_keys SET is_used = 1, used_by = ?, used_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(userId, availableKey.id);
    db.prepare('INSERT INTO purchases (user_id, variant_id, key_id, amount) VALUES (?, ?, ?, ?)')
      .run(userId, variantId, availableKey.id, variant.price);

    res.json({ 
      message: 'Purchase successful', 
      key: availableKey.key_value,
      newBalance: user.balance - variant.price
    });
  } catch (error) {
    res.status(500).json({ error: 'Purchase failed' });
  }
});

app.get('/api/user/purchases', authenticateToken, (req, res) => {
  const purchases = db.prepare(`
    SELECT p.*, 
           pr.name as product_name, 
           pv.duration_value, pv.duration_unit,
           pk.key_value 
    FROM purchases p
    JOIN product_variants pv ON p.variant_id = pv.id
    JOIN products pr ON pv.product_id = pr.id
    JOIN product_keys pk ON p.key_id = pk.id
    WHERE p.user_id = ?
    ORDER BY p.purchased_at DESC
  `).all(req.user.id);
  res.json(purchases);
});

app.get('/api/user/profile', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, username, balance, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

app.get('/api/user/wallet-history', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  
  const moneyUsed = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total 
    FROM purchases 
    WHERE user_id = ?
  `).get(req.user.id);

  const moneyAdded = user.balance + moneyUsed.total;

  res.json({
    moneyAdded: moneyAdded,
    moneyUsed: moneyUsed.total,
    netBalance: user.balance
  });
});

app.listen(PORT, 'localhost', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
