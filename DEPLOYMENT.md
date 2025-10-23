# Vercel Deployment Guide for Multipanel

## Prerequisites
1. Neon PostgreSQL database account (https://neon.tech)
2. Vercel account (https://vercel.com)
3. GitHub repository with this code

## Step 1: Setup Neon Database

1. Go to https://neon.tech and create a new database
2. Copy your database connection string (looks like: `postgresql://user:password@host/database`)
3. Run the SQL queries from `neon-db-setup.sql` in your Neon SQL editor
4. Create default admin user by running:
   ```sql
   -- First, generate password hash using Node.js:
   -- node -e "console.log(require('bcryptjs').hashSync('admin123', 10))"
   -- Then insert:
   INSERT INTO users (username, password, is_admin) 
   VALUES ('admin', 'YOUR_BCRYPT_HASH_HERE', TRUE);
   ```

## Step 2: Deploy Backend (Option A - Vercel Serverless)

### Backend as Serverless Functions:
1. The backend needs to be converted to serverless functions
2. Each API route becomes a separate function
3. Or deploy backend to Railway/Render (recommended for this app)

## Step 2: Deploy Backend (Option B - Railway/Render - RECOMMENDED)

### Using Railway (Recommended):
1. Go to https://railway.app
2. Create new project from GitHub
3. Select your repository
4. Add PostgreSQL service or connect to Neon
5. Set environment variables:
   ```
   DATABASE_URL=your_neon_connection_string
   JWT_SECRET=your_random_secret_key_here
   PORT=3000
   ```
6. Deploy command: `cd server && npm install && node server.js`
7. Copy your Railway backend URL (e.g., `https://your-app.railway.app`)

### Using Render:
1. Go to https://render.com
2. New > Web Service
3. Connect GitHub repository
4. Root Directory: `server`
5. Build Command: `npm install`
6. Start Command: `node server.js`
7. Add environment variables (same as above)

## Step 3: Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Import your GitHub repository
3. Configure build settings:
   - Framework Preset: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. Add Environment Variables in Vercel:
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```

5. Click Deploy

## Step 4: Update Frontend Configuration

Before deploying, update `client/src/components` to use environment variable:

In each component file (Login.jsx, Register.jsx, AdminPanel.jsx, UserDashboard.jsx):
```javascript
const API_URL = import.meta.env.VITE_API_URL || '/api';
```

## Step 5: Backend CORS Configuration

Make sure backend allows your Vercel domain in CORS:

```javascript
app.use(cors({
  origin: ['https://your-vercel-app.vercel.app', 'http://localhost:5000'],
  credentials: true
}));
```

## Environment Variables Summary

### Backend (Railway/Render):
```
DATABASE_URL=postgresql://user:password@host/database
JWT_SECRET=change_this_to_random_secret
PORT=3000
NODE_ENV=production
```

### Frontend (Vercel):
```
VITE_API_URL=https://your-backend.railway.app/api
```

## Testing Deployment

1. Visit your Vercel URL
2. Login with admin credentials (username: admin, password: admin123)
3. Test all features:
   - Create users
   - Add products
   - Generate referral codes
   - Make purchases

## Troubleshooting

### "Network Error" on Login:
- Check CORS configuration in backend
- Verify VITE_API_URL is set correctly
- Check backend logs on Railway/Render

### Database Connection Failed:
- Verify DATABASE_URL is correct
- Check Neon database is active
- Ensure SSL is configured (Neon requires SSL)

### Build Errors:
- Clear Vercel build cache
- Check all dependencies are in package.json
- Verify Node.js version compatibility

## Security Notes

⚠️ Important:
1. Change admin password immediately after first login
2. Use strong JWT_SECRET (generate with: `openssl rand -base64 32`)
3. Enable HTTPS only in production
4. Keep database credentials secure
5. Regular backups of Neon database

## Alternative: Full Vercel Deployment (Advanced)

For full Vercel deployment, you'd need to:
1. Convert Express routes to Vercel serverless functions
2. Create `api/` directory with serverless handlers
3. This requires significant code restructuring

**Recommendation: Use Railway/Render for backend + Vercel for frontend**
