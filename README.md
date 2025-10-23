# Multipanel - Product Key Management System

## Quick Start

### Default Admin Login
- **URL**: Click the webview to access the application
- **Username**: `admin`
- **Password**: `admin123`

### How to Use

#### Admin Panel
1. **Login** with admin credentials
2. **Create Referral Codes**:
   - Go to "Referrals" tab
   - Enter initial balance amount
   - Click "Generate Referral"
   - Share the code with users

3. **Manage Users**:
   - View all users
   - Search by username
   - Update balances
   - Block/unblock accounts
   - View purchase history

4. **Manage Products**:
   - Add products with name, price, duration
   - Add license keys (one per line)
   - Delete individual keys or all keys
   - Delete products

#### User Registration & Usage
1. Users need a **referral code** to register
2. After registration, they receive the balance from referral
3. Users can browse products and purchase with their balance
4. After purchase, they receive a unique product key
5. View purchase history in dashboard

## Features
✅ Admin panel with complete user management  
✅ Product and key management system  
✅ Referral-based user registration  
✅ Balance management  
✅ Purchase tracking  
✅ Block/unblock users  
✅ Search functionality  
✅ Secure JWT authentication  
✅ Password hashing with bcrypt  

## Tech Stack
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite
- **Auth**: JWT tokens

## Security Notes
⚠️ **Change the default admin password immediately!**  
⚠️ Set a strong JWT_SECRET for production  
⚠️ Never commit the database file with sensitive data  

## Support
For issues or questions, check the replit.md file for detailed documentation.
