const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { Order, Product, User } = require('../models');

// GET /api/orders - Get all orders (Admin sees all, users see only their orders)
router.get('/', verifyToken, async (req, res) => {
  try {
    const where = {};
    
    // If not admin, only show user's own orders
    if (req.user.role !== 'admin') {
      where.userId = req.user.id;
    }
    
    // Optional filters
    if (req.query.status) {
      where.status = req.query.status;
    }
    
    if (req.query.paymentStatus) {
      where.paymentStatus = req.query.paymentStatus;
    }
    
    const orders = await Order.findAll({
      where,
      include: [{ model: User, attributes: ['id', 'username', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id - Get single order by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    // Check authorization: admin or order owner
    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this order' });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch order' });
  }
});

// POST /api/orders - Create new order
router.post('/', verifyToken, async (req, res) => {
  try {
    const { items, shippingAddress, billingAddress, paymentMethod, customerName, customerEmail, customerPhone } = req.body;
    
    // Validate required fields
    if (!items || items.length === 0 || !shippingAddress) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.price * item.quantity;
    }
    
    const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% tax
    const shippingCost = subtotal > 1000 ? 0 : 50; // Free shipping over 1000
    const total = subtotal + tax + shippingCost;
    
    const order = await Order.create({
      userId: req.user.id,
      items,
      subtotal,
      tax,
      shippingCost,
      total,
      customerName: customerName || req.user.username,
      customerEmail: customerEmail || req.user.email,
      customerPhone: customerPhone || '',
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      status: 'pending',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending'
    });
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
});

// PUT /api/orders/:id/status - Update order status (Admin only)
router.put('/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }
    
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    await order.updateStatus(status);
    
    res.json({
      success: true,
      message: 'Order status updated',
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to update order status' });
  }
});

// PUT /api/orders/:id/payment - Update payment status (Admin only)
router.put('/:id/payment', verifyToken, isAdmin, async (req, res) => {
  try {
    const { paymentStatus, paymentDetails } = req.body;
    
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (paymentDetails) order.paymentDetails = paymentDetails;
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Payment status updated',
      order
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ success: false, error: 'Failed to update payment status' });
  }
});

// POST /api/orders/:id/cancel - Cancel order
router.post('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    // Check authorization
    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to cancel this order' });
    }
    
    await order.cancel(reason || 'User cancelled');
    
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to cancel order' });
  }
});

module.exports = router;
