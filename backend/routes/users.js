const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');

// GET /api/users - Get all users (Admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    // TODO: Fetch from database
    const mockUsers = [
      { id: 1, name: 'Admin User', email: 'admin@coger.in', role: 'admin' },
      { id: 2, name: 'John Doe', email: 'john@example.com', role: 'customer' }
    ];

    res.json({ success: true, users: mockUsers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/me - Get current user profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    // TODO: Fetch from database using req.user.id
    const mockUser = {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      name: 'Current User'
    };

    res.json({ success: true, user: mockUser });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

module.exports = router;
