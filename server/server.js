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
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    
    const user = await db.getUser(username);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.is_admin && USE_NEON) {
      const existingDevice = await db.checkUserDevice(user.id, ipAddress);
      
      if (!existingDevice) {
        const activeDevices = await db.getUserActiveDevices(user.id);
        const deviceLimit = user.device_ip_limit || 1;
        
        if (activeDevices.length >= deviceLimit) {
          const resetInfo = await db.canResetIP(user.id);
          if (!resetInfo.canReset) {
            return res.status(403).json({ 
              error: 'Device limit reached',
              message: `You can only use ${deviceLimit} device(s). Next IP reset allowed at: ${resetInfo.nextResetAt}`,
              requiresReset: true,
              nextResetAt: resetInfo.nextResetAt
            });
          }
        }
        
        await db.addUserDevice(user.id, ipAddress, req.headers['user-agent']);
      } else {
        await db.updateDeviceLogin(user.id, ipAddress);
      }
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
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const existingUser = await db.getUser(username);
    
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.createUser(username, hashedPassword, referralCode);

    if (USE_NEON) {
      await db.addUserDevice(user.id, ipAddress, req.headers['user-agent']);
    }

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

app.get('/api/admin/referral-codes', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!USE_NEON) {
      return res.json([]);
    }
    const referrals = await db.getAllReferralCodes();
    res.json(referrals);
  } catch (error) {
    console.error('Error fetching referral codes:', error);
    res.status(500).json({ error: 'Failed to fetch referral codes' });
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

app.post('/api/user/reset-ip', authenticateToken, async (req, res) => {
  try {
    if (!USE_NEON) {
      return res.status(400).json({ error: 'IP reset not supported in this mode' });
    }

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    const resetInfo = await db.canResetIP(req.user.id);
    
    if (!resetInfo.canReset) {
      return res.status(403).json({ 
        error: 'Cannot reset IP yet',
        message: `Next reset allowed at: ${resetInfo.nextResetAt}`,
        nextResetAt: resetInfo.nextResetAt
      });
    }

    const activeDevices = await db.getUserActiveDevices(req.user.id);
    const oldIP = activeDevices[0]?.ip_address_hash || '';
    
    await db.resetUserIP(req.user.id, oldIP, ipAddress);
    await db.addUserDevice(req.user.id, ipAddress, req.headers['user-agent']);
    
    res.json({ message: 'IP reset successful', nextResetAllowed: resetInfo.nextResetAt });
  } catch (error) {
    console.error('IP reset error:', error);
    res.status(500).json({ error: 'Failed to reset IP' });
  }
});

app.get('/api/mods', authenticateToken, async (req, res) => {
  try {
    const mods = await db.getAllMods();
    res.json({ mods });
  } catch (error) {
    console.error('Error fetching mods:', error);
    res.status(500).json({ error: 'Failed to fetch mods' });
  }
});

app.delete('/api/mods/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!USE_NEON) {
      return res.status(400).json({ error: 'Not supported in this mode' });
    }
    await db.deleteMod(req.params.id);
    res.json({ success: true, message: 'Mod deleted successfully' });
  } catch (error) {
    console.error('Error deleting mod:', error);
    res.status(500).json({ error: 'Failed to delete mod' });
  }
});

app.get('/api/license-keys/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!USE_NEON) {
      return res.status(400).json({ error: 'Not supported in this mode' });
    }
    const keys = await db.getAllLicenseKeys();
    res.json({ keys });
  } catch (error) {
    console.error('Error fetching keys:', error);
    res.status(500).json({ error: 'Failed to fetch license keys' });
  }
});

app.get('/api/license-keys/mod/:modId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!USE_NEON) {
      return res.status(400).json({ error: 'Not supported in this mode' });
    }
    const keys = await db.getLicenseKeysByMod(req.params.modId);
    res.json({ keys });
  } catch (error) {
    console.error('Error fetching keys:', error);
    res.status(500).json({ error: 'Failed to fetch license keys' });
  }
});

app.delete('/api/license-keys/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!USE_NEON) {
      return res.status(400).json({ error: 'Not supported in this mode' });
    }
    await db.deleteLicenseKey(req.params.id);
    res.json({ success: true, message: 'License key deleted successfully' });
  } catch (error) {
    console.error('Error deleting key:', error);
    res.status(500).json({ error: 'Failed to delete license key' });
  }
});

app.delete('/api/license-keys/delete-all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!USE_NEON) {
      return res.status(400).json({ error: 'Not supported in this mode' });
    }
    const result = await db.deleteAllLicenseKeys();
    res.json({ success: true, count: result.count, message: `Deleted ${result.count} license keys` });
  } catch (error) {
    console.error('Error deleting all keys:', error);
    res.status(500).json({ error: 'Failed to delete license keys' });
  }
});

app.delete('/api/license-keys/delete-by-mod/:modId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!USE_NEON) {
      return res.status(400).json({ error: 'Not supported in this mode' });
    }
    const result = await db.deleteLicenseKeysByMod(req.params.modId);
    res.json({ success: true, count: result.count, message: `Deleted ${result.count} license keys` });
  } catch (error) {
    console.error('Error deleting keys by mod:', error);
    res.status(500).json({ error: 'Failed to delete license keys' });
  }
});

app.get('/api/purchases/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!USE_NEON) {
      return res.status(400).json({ error: 'Not supported in this mode' });
    }
    const purchases = await db.getAllPurchases();
    res.json({ purchases });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

app.post('/api/admin/users/:userId/device-limit', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!USE_NEON) {
      return res.status(400).json({ error: 'Not supported in this mode' });
    }
    const { limit } = req.body;
    await db.updateDeviceLimit(req.params.userId, limit);
    res.json({ success: true, message: 'Device limit updated successfully' });
  } catch (error) {
    console.error('Error updating device limit:', error);
    res.status(500).json({ error: 'Failed to update device limit' });
  }
});

app.post('/api/admin/users/:userId/balance', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { balance } = req.body;
    await db.setUserBalance(req.params.userId, balance);
    res.json({ success: true, message: 'Balance updated successfully' });
  } catch (error) {
    console.error('Error updating balance:', error);
    res.status(500).json({ error: 'Failed to update balance' });
  }
});

app.get('/api/admin/purchases', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (USE_NEON) {
      const purchases = await db.getAllPurchases();
      res.json(purchases);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
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
