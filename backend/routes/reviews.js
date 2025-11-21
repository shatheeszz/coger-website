const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { Review, Product } = require('../models');

// GET /api/reviews/product/:productId - Get all reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.findByProduct(req.params.productId, true);
    
    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
});

// GET /api/reviews/product/:productId/stats - Get review statistics
router.get('/product/:productId/stats', async (req, res) => {
  try {
    const avgRating = await Review.getAverageRating(req.params.productId);
    const distribution = await Review.getRatingDistribution(req.params.productId);
    
    res.json({
      success: true,
      stats: {
        averageRating: avgRating,
        distribution
      }
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch review stats' });
  }
});

// GET /api/reviews/pending - Get pending reviews (Admin only)
router.get('/pending', verifyToken, isAdmin, async (req, res) => {
  try {
    const reviews = await Review.findPendingReviews();
    
    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch pending reviews' });
  }
});

// POST /api/reviews - Create new review
router.post('/', verifyToken, async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    
    // Validate required fields
    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }
    
    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      where: {
        productId,
        userId: req.user.id
      }
    });
    
    if (existingReview) {
      return res.status(400).json({ success: false, error: 'You have already reviewed this product' });
    }
    
    const review = await Review.create({
      productId,
      userId: req.user.id,
      rating,
      title: title || '',
      comment,
      isApproved: true // Auto-approve for now, can be changed to manual approval
    });
    
    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, error: 'Failed to create review' });
  }
});

// PUT /api/reviews/:id - Update review
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    
    // Check authorization: review owner or admin
    if (review.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this review' });
    }
    
    const { rating, title, comment } = req.body;
    
    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
      }
      review.rating = rating;
    }
    
    if (title !== undefined) review.title = title;
    if (comment) review.comment = comment;
    
    await review.save();
    
    res.json({
      success: true,
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ success: false, error: 'Failed to update review' });
  }
});

// POST /api/reviews/:id/approve - Approve review (Admin only)
router.post('/:id/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    
    await review.approve();
    
    res.json({
      success: true,
      message: 'Review approved successfully',
      review
    });
  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({ success: false, error: 'Failed to approve review' });
  }
});

// POST /api/reviews/:id/reject - Reject review (Admin only)
router.post('/:id/reject', verifyToken, isAdmin, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    
    await review.reject();
    
    res.json({
      success: true,
      message: 'Review rejected successfully',
      review
    });
  } catch (error) {
    console.error('Error rejecting review:', error);
    res.status(500).json({ success: false, error: 'Failed to reject review' });
  }
});

// POST /api/reviews/:id/helpful - Mark review as helpful
router.post('/:id/helpful', async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    
    await review.markHelpful();
    
    res.json({
      success: true,
      message: 'Review marked as helpful',
      review
    });
  } catch (error) {
    console.error('Error marking review helpful:', error);
    res.status(500).json({ success: false, error: 'Failed to mark review helpful' });
  }
});

// DELETE /api/reviews/:id - Delete review
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    
    // Check authorization: review owner or admin
    if (review.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this review' });
    }
    
    await review.destroy();
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ success: false, error: 'Failed to delete review' });
  }
});

module.exports = router;
