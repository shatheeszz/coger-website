# Coger Enterprises Backend API

Backend API for Coger E-commerce Platform built with Node.js, Express, and PostgreSQL.

## Features

- ✅ JWT Authentication
- ✅ Role-based Access Control (Admin/Customer)
- ✅ RESTful API endpoints
- ✅ PostgreSQL database with Sequelize ORM
- ✅ File upload support
- ✅ Security middleware (Helmet, CORS)
- ✅ Request logging with Morgan

## Tech Stack

- **Node.js** v18+
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Sequelize** - ORM
- **JWT** - Authentication
- **Bcrypt** - Password hashing

## Project Structure

```
backend/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── dashboard.js         # Dashboard statistics
│   ├── orders.js            # Order management
│   ├── products.js          # Product management
│   └── users.js             # User management
├── .env.example           # Environment variables template
├── package.json
├── server.js              # Main server file
└── README.md
```

## Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Edit `.env` file:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=coger_db
DB_USER=your_username
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:8080
```

### 3. Setup PostgreSQL Database

Install PostgreSQL and create database:

```bash
psql -U postgres
CREATE DATABASE coger_db;
\q
```

### 4. Run Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Dashboard (Admin only)
- `GET /api/dashboard` - Get dashboard statistics
- `GET /api/dashboard/sales` - Get sales analytics

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (Admin)

### Orders
- `GET /api/orders` - Get orders
- `POST /api/orders` - Create order

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/me` - Get current user profile

## Testing the API

### Test Login (Mock Admin User)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@coger.in",
    "password": "admin123"
  }'
```

This will return a JWT token. Use this token for authenticated requests:

```bash
curl http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Frontend Integration

### Example Fetch Request

```javascript
// Login
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@coger.in', password: 'admin123' })
})
.then(res => res.json())
.then(data => {
  localStorage.setItem('token', data.token);
});

// Get Dashboard Stats
const token = localStorage.getItem('token');
fetch('http://localhost:3000/api/dashboard', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => {
  // Update your dashboard HTML
  document.getElementById('totalProducts').innerText = data.data.totalProducts;
});
```

## Next Steps

1. **Add Database Models** - Create Sequelize models for Users, Products, Orders
2. **Replace Mock Data** - Connect routes to actual database queries
3. **Add File Upload** - Implement multer for product images
4. **Add Email Service** - Send order confirmations
5. **Deploy** - Deploy to Render, Fly.io, or Railway

## License

MIT
