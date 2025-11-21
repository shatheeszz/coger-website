const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { Product } = require('../models');

// GET /api/products - Get all products with optional filtering
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    const where = { isActive: true };
    
    // Filter by category if provided
    if (category) {
      where.category = category;
    }
    
    // Search by name or description
    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      products,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
});

// GET /api/products/featured - Get featured products
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.findFeatured();
    res.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch featured products' });
  }
});

// GET /api/products/:id - Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    res.json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch product' });
  }
});

// POST /api/products - Create new product (Admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, description, category, price, compareAtPrice, stock, sku, unit, image, tags } = req.body;
    
    // Validate required fields
    if (!name || !description || !category || !price || !sku) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    const product = await Product.create({
      name,
      description,
      category,
      price,
      compareAtPrice: compareAtPrice || null,
      stock: stock || 0,
      sku,
      unit: unit || 'piece',
      image: image || '/images/products/default.jpg',
      tags: tags || [],
      isActive: true
    });
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, error: 'SKU already exists' });
    }
    res.status(500).json({ success: false, error: 'Failed to create product' });
  }
});

// PUT /api/products/:id - Update product (Admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    // Update fields
    const { name, description, category, price, compareAtPrice, stock, sku, unit, image, tags, isFeatured, isActive } = req.body;
    
    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (price !== undefined) product.price = price;
    if (compareAtPrice !== undefined) product.compareAtPrice = compareAtPrice;
    if (stock !== undefined) product.stock = stock;
    if (sku) product.sku = sku;
    if (unit) product.unit = unit;
    if (image) product.image = image;
    if (tags) product.tags = tags;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (isActive !== undefined) product.isActive = isActive;
    
    await product.save();
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id - Delete product (Admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    // Soft delete by setting isActive to false
    product.isActive = false;
    await product.save();
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, error: 'Failed to delete product' });
  }
});

module.exports = router;
