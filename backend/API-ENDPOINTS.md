# 📚 API Endpoints - Quick Reference

## Base URL
```
http://localhost:3000/api
```

## Response Format
All API responses follow this format:
```json
{
  "success": true/false,
  "message": "Response message",
  "data": { /* response data */ }
}
```

## Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - No/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## 🔐 Authentication Routes

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string"
}

Response: 201 Created
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "token": "jwt_token"
  }
}
```

### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user object */ },
    "token": "jwt_token"
  }
}
```

---

## 👥 User Routes

### Get Current User Profile
```http
GET /api/users/profile
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Profile retrieved",
  "data": { /* user object */ }
}
```

### Get All Users (Admin Only)
```http
GET /api/users
Authorization: Bearer {admin_token}

Response: 200 OK
{
  "success": true,
  "message": "Users retrieved",
  "data": [
    { /* user objects */ }
  ]
}
```

### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "address": "string"
}

Response: 200 OK
```

### Delete User (Admin Only)
```http
DELETE /api/users/{id}
Authorization: Bearer {admin_token}

Response: 200 OK
```

---

## 🛍️ Product Routes

### Get All Products
```http
GET /api/products

Query Parameters:
- page: integer (default: 1)
- limit: integer (default: 12)
- category: string
- search: string
- minPrice: number
- maxPrice: number
- sort: string ("newest", "popular", "price-low", "price-high")

Response: 200 OK
{
  "success": true,
  "message": "Products retrieved",
  "data": {
    "products": [ /* products */ ],
    "totalCount": 100,
    "page": 1,
    "limit": 12,
    "totalPages": 9
  }
}
```

### Get Featured Products
```http
GET /api/products/featured

Response: 200 OK
```

### Get Product by ID
```http
GET /api/products/{id}

Response: 200 OK
{
  "success": true,
  "message": "Product retrieved",
  "data": { /* product object */ }
}
```

### Create Product (Admin Only)
```http
POST /api/products
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "string",
  "description": "string",
  "category": "string",
  "price": 99.99,
  "discountPrice": 79.99,
  "stock": 100,
  "sku": "unique-sku",
  "image": "url",
  "isFeatured": true
}

Response: 201 Created
```

### Update Product (Admin Only)
```http
PUT /api/products/{id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{ /* same as create */ }

Response: 200 OK
```

### Delete Product (Admin Only)
```http
DELETE /api/products/{id}
Authorization: Bearer {admin_token}

Response: 200 OK (soft delete)
```

---

## 📦 Order Routes

### Get All Orders
```http
GET /api/orders
Authorization: Bearer {token}

Note: Admins see all orders, users see only their own

Response: 200 OK
```

### Get Order by ID
```http
GET /api/orders/{id}
Authorization: Bearer {token}

Response: 200 OK
```

### Create Order
```http
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "price": 99.99
    }
  ],
  "shippingAddress": "123 Main St",
  "paymentMethod": "card",
  "totalAmount": 199.98
}

Response: 201 Created
```

### Update Order Status (Admin Only)
```http
PUT /api/orders/{id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "processing|shipped|delivered|cancelled",
  "isPaid": true
}

Response: 200 OK
```

### Cancel Order
```http
POST /api/orders/{id}/cancel
Authorization: Bearer {token}

Response: 200 OK
```

---

## ⭐ Review Routes

### Get Product Reviews
```http
GET /api/reviews/product/{productId}

Response: 200 OK
{
  "success": true,
  "data": [ /* approved reviews */ ]
}
```

### Get Review Statistics
```http
GET /api/reviews/product/{productId}/stats

Response: 200 OK
{
  "success": true,
  "data": {
    "averageRating": 4.5,
    "totalReviews": 24,
    "ratingDistribution": {
      "1": 1,
      "2": 0,
      "3": 2,
      "4": 8,
      "5": 13
    }
  }
}
```

### Get Pending Reviews (Admin Only)
```http
GET /api/reviews/pending
Authorization: Bearer {admin_token}

Response: 200 OK
```

### Create Review
```http
POST /api/reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "uuid",
  "rating": 5,
  "title": "Great product!",
  "comment": "This product exceeded my expectations"
}

Response: 201 Created
```

### Update Review
```http
PUT /api/reviews/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 4,
  "title": "string",
  "comment": "string"
}

Response: 200 OK
```

### Approve Review (Admin Only)
```http
POST /api/reviews/{id}/approve
Authorization: Bearer {admin_token}

Response: 200 OK
```

### Reject Review (Admin Only)
```http
POST /api/reviews/{id}/reject
Authorization: Bearer {admin_token}

Response: 200 OK
```

### Mark Review Helpful
```http
POST /api/reviews/{id}/helpful
Authorization: Bearer {token}

Response: 200 OK
```

### Delete Review
```http
DELETE /api/reviews/{id}
Authorization: Bearer {token}

Note: Only review owner or admin can delete

Response: 200 OK
```

---

## 📊 Dashboard Routes

### Get Dashboard Statistics
```http
GET /api/dashboard/stats
Authorization: Bearer {admin_token}

Response: 200 OK
{
  "success": true,
  "data": {
    "totalUsers": 50,
    "totalProducts": 100,
    "totalOrders": 200,
    "totalRevenue": 50000,
    "pendingOrders": 10
  }
}
```

### Get Sales Data
```http
GET /api/dashboard/sales
Authorization: Bearer {admin_token}

Query Parameters:
- period: "day|week|month|year"
- startDate: "YYYY-MM-DD"
- endDate: "YYYY-MM-DD"

Response: 200 OK
```

---

## 🔍 Health Check

### Server Health
```http
GET /health

Response: 200 OK
{
  "status": "OK",
  "message": "Server is running"
}
```

### API Root
```http
GET /

Response: 200 OK
{
  "message": "Coger Enterprises API",
  "version": "1.0.0",
  "endpoints": { /* list of all endpoints */ }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid parameters",
  "error": "Detailed error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided or invalid token",
  "error": "Unauthorized access"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "error": "Admin access required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "error": "Product not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal Server Error",
  "error": "Error details"
}
```

---

## Authentication

### Bearer Token Format
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Storage
- Store token in `localStorage` under key `authToken`
- Include token in Authorization header for all protected routes
- Token expires after 7 days (configurable via JWT_EXPIRE)

---

## Rate Limiting (Recommended)
Implement rate limiting for production:
- 100 requests per 15 minutes per IP
- 50 requests per 15 minutes per authenticated user

---

**API Version**: 1.0.0
**Last Updated**: 2024
**Documentation**: See BACKEND-SETUP.md for detailed setup instructions
