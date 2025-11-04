# Vercel Deployment Setup Guide - Multipanel

## ⚡ Quick Setup (5 Steps)

### Step 1: Neon Database Setup
1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project or select existing one
3. Copy your connection string (it looks like: `postgresql://user:password@host/database?sslmode=require`)

### Step 2: Run Database Schema
1. Open Neon SQL Editor
2. Run the complete SQL file: `NEON_DATABASE_SETUP_COMPLETE.sql`
3. This creates all tables, indexes, and the default admin user

### Step 3: Set Vercel Environment Variables
Go to your Vercel project → Settings → Environment Variables and add:

#### Required Environment Variables:
```
DATABASE_URL = your_neon_connection_string_from_step_1
JWT_SECRET = your_strong_random_secret_key
```

#### How to Generate JWT_SECRET:
Run this command in your terminal:
```bash
openssl rand -base64 32
```

Or generate online: https://randomkeygen.com/

**Example:**
```
DATABASE_URL = postgresql://myuser:mypass@ep-cool-name.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET = 2eb00ca7237f4e8a9b3c1d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s==
```

### Step 4: Deploy to Vercel
1. Push your code to GitHub
2. Vercel will automatically detect changes and redeploy
3. Wait for deployment to complete (usually 2-3 minutes)

### Step 5: Test Your Deployment
1. Visit your Vercel URL: `https://your-app.vercel.app`
2. You should see the login page
3. Login with default credentials:
   - Username: `admin`
   - Password: `admin123`

## ✅ Verification Checklist

After deployment, verify these work:
- [ ] Website loads (not a blank page)
- [ ] Login page is visible
- [ ] Admin login works with `admin` / `admin123`
- [ ] Admin dashboard loads
- [ ] Can create users/mods/keys

## 🔧 Troubleshooting

### Problem: Blank page after deployment
**Solution:** 
- Check browser console for errors (F12)
- Verify DATABASE_URL and JWT_SECRET are set in Vercel
- Make sure you deployed the latest code with updated vercel.json

### Problem: Login fails with "Invalid credentials"
**Solution:**
- Verify you ran the SQL file in Neon (Step 2)
- Check DATABASE_URL is correct
- Make sure DATABASE_URL includes `?sslmode=require`

### Problem: API calls return 404
**Solution:**
- Verify vercel.json has the correct configuration
- Check that `/api` folder exists with `[...path].js` file
- Redeploy the project

### Problem: Database connection fails
**Solution:**
- Verify DATABASE_URL is correct (copy directly from Neon console)
- Ensure Neon database is active (not sleeping)
- Check SSL mode is included: `?sslmode=require`

## 📝 Default Admin Account

After successful deployment, you can login with:
- **Username:** `admin`
- **Password:** `admin123`

**⚠️ IMPORTANT:** Change the admin password immediately after first login!

## 🚀 Post-Deployment

1. Login as admin
2. Change admin password in the settings
3. Create your first product/mod
4. Generate license keys
5. Create referral codes for new users

## 📞 Need Help?

If you're still facing issues:
1. Check Vercel deployment logs
2. Check browser console (F12 → Console tab)
3. Verify environment variables are set correctly
4. Make sure SQL schema was run completely in Neon

---

**Note:** The app uses Neon PostgreSQL for database when deployed on Vercel. Local development uses SQLite for simplicity.
