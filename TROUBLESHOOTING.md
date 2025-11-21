# 🔧 Troubleshooting Guide - Login "Failed to Fetch" Error

## Problem: "Failed to fetch" when logging into admin page

This error occurs when the frontend cannot connect to the backend API. Here are the common causes and solutions:

---

## ✅ Quick Checklist

- [ ] Backend server is running on port 3000
- [ ] PostgreSQL database is running
- [ ] .env file is configured with correct database credentials
- [ ] Browser console shows the actual error
- [ ] CORS is not blocking the request

---

## 🔍 Causes & Solutions

### 1. Backend Server Not Running ❌

**Symptom:** Network tab shows failed connection to `http://localhost:3000/api/auth/login`

**Solution:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm run dev
```

**Expected Output:**
```
✅ Database connection established
✅ Database models synchronized
🚀 Coger API Server running on port 3000
```

---

### 2. PostgreSQL Database Not Running ❌

**Symptom:**
- Backend starts but shows database connection error
- Error: "connect ECONNREFUSED 127.0.0.1:5432"

**Solution:**

**On Windows:**
```bash
# Open Services and find PostgreSQL
# Or use PostgreSQL App directly
# Or restart PostgreSQL service
net start postgresql-x64-15
```

**On Mac:**
```bash
brew services start postgresql
```

**On Linux:**
```bash
sudo systemctl start postgresql
```

---

### 3. Database Not Created ❌

**Symptom:** Error "database coger_enterprises does not exist"

**Solution:**
```bash
# Login to PostgreSQL
psql -U postgres -h localhost

# Create database
CREATE DATABASE coger_enterprises;

# Exit
\q
```

---

### 4. .env File Not Configured ❌

**Symptom:** Backend crashes or database connection fails

**Solution:**
```bash
cd backend
cp .env.example .env
```

Edit `.env` file with your PostgreSQL credentials:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=coger_enterprises
DB_PORT=5432

JWT_SECRET=your_secure_secret_key_here
JWT_EXPIRE=7d

CORS_ORIGIN=http://localhost:3000
```

**Important:** Replace `your_password_here` with your actual PostgreSQL password

---

### 5. Wrong API Base URL ❌

**Symptom:** Console shows call to wrong URL (e.g., missing `/api`)

**Check:** `/js/config.js` line 7-9
```javascript
API_BASE_URL: window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'  // ✅ Should have /api
  : 'https://api.cogeragri.in/api',
```

If incorrect, edit and fix the URL path

---

### 6. CORS Blocked Error ❌

**Symptom:**
Console shows: "Access to XMLHttpRequest at 'http://localhost:3000/api/auth/login' from origin 'http://localhost' has been blocked by CORS policy"

**Solution:** This should already be fixed in `server.js`, but if persists:

Check backend/server.js has CORS enabled:
```javascript
app.use(cors()); // Should be present
```

Or configure specific origins in backend/.env:
```env
CORS_ORIGIN=http://localhost
CORS_ORIGIN=http://127.0.0.1
```

---

### 7. Port 3000 Already in Use ❌

**Symptom:** Error "EADDRINUSE: address already in use :::3000"

**Solution:**

**Find process using port 3000:**
```bash
# On Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# On Mac/Linux
lsof -i :3000
```

**Kill the process:**
```bash
# On Windows
kill -id {PID}

# On Mac/Linux
kill -9 {PID}
```

**Or use different port:**
```bash
# Create .env with different port
PORT=3001
```

---

### 8. Credentials Invalid ❌

**Symptom:**
- Login fails with 401 error
- Admin credentials not working

**Solution:**

Default credentials (first login):
- Username: `admin`
- Password: `admin123`

If database was seeded, these credentials should work. If not, check backend logs.

To reset or create new admin:
```bash
cd backend
node -e "require('./config/init-db.js')"
```

This will recreate sample data with default credentials.

---

## 🐛 Debug Steps

### Step 1: Check Browser Console

1. Open login page
2. Press `F12` to open Developer Tools
3. Go to Console tab
4. Try login again
5. Look for error messages

### Step 2: Check Network Tab

1. Open Developer Tools (F12)
2. Go to Network tab
3. Try login
4. Look for request to `/api/auth/login`
5. Check:
   - Status code (should be 200 for success)
   - Response body (error details)
   - Error message

### Step 3: Check Backend Logs

```bash
cd backend
npm run dev
# Look for any error messages when login is attempted
```

### Step 4: Test API Endpoint Directly

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "username": "admin",
      "email": "...",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

## 📋 Complete Setup Verification

Run this checklist to ensure everything is set up correctly:

```bash
# 1. Check Node.js
node --version  # Should be v14+

# 2. Check npm
npm --version

# 3. Check PostgreSQL
psql --version

# 4. Verify database exists
psql -U postgres -l | grep coger_enterprises

# 5. Install backend dependencies
cd backend
npm install

# 6. Check .env file
cat .env

# 7. Start backend
npm run dev

# 8. Test health endpoint (in new terminal)
curl http://localhost:3000/health

# 9. Test API root
curl http://localhost:3000/

# 10. Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 🔗 Important Endpoints

| Endpoint | Purpose | Method |
|----------|---------|--------|
| `/health` | Server health check | GET |
| `/` | API root info | GET |
| `/api/auth/login` | User login | POST |
| `/api/auth/register` | User registration | POST |
| `/api/users/profile` | Get current user | GET |
| `/api/products` | Get all products | GET |

---

## 📞 Still Having Issues?

Check these resources:
- Backend Setup: See `backend/BACKEND-SETUP.md`
- API Endpoints: See `backend/API-ENDPOINTS.md`
- GitHub Issues: Create an issue with:
  - Error message from console
  - Backend logs
  - Your .env configuration (without passwords)
  - Steps to reproduce

---

## ✅ Verification Checklist

Once fixed, verify with:

- [ ] Backend running without errors
- [ ] Database connected successfully  
- [ ] Can access `http://localhost:3000/health` in browser
- [ ] Can login with admin/admin123
- [ ] Admin dashboard loads
- [ ] Can view products
- [ ] Can create new products (admin only)
- [ ] Console has no errors

---

**Last Updated:** 2024
**Problem Type:** Frontend-Backend Connectivity
**Priority:** Critical

For more help, refer to the complete setup guide in `backend/BACKEND-SETUP.md`
