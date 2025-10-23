# 🔧 MULTIHACK PANEL - Product Key Management System

## Quick Start (Local Development)

### Default Admin Login
- **Username**: `admin`
- **Password**: `admin123`
- ⚠️ **Change this password immediately after first login!**

## Features

### User Panel
✅ Dark theme UI matching MULTIHACK design  
✅ Buy Keys - Search products, select duration, purchase  
✅ My Keys - View all purchased product keys  
✅ Wallet History - Track money added, used, and net balance  
✅ User dropdown with profile and settings  
✅ Mobile-responsive sidebar navigation  

### Admin Panel
✅ User Management - Create users, manage balances  
✅ Product Management - Add products with duration and pricing  
✅ Key Management - Add/delete keys (single or bulk)  
✅ Referral System - Generate codes with preset balances  
✅ Purchase Tracking - View all user purchases  
✅ Search and filter functionality  

## Tech Stack
- **Frontend**: React + Vite (Dark Theme UI)
- **Backend**: Node.js + Express
- **Database**: SQLite (Dev) / PostgreSQL/Neon (Production)
- **Auth**: JWT tokens with bcrypt

## 🚀 Vercel Deployment Guide

### Step 1: Setup Neon Database

1. Create account at [neon.tech](https://neon.tech)
2. Create new database
3. Copy connection string
4. Run SQL from `neon-db-setup.sql` in Neon SQL Editor

### Step 2: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub
3. Set environment variables:
   ```
   DATABASE_URL=your_neon_connection_string
   JWT_SECRET=your_random_secret_key
   PORT=3000
   NODE_ENV=production
   ```
4. Deploy!
5. Copy your Railway backend URL

### Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Configure:
   - **Framework**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```
5. Deploy!

### Step 4: Update CORS

Update `server/server.js` to allow your Vercel domain:

```javascript
app.use(cors({
  origin: ['https://your-app.vercel.app'],
  credentials: true
}));
```

## Local Development

```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Run (from root)
bash start.sh
```

## Admin Features

1. **Create Users** - Add users with initial balance
2. **Manage Balances** - Add/update user balances
3. **Block/Unblock Users** - Control user access
4. **Add Products** - Create products with duration (1 day, 7 days, 1 month, etc.)
5. **Manage Keys** - Add keys one per line, delete individual or all keys
6. **Generate Referrals** - Create referral codes with preset balance
7. **View Purchases** - Track all user purchases and transactions

## User Flow

1. Admin creates referral code with balance
2. User registers using referral code (gets starting balance)
3. User searches and buys products
4. User receives unique product key
5. User views purchase history in "My Keys"
6. User tracks spending in "Wallet History"

## Database Schema

- **users** - User accounts with balance, admin status
- **products** - Digital products with pricing and duration
- **product_keys** - License keys linked to products
- **purchases** - Transaction records
- **referrals** - Referral codes with preset balances

## Security Notes

⚠️ **Important Security Steps:**

1. Change default admin password
2. Set strong JWT_SECRET: `openssl rand -base64 32`
3. Use HTTPS in production
4. Keep database credentials secure
5. Enable Neon database SSL
6. Regular backups

## File Structure

```
/
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── App.jsx
│   │   └── App.css      # Dark theme styles
│   └── vite.config.js
├── server/              # Node.js backend
│   ├── server.js        # Express API
│   ├── database.js      # SQLite (dev)
│   └── database-postgres.js  # PostgreSQL (production)
├── neon-db-setup.sql    # Neon DB setup queries
├── DEPLOYMENT.md        # Detailed deployment guide
└── start.sh             # Local development script
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
JWT_SECRET=your-random-secret
PORT=3000
NODE_ENV=production
```

### Frontend (.env)
```
VITE_API_URL=/api  # or https://your-backend.railway.app/api
```

## Troubleshooting

**Login not working?**
- Check backend is running
- Verify CORS settings
- Check API_URL in frontend

**Database errors?**
- Verify Neon connection string
- Check SSL is enabled
- Run SQL setup queries

**UI not showing?**
- Clear browser cache
- Check console for errors
- Verify Vite build

## Support

For issues:
1. Check `DEPLOYMENT.md` for detailed steps
2. Review `neon-db-setup.sql` for database schema
3. Check browser console for errors
4. Verify environment variables

## License

© 2025 MULTIHACK PANEL. All rights reserved.
