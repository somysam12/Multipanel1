# Vercel Deployment - Quick Guide

## ✅ Ready to Deploy!

Your project is now properly configured for Vercel deployment. All fixes have been applied to resolve the 404 error.

## 📋 Environment Variables Required

Make sure these are set in your Vercel project settings:

```
DATABASE_URL = your-neon-connection-string
JWT_SECRET = your-strong-random-secret
NODE_ENV = production
IP_SALT = your-random-salt (optional but recommended)
```

**How to get DATABASE_URL:**
1. Go to your Neon Console
2. Select your project
3. Copy the connection string (should look like: `postgresql://username:password@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require`)

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Add environment variables (listed above)
5. Click "Deploy"
6. Wait 2-3 minutes for build to complete

### Option 2: Deploy via Vercel CLI
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## ✨ What Was Fixed

1. **vercel.json Configuration**
   - Fixed `distDir` to correctly point to build output
   - Added filesystem handler for static assets
   - Proper route order: API → Static Files → SPA Fallback

2. **Build Script**
   - Added `vercel-build` script to client/package.json

3. **Deployment Files**
   - Created `.vercelignore` to exclude unnecessary files

## 🧪 After Deployment

1. **Test Login**
   - Username: `admin`
   - Password: `admin123`
   - ⚠️ Change password immediately!

2. **Test Key Features**
   - User registration with referral code
   - Product/Mod management
   - License key generation
   - Purchase flow
   - IP tracking

## 🔧 Troubleshooting

**Build fails:**
- Check Node.js version in Vercel settings (use Node 18+)
- Verify all dependencies are in package.json

**Database errors:**
- Verify DATABASE_URL is correct and includes `?sslmode=require`
- Check Neon project is active and has the correct schema

**API errors:**
- Ensure JWT_SECRET is set
- Check Vercel function logs for errors

**Frontend blank/404:**
- Check browser console for errors
- Verify all environment variables are set

## 📞 Support

If you encounter any issues:
1. Check Vercel deployment logs
2. Check browser console (F12)
3. Verify environment variables in Vercel dashboard
4. Check Neon database connection

## 🎉 Success Checklist

- ✅ Database schema created in Neon
- ✅ Environment variables added to Vercel
- ✅ Project deployed successfully
- ✅ Login page loads correctly
- ✅ Admin panel accessible
- ✅ API endpoints working

**Default Login:** admin / admin123

**Remember to change the admin password immediately after first login!**
