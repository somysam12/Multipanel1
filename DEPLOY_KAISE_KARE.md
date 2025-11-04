# 🚀 Vercel Pe Deploy Kaise Kare

## Step 1: Pehle Neon Database Setup Karo

### 1. Neon Console Open Karo
- Yeh link kholo: https://console.neon.tech/
- Login karo ya sign up karo

### 2. SQL Editor Me Jao
- Apna project select karo
- Left sidebar me "SQL Editor" pe click karo

### 3. Yeh Complete SQL Code Copy Karke Paste Karo

File kholo: `database/neon-schema.sql`

Ya fir `VERCEL_DEPLOYMENT_GUIDE.md` me se complete SQL copy karo aur SQL Editor me paste karke **RUN** karo.

Yeh automatically create kar dega:
- ✅ Saare tables (users, mods, license_keys, etc.)
- ✅ IP tracking tables
- ✅ Default admin account (admin/admin123)
- ✅ Sample data

---

## Step 2: GitHub Pe Code Push Karo

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

Agar GitHub setup nahi hai to:
```bash
# GitHub pe naya repo banao, fir yeh commands:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## Step 3: Vercel Pe Deploy Karo

### 1. Vercel Dashboard Open Karo
Link: https://vercel.com/dashboard

### 2. New Project Add Karo
- **"Add New Project"** button pe click karo
- **"Import Git Repository"** select karo
- Apna GitHub repo select karo

### 3. Environment Variables Add Karo

**Important:** Build settings me jao aur **Environment Variables** section me yeh variables add karo:

```
DATABASE_URL
postgresql://neondb_owner:npg_M5irDYFezhW9@ep-curly-union-a43sft8x-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

JWT_SECRET
2eb00ca723734877352d2e808aaeeb52e82f61f87bd2948a8dd051af16c81f193aaebd61a50cd92fc2c2247b1218047ee9484ce496d360005a1292a73a0ff009

IP_SALT
ce539b5d1656063d64b1bdb2f7c78f35c596a410ed777087aabfd1397b178d1e

NODE_ENV
production
```

**Asan tarika:** `.env.vercel` file me sab ready hai, waha se copy-paste kar do!

### 4. Deploy Button Pe Click Karo
- Sab settings theek hai? **Deploy** pe click karo
- 2-3 minute wait karo
- Done! 🎉

---

## Step 4: Testing

### Default Admin Login:
```
Username: admin
Password: admin123
```

⚠️ **Pehle login ke baad password zaroor change karna!**

### Test Karo Yeh Features:
1. ✅ Admin login
2. ✅ User registration (referral code se)
3. ✅ Mod add/delete karo
4. ✅ License keys generate karo
5. ✅ Purchase test karo
6. ✅ Different device se login try karo (IP tracking test)
7. ✅ IP reset try karo

---

## 🎯 Quick Reference

**Tumhara Neon Database:**
```
postgresql://neondb_owner:npg_M5irDYFezhW9@ep-curly-union-a43sft8x-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Environment Variables File:**
- `.env.vercel` - Sab ready hai isme!

**Deployment Guide (English):**
- `VERCEL_DEPLOYMENT_GUIDE.md` - Complete detailed guide

**Database SQL:**
- `database/neon-schema.sql` - Neon me run karna hai

---

## 🔥 IP Tracking Kaise Kaam Karta Hai

### User Register Karta Hai
- IP automatically save ho jata hai database me

### User Login Karta Hai
- **Same device se** → ✅ Login successful
- **Different device se** → ❌ Blocked (device limit reached)

### IP Reset Kaise Kare
1. User dashboard me "Reset IP" button pe click
2. IP reset ho jayega
3. Naya device se login kar sakta hai
4. **24 hours baad** dubara reset kar sakta hai

### Admin Control
- Admin kisi bhi user ka device limit badha/ghat sakta hai
- Example: Device limit = 3 means 3 different devices allowed

---

## ❓ Problems?

### Build Fail Ho Raha
- Check karo package.json me sab dependencies hai
- Vercel logs dekho error ke liye

### Database Connect Nahi Ho Raha
- Check DATABASE_URL sahi hai
- Neon project active hai check karo
- Connection string me `?sslmode=require` hai check karo

### API Error Aa Raha
- JWT_SECRET set hai check karo
- Sab environment variables Vercel me add kiye check karo

---

## 🎊 Ho Gaya Deploy!

Ab tumhara MultiHack Panel live hai Vercel pe! 

**URL:** `https://your-project-name.vercel.app`

Features:
- ✅ IP tracking with device limits
- ✅ 24-hour reset cooldown
- ✅ Admin panel
- ✅ User dashboard
- ✅ Purchase system
- ✅ Referral codes

**Happy Deploying! 🚀**
