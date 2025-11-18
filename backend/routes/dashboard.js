const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');

// This route will be updated once you have database models
// For now, it returns mock data to test the frontend

// GET /api/dashboard - Get dashboard statistics (Admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    // TODO: Replace with actual database queries
    // Example with Sequelize:
    // const productsCount = await Product.count();
    // const ordersCount = await Order.count();
    // const customersCount = await User.count({ where: { role: 'customer' } });
    // const revenue = await Order.sum('total_amount', { where: { status: 'completed' } });
    
    // Mock data for now
    const stats = {
      totalProducts: 25,
      totalOrders: 150,
      totalCustomers: 320,
      totalRevenue: 125000,
      lowStockProducts: 5,
      pendingOrders: 12,
      recentOrders: [
        {
          id: 1,
          customer: 'John Doe',
          amount: 1500,
          status: 'pending',
          date: new Date().toISOString()
        },
        {
          id: 2,
          customer: 'Jane Smith',
          amount: 2800,
          status: 'completed',
          date: new Date().toISOString()
        }
      ],
      topProducts: [
        { name: 'Organic Coconut Oil', sales: 150 },
        { name: 'Coconut Water', sales: 120 },
        { name: 'Copra', sales: 95 }
      ]
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
});

// GET /api/dashboard/sales - Get sales analytics
router.get('/sales', verifyToken, isAdmin, async (req, res) => {
  try {
    // TODO: Implement actual sales analytics from database
    const salesData = {
      daily: [
        { date: '2025-11-12', amount: 5000 },
        { date: '2025-11-13', amount: 6200 },
        { date: '2025-11-14', amount: 4800 },
        { date: '2025-11-15', amount: 7100 },
        { date: '2025-11-16', amount: 5900 },
        { date: '2025-11-17', amount: 6800 },
        { date: '2025-11-18', amount: 7500 }
      ],
      monthly: 185000,
      yearly: 2100000
    };

    res.json({
      success: true,
      data: salesData
    });
  } catch (error) {
    console.error('Sales analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sales analytics'
    });
  }
});

module.exports = router;
