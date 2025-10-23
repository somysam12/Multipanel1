# Multipanel - Product Key Management System

## Overview
A complete web application for managing digital product sales with an admin panel and user dashboard. Built with React frontend and Node.js/Express backend with SQLite database.

## Features

### Admin Panel
- **User Management**: Create users, manage balances, block/unblock accounts, search by username
- **Product Management**: Add products with duration and pricing, manage product inventory
- **Key Management**: Add/delete product keys (individual or bulk), track key usage
- **Referral System**: Generate referral codes with preset balances
- **Purchase Tracking**: View all user purchases and transaction history

### User Dashboard
- **Account System**: Register only with referral codes (no public signup)
- **Product Browsing**: View available products with pricing and duration
- **Purchase System**: Buy products using account balance
- **Purchase History**: View all purchased products and their keys

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
- `GET /api/admin/products` - Get all products
- `POST /api/admin/products` - Create product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/products/:id/keys` - Get product keys
- `POST /api/admin/products/:id/keys` - Add keys to product
- `DELETE /api/admin/products/:productId/keys/:keyId` - Delete specific key
- `DELETE /api/admin/products/:productId/keys` - Delete all keys
- `GET /api/admin/referrals` - Get all referrals
- `POST /api/admin/referrals` - Create referral code

## Recent Changes
- 2025-10-23: Initial project setup
- 2025-10-23: Implemented complete admin panel and user dashboard
- 2025-10-23: Added referral-based registration system
- 2025-10-23: Configured Vite for Replit proxy support

## Database Schema
- **users**: User accounts with balance, admin status, and block status
- **products**: Digital products with pricing and duration
- **product_keys**: License keys linked to products
- **purchases**: Transaction records
- **referrals**: Referral codes with preset balances

## Environment Configuration
- Backend runs on port 3000 (localhost)
- Frontend runs on port 5000 (0.0.0.0)
- JWT secret: Change in production via environment variable

## User Preferences
None set yet.
