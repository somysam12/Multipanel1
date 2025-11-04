const express = require('express');
const router = express.Router();

module.exports = (db) => {
  
  router.delete('/mods/:id', async (req, res) => {
    try {
      await db.deleteMod(req.params.id);
      res.json({ success: true, message: 'Mod deleted successfully' });
    } catch (error) {
      console.error('Error deleting mod:', error);
      res.status(500).json({ error: 'Failed to delete mod' });
    }
  });

  router.get('/license-keys/all', async (req, res) => {
    try {
      const keys = await db.getAllLicenseKeys();
      res.json({ keys });
    } catch (error) {
      console.error('Error fetching keys:', error);
      res.status(500).json({ error: 'Failed to fetch license keys' });
    }
  });

  router.get('/license-keys/mod/:modId', async (req, res) => {
    try {
      const keys = await db.getLicenseKeysByMod(req.params.modId);
      res.json({ keys });
    } catch (error) {
      console.error('Error fetching keys:', error);
      res.status(500).json({ error: 'Failed to fetch license keys' });
    }
  });

  router.delete('/license-keys/:id', async (req, res) => {
    try {
      await db.deleteLicenseKey(req.params.id);
      res.json({ success: true, message: 'License key deleted successfully' });
    } catch (error) {
      console.error('Error deleting key:', error);
      res.status(500).json({ error: 'Failed to delete license key' });
    }
  });

  router.delete('/license-keys/delete-all', async (req, res) => {
    try {
      const result = await db.deleteAllLicenseKeys();
      res.json({ success: true, count: result.count, message: `Deleted ${result.count} license keys` });
    } catch (error) {
      console.error('Error deleting all keys:', error);
      res.status(500).json({ error: 'Failed to delete license keys' });
    }
  });

  router.delete('/license-keys/delete-by-mod/:modId', async (req, res) => {
    try {
      const result = await db.deleteLicenseKeysByMod(req.params.modId);
      res.json({ success: true, count: result.count, message: `Deleted ${result.count} license keys` });
    } catch (error) {
      console.error('Error deleting keys by mod:', error);
      res.status(500).json({ error: 'Failed to delete license keys' });
    }
  });

  router.get('/purchases/all', async (req, res) => {
    try {
      const purchases = await db.getAllPurchases();
      res.json({ purchases });
    } catch (error) {
      console.error('Error fetching purchases:', error);
      res.status(500).json({ error: 'Failed to fetch purchases' });
    }
  });

  router.get('/users/search', async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || q.length < 2) {
        return res.status(400).json({ error: 'Search term must be at least 2 characters' });
      }
      const users = await db.searchUsers(q);
      res.json({ users });
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ error: 'Failed to search users' });
    }
  });

  router.post('/users/:userId/balance', async (req, res) => {
    try {
      const { amount } = req.body;
      const result = await db.updateUserBalance(req.params.userId, amount);
      res.json({ success: true, newBalance: result.balance });
    } catch (error) {
      console.error('Error updating balance:', error);
      res.status(500).json({ error: 'Failed to update balance' });
    }
  });

  router.post('/users/:userId/device-limit', async (req, res) => {
    try {
      const { limit } = req.body;
      const result = await db.updateDeviceLimit(req.params.userId, limit);
      res.json({ success: true, newLimit: result.device_ip_limit });
    } catch (error) {
      console.error('Error updating device limit:', error);
      res.status(500).json({ error: 'Failed to update device limit' });
    }
  });

  router.get('/referrals/all', async (req, res) => {
    try {
      const referrals = await db.getAllReferralCodes();
      res.json({ referrals });
    } catch (error) {
      console.error('Error fetching referrals:', error);
      res.status(500).json({ error: 'Failed to fetch referrals' });
    }
  });

  router.get('/referrals/:code/stats', async (req, res) => {
    try {
      const stats = await db.getReferralCodeStats(req.params.code);
      res.json({ stats });
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      res.status(500).json({ error: 'Failed to fetch referral stats' });
    }
  });

  router.post('/users/:userId/check-device', async (req, res) => {
    try {
      const { ipAddress } = req.body;
      const device = await db.checkUserDevice(req.params.userId, ipAddress);
      
      if (device) {
        await db.updateDeviceLogin(req.params.userId, ipAddress);
        res.json({ allowed: true, device });
      } else {
        const user = await db.getUserById(req.params.userId);
        const activeDevices = await db.getUserActiveDevices(req.params.userId);
        
        if (activeDevices.length >= user.device_ip_limit) {
          return res.json({ 
            allowed: false, 
            needsReset: true,
            message: 'Device limit reached. Please reset your IP to login from a new device.' 
          });
        }
        
        await db.addUserDevice(req.params.userId, ipAddress, req.headers['user-agent']);
        res.json({ allowed: true, newDevice: true });
      }
    } catch (error) {
      console.error('Error checking device:', error);
      res.status(500).json({ error: 'Failed to check device' });
    }
  });

  router.get('/users/:userId/can-reset-ip', async (req, res) => {
    try {
      const result = await db.canResetIP(req.params.userId);
      res.json(result);
    } catch (error) {
      console.error('Error checking IP reset:', error);
      res.status(500).json({ error: 'Failed to check IP reset status' });
    }
  });

  router.post('/users/:userId/reset-ip', async (req, res) => {
    try {
      const { oldIP, newIP } = req.body;
      
      const canReset = await db.canResetIP(req.params.userId);
      if (!canReset.canReset) {
        const hoursLeft = Math.ceil((canReset.nextResetAt - new Date()) / (1000 * 60 * 60));
        return res.status(429).json({ 
          error: `You can reset your IP in ${hoursLeft} hours`,
          nextResetAt: canReset.nextResetAt
        });
      }
      
      const result = await db.resetUserIP(req.params.userId, oldIP, newIP);
      res.json({ 
        success: true, 
        message: 'IP reset successfully',
        nextResetAllowed: result.nextResetAllowed
      });
    } catch (error) {
      console.error('Error resetting IP:', error);
      res.status(500).json({ error: 'Failed to reset IP' });
    }
  });

  return router;
};
