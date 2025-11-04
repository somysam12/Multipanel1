# AdminPanel.jsx Fix Guide

## Problem
AdminPanel.jsx (1630 lines) is calling wrong API endpoints which is why nothing works on the deployed website.

## Solution
Use the AdminApi.js helper module that's already created and tested.

## Step-by-Step Fix Instructions

### Step 1: Add Import
At the top of `client/src/components/AdminPanel.jsx` (around line 1-10), add:

```javascript
import AdminApi from '../api/AdminApi';
```

### Step 2: Replace Mod-Related Calls

#### Creating Mods
Find this pattern (around line 336):
```javascript
await axios.post(`${API_URL}/admin/products`, 
  { name: modName, description },
  { headers: { Authorization: `Bearer ${token}` } }
);
```

Replace with:
```javascript
await AdminApi.createMod(token, { 
  name: modName, 
  description,
  version: version || '1.0.0',
  apkUrl: apkUrl || '',
  iconUrl: iconUrl || ''
});
```

#### Fetching Mods
Find:
```javascript
const response = await axios.get(`${API_URL}/admin/products`, {
  headers: { Authorization: `Bearer ${token}` }
});
const mods = response.data;
```

Replace with:
```javascript
const mods = await AdminApi.getMods(token);
```

#### Deleting Mods
Find:
```javascript
await axios.delete(`${API_URL}/admin/products/${id}`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

Replace with:
```javascript
await AdminApi.deleteMod(token, id);
```

### Step 3: Replace License Key Calls

#### Creating License Keys
Find this pattern (around line 725):
```javascript
await axios.post(`${API_URL}/admin/variants`, {
  product_id: parseInt(selectedMod),
  duration_value: parseInt(duration),
  duration_unit: durationUnit,
  price: parseFloat(price),
  keys: keys
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

Replace with:
```javascript
await AdminApi.createLicenseKeys(token, {
  modId: parseInt(selectedMod),
  durationDays: parseInt(duration),
  price: parseFloat(price),
  count: keys.length
});
```

#### Fetching All License Keys
Find:
```javascript
const response = await axios.get(`${API_URL}/license-keys/all`, {
  headers: { Authorization: `Bearer ${token}` }
});
const keys = response.data.keys;
```

Replace with:
```javascript
const keys = await AdminApi.getAllLicenseKeys(token);
```

#### Deleting License Keys
Find:
```javascript
await axios.delete(`${API_URL}/license-keys/${keyId}`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

Replace with:
```javascript
await AdminApi.deleteLicenseKey(token, keyId);
```

### Step 4: Fix Referral System (CRITICAL)

Find this code (around line 1403):
```javascript
const generateReferralCode = () => {
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  alert(`Generated referral code: ${code}`);
};
```

Replace with:
```javascript
const generateReferralCode = async () => {
  try {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    await AdminApi.createReferralCode(token, { 
      code, 
      rewardAmount: 50,  // Default reward amount
      maxUses: null      // Unlimited uses
    });
    alert(`Generated referral code: ${code} - Saved to database!`);
    // Refresh referral list
    loadReferrals();
  } catch (error) {
    alert('Failed to create referral code: ' + error.message);
  }
};
```

Add this function to fetch referrals:
```javascript
const loadReferrals = async () => {
  try {
    const data = await AdminApi.getReferralCodes(token);
    setReferrals(data);
  } catch (error) {
    console.error('Failed to load referrals:', error);
  }
};
```

### Step 5: Fix User Management

#### Fetching Users
Find (around line 1108):
```javascript
const response = await axios.get(`${API_URL}/admin/users`, {
  headers: { Authorization: `Bearer ${token}` }
});
setUsers(response.data);
```

Replace with:
```javascript
const users = await AdminApi.getUsers(token);
setUsers(users);
```

#### Updating User Balance
Find:
```javascript
await axios.post(`${API_URL}/admin/users/${userId}/balance`, 
  { balance: newBalance },
  { headers: { Authorization: `Bearer ${token}` } }
);
```

Replace with:
```javascript
await AdminApi.updateUserBalance(token, userId, newBalance);
```

### Step 6: Fix Purchase Tracking

Find:
```javascript
const response = await axios.get(`${API_URL}/purchases/all`, {
  headers: { Authorization: `Bearer ${token}` }
});
setPurchases(response.data.purchases);
```

Replace with:
```javascript
const purchases = await AdminApi.getPurchases(token);
setPurchases(purchases);
```

## Testing After Changes

1. Save the file
2. Restart the dev server: `npm run dev` (in client folder)
3. Test each feature:
   - ✅ Create a mod
   - ✅ Add license keys
   - ✅ Create referral code
   - ✅ Manage users
   - ✅ View purchases

## Notes

- AdminApi.js handles all token headers automatically
- All endpoints return data directly (no need to access `.data`)
- Error handling is built-in but you should add try-catch blocks
- The token variable should be available in your component state

## Quick Search & Replace

Use your editor's find-and-replace (CTRL+H) with these patterns:

1. Find: `await axios.post(\`\${API_URL}/admin/products\`` 
   Replace: `await AdminApi.createMod(token, `

2. Find: `await axios.get(\`\${API_URL}/admin/products\``
   Replace: `await AdminApi.getMods(token)`

3. Find: `await axios.post(\`\${API_URL}/admin/variants\``
   Replace: `await AdminApi.createLicenseKeys(token, `

4. Find: `await axios.get(\`\${API_URL}/admin/users\``
   Replace: `await AdminApi.getUsers(token)`

Remember: After each replace, check that the function parameters match the new API!
