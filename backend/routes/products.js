const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    // TODO: Fetch from database
    // const products = await Product.findAll();
    
    const mockProducts = [
      {
        id: 1,
        name: 'Organic Coconut Oil',
        description: 'Pure organic coconut oil',
        price: 350,
        stock: 50,
        category: 'Oils',
        image: '/uploads/coconut-oil.jpg'
      },
      {
        id: 2,
        name: 'Fresh Coconut Water',
        description: 'Natural coconut water',
        price: 45,
        stock: 100,
        category: 'Beverages',
        image: '/uploads/coconut-water.jpg'
      }
    ];

    res.json({ success: true, products: mockProducts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/products - Create new product (Admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    // TODO: Create in database
    // const product = await Product.create({ name, description, price, stock, category });
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: { id: 3, name, description, price, stock, category }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

module.exports = router;
