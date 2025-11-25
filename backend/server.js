require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const sequelize = require('./config/database');
const { User, Product, Order, Review } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files (for uploaded receipts/images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const dashboardRoutes = require('./routes/dashboard');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Coger Enterprises API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      users: '/api/users',
      reviews: '/api/reviews',
      dashboard: '/api/dashboard'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
            console.log('DEBUG: sequelize =', sequelize); 
    await sequelize.authenticate();
    console.log('\u2705 Database connection established');

    // Sync database models
    await sequelize.sync({ alter: false });
    console.log('\u2705 Database models synchronized');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\ud83d\ude80 Coger API Server running on port ${PORT}`);
      console.log(`\ud83d\udcc1 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`\ud83d\udd17 API URL: http://localhost:${PORT}`);
      console.log('\ud83d\udc40 Waiting for requests...');
    });
  } catch (error) {
    console.error('\u274c Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
