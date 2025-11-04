# Multipanel - Product Key Management System

## Overview
A complete web application for managing digital product sales with an admin panel and user dashboard. Built with React frontend and Node.js/Express backend with SQLite database.

## Features

### Admin Panel
- **User Management**: Create users, manage balances, block/unblock accounts, search by username
- **Product Management**: Add products with multiple duration variants (e.g., 1 month, 3 months, 6 months), each with different prices
- **Key Management**: Add/delete product keys per variant (individual or bulk), track key usage, manage keys for specific duration variants
- **Referral System**: Generate referral codes with preset balances
- **Purchase Tracking**: View all user purchases and transaction history

### User Dashboard
- **Account System**: Register only with referral codes (no public signup)
- **Product Browsing**: View available products with all duration variants and pricing options
- **Purchase System**: Select specific product variant (duration + price) before purchasing
- **Purchase History**: View all purchased products with their keys and variant details

## Default Admin Credentials
- Username: `admin`
- Password: `admin123`

**Important**: Change the admin password after first login!

## Technical Stack
- **Frontend**: React 18 with React Router, Vite
- **Backend**: Node.js, Express
- **Database**: SQLite (better-sqlite3)
- **Authentication**: JWT tokens
- **Security**: bcrypt for password hashing

## Project Structure
```
/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── App.jsx
│   │   └── App.css
│   └── vite.config.js
├── server/          # Node.js backend
│   ├── server.js    # Express API
│   ├── database.js  # SQLite database setup
│   └── multipanel.db # SQLite database file
└── start.sh         # Startup script
```

## API Endpoints

### Public
- `POST /api/login` - User login
- `POST /api/register` - Register with referral code

### User (Authenticated)
- `GET /api/products` - Get all products
- `POST /api/purchase/:productId` - Purchase a product
- `GET /api/user/purchases` - Get user's purchase history
- `GET /api/user/profile` - Get user profile

### Admin (Authenticated + Admin)
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:id/balance` - Update user balance
- `PUT /api/admin/users/:id/block` - Block/unblock user
- `GET /api/admin/users/search/:username` - Search users
- `GET /api/admin/users/:id/purchases` - Get user purchases
- `GET /api/admin/products` - Get all products with their variants
- `POST /api/admin/products` - Create product with multiple variants
- `DELETE /api/admin/products/:id` - Delete product and all variants
- `GET /api/admin/variants/:variantId/keys` - Get keys for specific variant
- `POST /api/admin/variants/:variantId/keys` - Add keys to specific variant
- `DELETE /api/admin/variants/:variantId/keys/:keyId` - Delete specific key
- `DELETE /api/admin/variants/:variantId/keys` - Delete all keys for variant
- `GET /api/admin/referrals` - Get all referrals
- `POST /api/admin/referrals` - Create referral code

## Recent Changes  
- 2025-11-04: **MAJOR FIX - IP Tracking & Reset Device Added** 🔒
  - ✅ Created Reset Device feature (`/reset-device` page)
  - ✅ IP tracking on login (automatic device locking)
  - ✅ 24-hour reset cooldown system
  - ✅ Backend endpoint: POST `/api/user/reset-ip`
  - ✅ Added link to Login page for device reset
  - ✅ Database already has `user_devices` and `user_ip_resets` tables
- 2025-11-04: **CRITICAL FIX - Backend APIs Complete** ✅
  - ✅ Added missing GET `/api/admin/referral-codes` endpoint
  - ✅ Created `client/src/api/AdminApi.js` - Centralized API helper
  - ✅ All backend endpoints working correctly (mods, keys, referrals, users)
  - ✅ Created `ADMIN_PANEL_FIX_GUIDE.md` for frontend fixes
  - ❌ AdminPanel.jsx still needs updating (calls wrong endpoints)
  - See `FIX_SUMMARY_HINDI.md` for complete status and instructions
- 2025-11-04: **FINAL FIX - DEPLOYMENT READY** ✅ (ARCHITECT APPROVED)
  - Fixed vercel.json to use modern "rewrites" configuration
  - Proper regex pattern: `/((?!api/)(?!.*\\.).*)`
  - ✅ API routes (/api/*) work correctly - go to serverless function
  - ✅ Static assets (.js, .css, .svg, etc.) load properly - served by Vite
  - ✅ SPA client-side routing works - all routes serve index.html for React Router
  - ✅ No blank pages or 404 errors
  - Created comprehensive VERCEL_SETUP_GUIDE.md with deployment instructions
- 2025-11-04: **DEPLOYMENT READY** - Fixed all Vercel deployment errors
  - Fixed build script to use `npm ci --include=dev` (ensures Vite and other devDependencies are installed in Vercel's production environment)
  - Created api/[...path].js catch-all handler for proper API routing
  - Build completes successfully (verified locally and architect approved)
- 2025-11-04: Installed all project dependencies (client & server)
- 2025-11-04: Project imported successfully to Replit environment
- 2025-10-23: Initial project setup
- 2025-10-23: Implemented complete admin panel and user dashboard
- 2025-10-23: Added referral-based registration system
- 2025-10-23: Configured Vite for Replit proxy support
- 2025-10-23: Implemented product variant system with multiple duration/price combinations per product
- 2025-10-23: Fixed migration to preserve purchase history when upgrading schema

## Database Schema
- **users**: User accounts with balance, admin status, and block status
- **products**: Digital products (name and description only)
- **product_variants**: Product variants with duration_value, duration_unit (days/months), and price
- **product_keys**: License keys linked to specific product variants
- **purchases**: Transaction records linked to variants and keys
- **referrals**: Referral codes with preset balances

## Environment Configuration
- Backend runs on port 3000 (localhost)
- Frontend runs on port 5000 (0.0.0.0)
- JWT secret: Change in production via environment variable

## User Preferences
None set yet.
