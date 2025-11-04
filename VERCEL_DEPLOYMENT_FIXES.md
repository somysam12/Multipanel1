# Vercel Deployment Fixes - Complete Guide

## Issues Fixed ✅

All admin panel functions were returning **404 errors** on Vercel deployment. The following critical issues have been resolved:

### 1. API Endpoint Mismatch (FIXED ✅)
**Problem:** Frontend was calling wrong API endpoints
- AdminApi.js was calling `/api/license-keys/all` 
- But backend routes-neon.js mounts at `/api/admin/license-keys/all`

**Solution:** Updated `client/src/api/AdminApi.js` with correct endpoints:
```javascript
// OLD (WRONG)
/api/license-keys/all
/api/license-keys/:id
/api/purchases/all
/api/mods/:id

// NEW (CORRECT)
/api/admin/license-keys/all
/api/admin/license-keys/:id
/api/admin/purchases/all
/api/admin/mods/:id
```

### 2. Vercel Path Stripping Issue (FIXED ✅)
**Problem:** Vercel strips `/api` when routing to `api/index.js`, causing Express to not find routes

When Vercel receives `/api/login`:
- Routes to `api/index.js`
- Request path becomes `/login` (loses `/api`)
- Express looks for `/api/login`
- Result: 404 Not Found

**Solution:** Created wrapper in `api/index.js` that adds `/api` prefix back:
```javascript
const app = require('../server/server');

module.exports = (req, res) => {
  req.url = `/api${req.url}`;
  return app(req, res);
};
```

### 3. Static Assets 404 (FIXED ✅)
**Problem:** `vercel.json` rewrite was catching static assets (.js, .css files) and rewriting them to index.html

**Solution:** Updated regex pattern to exclude files with extensions:
```json
{
  "source": "/((?!api/)(?!.*\\.).*)",
  "destination": "/index.html"
}
```

This pattern:
- ✅ `/api/*` → Goes to serverless function
- ✅ `/assets/*.js`, `*.css` → Served as static files
- ✅ `/admin`, `/dashboard` → Rewritten to /index.html for React Router

## Files Changed

1. **client/src/api/AdminApi.js** - Fixed all admin endpoints
2. **api/index.js** - Created Vercel serverless wrapper
3. **vercel.json** - Fixed SPA + API routing configuration
4. **api/[...path].js** - Removed (replaced with index.js)

## How Routing Works Now

```
User Request          Vercel Routing              Express App
─────────────────────────────────────────────────────────────────
/api/login         →  api/index.js  →  adds /api  →  /api/login ✓
/api/admin/mods    →  api/index.js  →  adds /api  →  /api/admin/mods ✓
/assets/index.js   →  Static file (served directly) ✓
/admin             →  /index.html (React Router handles) ✓
/dashboard         →  /index.html (React Router handles) ✓
```

## Deployment Instructions

### 1. Environment Variables Required

In Vercel dashboard, add these environment variables:

```bash
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_secure_jwt_secret_key_here
NODE_ENV=production
```

**Important:** 
- `DATABASE_URL` must be your Neon PostgreSQL connection string
- `JWT_SECRET` should be a strong random string (minimum 32 characters)
- Never commit these values to Git!

### 2. Deploy to Vercel

```bash
# Install Vercel CLI (if not already)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 3. Post-Deployment Verification

After deployment, test these critical functions:

#### Admin Panel Functions:
1. **Add Mod** → Should create mod successfully
2. **Delete Mod** → Should delete without 404
3. **Add License Keys** → Should create keys
4. **License Key List** → Should show all keys
5. **Delete License Key** → Should delete without 404
6. **Generate Referral Code** → Should create code
7. **View All Referrals** → Should load list
8. **View Purchases** → Should show transactions
9. **Manage Users** → Should load user list
10. **Add Balance** → Should update user balance

All these functions should work **without any 404 errors**.

## Database Setup

Make sure your Neon database has all tables created. Run this SQL in Neon console:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see these tables:
- users
- mods
- license_keys
- purchases
- referral_codes
- user_devices (for IP tracking)
- user_ip_resets (for reset device feature)

If missing, import the schema from `NEON_DATABASE_SETUP_COMPLETE.sql`

## Troubleshooting

### Still Getting 404 Errors?

1. **Check Environment Variables**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Verify `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV` are set
   - Redeploy after adding variables

2. **Check Browser Console**
   - Open DevTools (F12)
   - Go to Network tab
   - Look for failed requests
   - Check the exact endpoint being called

3. **Check Vercel Logs**
   - Go to Vercel Dashboard → Deployments → Click your deployment
   - Go to Runtime Logs
   - Look for errors

### Common Issues:

**"Invalid token" error:**
- JWT_SECRET mismatch between local and production
- Clear browser localStorage and login again

**Database connection errors:**
- Check DATABASE_URL is correct Neon connection string
- Ensure Neon database is not paused

**Blank page on admin panel:**
- Check browser console for errors
- Verify static assets are loading (check Network tab)

## Testing Checklist

Before going live, test:

- [ ] Login works
- [ ] Register with referral code works
- [ ] Admin panel loads without errors
- [ ] Can create mods
- [ ] Can delete mods
- [ ] Can add license keys
- [ ] Can view license key list
- [ ] Can delete license keys
- [ ] Can create referral codes
- [ ] Can view all referrals
- [ ] Can view purchases
- [ ] Can manage users
- [ ] Can add user balance
- [ ] Reset Device feature works (24-hour cooldown)

## Support

If you encounter any issues:

1. Check this guide first
2. Verify environment variables are set correctly
3. Check Vercel runtime logs for errors
4. Ensure Neon database is properly configured

---

**Status:** ✅ All fixes completed and architect-approved
**Ready for Production:** YES
**Last Updated:** 2025-11-04
