const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const USE_NEON = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon');
const db = USE_NEON ? require('./database-neon') : require('./database-postgres');

const app = express();

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('FATAL: JWT_SECRET environment variable is required in production');
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-me';

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

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await db.getUser(username);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    
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
        balance: parseFloat(user.balance),
        is_admin: user.is_admin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { username, password, referralCode } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const existingUser = await db.getUser(username);
    
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.createUser(username, hashedPassword, referralCode);

    const token = jwt.sign(
      { id: user.id, username: user.username, is_admin: user.is_admin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      message: 'Account created successfully', 
      balance: parseFloat(user.balance),
      token,
      user: {
        id: user.id,
        username: user.username,
        balance: parseFloat(user.balance),
        is_admin: user.is_admin
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/admin/mods', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const mods = await db.getAllMods();
    res.json(mods);
  } catch (error) {
    console.error('Error fetching mods:', error);
    res.status(500).json({ error: 'Failed to fetch mods' });
  }
});

app.post('/api/admin/mods', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, version, apkUrl, iconUrl } = req.body;
    const mod = await db.createMod(name, description, version, apkUrl, iconUrl, req.user.id);
    res.json(mod);
  } catch (error) {
    console.error('Error creating mod:', error);
    res.status(500).json({ error: 'Failed to create mod' });
  }
});

app.post('/api/admin/license-keys', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { modId, durationDays, price, count } = req.body;
    const keys = await db.createLicenseKeys(modId, durationDays, price, count);
    res.json({ message: 'Keys created successfully', count: keys.length, keys });
  } catch (error) {
    console.error('Error creating keys:', error);
    res.status(500).json({ error: 'Failed to create license keys' });
  }
});

app.post('/api/admin/referral-codes', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { code, rewardAmount, maxUses } = req.body;
    const referral = await db.createReferralCode(code, req.user.id, rewardAmount, maxUses);
    res.json(referral);
  } catch (error) {
    console.error('Error creating referral:', error);
    res.status(500).json({ error: 'Failed to create referral code' });
  }
});

app.get('/api/user/mods', authenticateToken, async (req, res) => {
  try {
    const mods = await db.getAllMods();
    res.json(mods);
  } catch (error) {
    console.error('Error fetching mods:', error);
    res.status(500).json({ error: 'Failed to fetch mods' });
  }
});

app.post('/api/user/purchase/:modId', authenticateToken, async (req, res) => {
  try {
    const result = await db.purchaseLicenseKey(req.user.id, parseInt(req.params.modId));
    res.json(result);
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/user/purchases', authenticateToken, async (req, res) => {
  try {
    const purchases = await db.getUserPurchases(req.user.id);
    res.json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

if (USE_NEON) {
  const neonRoutes = require('./routes-neon')(db);
  app.use('/api/admin', authenticateToken, requireAdmin, neonRoutes);
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: USE_NEON ? 'neon' : 'postgres' });
});

module.exports = app;
