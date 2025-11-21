# 🚀 Backend Setup Guide - Coger Enterprises E-Commerce Platform

## Overview
This is a complete REST API backend for the Coger Enterprises e-commerce platform built with Node.js, Express.js, PostgreSQL, and Sequelize ORM.

## Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Git

## Project Structure

```
backend/
├── config/
│   ├── database.js          # PostgreSQL connection configuration
│   └── init-db.js           # Database initialization with sample data
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── User.js              # User model with authentication
│   ├── Product.js           # Product catalog model
│   ├── Order.js             # Order management model
│   ├── Review.js            # Product reviews model
│   └── index.js             # Model exports and relationships
├── routes/
│   ├── auth.js              # Authentication routes (login, register)
│   ├── users.js             # User management routes
│   ├── products.js          # Product catalog routes
│   ├── orders.js            # Order management routes
│   ├── reviews.js           # Review management routes
│   └── dashboard.js         # Admin dashboard routes
├── .env.example             # Environment variables template
├── package.json             # Dependencies and scripts
└── server.js                # Main Express server entry point
```

## Installation

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=coger_enterprises
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 3. Create PostgreSQL Database
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE coger_enterprises;

# Exit
\q
```

### 4. Start the Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will:
- Connect to PostgreSQL
- Sync all database models
- Run on http://localhost:3000

## API Endpoints

### Authentication Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User Routes
- `GET /api/users/profile` - Get current user profile
- `GET /api/users` - Get all users (admin only)
- `POST /api/users/register` - Register new user
- `PUT /api/users/profile` - Update profile
- `DELETE /api/users/:id` - Delete user (admin only)

### Product Routes
- `GET /api/products` - Get all products with filtering
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Order Routes
- `GET /api/orders` - Get orders (admin: all, users: own)
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order status (admin only)
- `POST /api/orders/:id/cancel` - Cancel order

### Review Routes
- `GET /api/reviews/product/:productId` - Get product reviews
- `GET /api/reviews/product/:productId/stats` - Get review statistics
- `GET /api/reviews/pending` - Get pending reviews (admin only)
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `POST /api/reviews/:id/approve` - Approve review (admin only)
- `POST /api/reviews/:id/reject` - Reject review (admin only)

### Dashboard Routes
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/sales` - Get sales data

## Database Models

### User Model
```javascript
{
  id: UUID,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  phone: String,
  address: String,
  role: Enum('admin', 'user'),
  isActive: Boolean,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Product Model
```javascript
{
  id: UUID,
  name: String,
  description: Text,
  category: String,
  price: Decimal,
  discountPrice: Decimal,
  stock: Integer,
  sku: String (unique),
  image: String,
  rating: Decimal,
  isFeatured: Boolean,
  isActive: Boolean,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Order Model
```javascript
{
  id: UUID,
  orderNumber: String (unique),
  userId: UUID,
  status: Enum('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
  totalAmount: Decimal,
  shippingAddress: String,
  paymentMethod: String,
  isPaid: Boolean,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Review Model
```javascript
{
  id: UUID,
  productId: UUID,
  userId: UUID,
  rating: Integer (1-5),
  title: String,
  comment: Text,
  isApproved: Boolean,
  helpfulCount: Integer,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

## Authentication

The API uses JWT (JSON Web Token) for authentication.

### Login Flow
1. User sends credentials to `/api/auth/login`
2. Server validates credentials and returns JWT token
3. Client stores token in localStorage
4. Client sends token in Authorization header: `Authorization: Bearer <token>`
5. Server verifies token on protected routes

### Protected Routes
All user-specific routes require JWT token in the Authorization header.

## Frontend Integration

The frontend is already configured in `/js/config.js`:

```javascript
const CONFIG = {
  API_BASE_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'
    : 'https://api.cogeragri.in/api',
  // ... other config
}
```

## Deployment

### Heroku Deployment
1. Install Heroku CLI
2. Create Procfile:
```
web: node backend/server.js
```
3. Deploy:
```bash
heroku create coger-api
git push heroku main
```

### AWS/DigitalOcean
1. Set up Node.js environment
2. Install PostgreSQL
3. Configure environment variables
4. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js --name "coger-api"
```

## Testing

### Test with cURL
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get Products
curl http://localhost:3000/api/products
```

### Using Postman
1. Import API endpoints from config
2. Set Authorization header with Bearer token
3. Test all endpoints

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running
- Verify credentials in .env
- Check port 5432 is available

### Port Already in Use
```bash
# Change PORT in .env or
lsof -i :3000  # Find process
kill -9 <PID>  # Kill process
```

### JWT Token Invalid
- Ensure JWT_SECRET is same on server
- Check token hasn't expired
- Verify Bearer format in Authorization header

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|----------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development/production |
| DB_HOST | Database host | localhost |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | secure_password |
| DB_NAME | Database name | coger_enterprises |
| DB_PORT | Database port | 5432 |
| JWT_SECRET | JWT signing key | secret_key_here |
| JWT_EXPIRE | Token expiration | 7d |
| CORS_ORIGIN | CORS origin | http://localhost:3000 |

## Performance Tips

1. **Enable Compression**: Already enabled via helmet middleware
2. **Connection Pooling**: Configured in database.js
3. **Pagination**: Use limit and offset parameters
4. **Caching**: Use Redis for frequently accessed data
5. **Indexing**: Database indexes on userId, productId, etc.

## Security Features

✅ JWT Authentication
✅ Password Hashing (bcryptjs)
✅ CORS Protection
✅ SQL Injection Prevention (Sequelize ORM)
✅ XSS Protection (Helmet)
✅ Input Validation (express-validator)
✅ Rate Limiting Ready
✅ Secure Headers

## Support & Contributing

For issues or questions, please create an issue on GitHub.

## License

ISC License - See LICENSE file for details

---

**Last Updated**: 2024
**Version**: 1.0.0
**Maintainer**: Coger Enterprises
