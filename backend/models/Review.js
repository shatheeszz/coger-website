const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 200]
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 2000]
    }
  },
  isVerifiedPurchase: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  helpfulCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  adminResponse: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  respondedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['productId'] },
    { fields: ['userId'] },
    { fields: ['rating'] },
    { fields: ['isApproved'] },
    { fields: ['createdAt'] },
    {
      unique: true,
      fields: ['productId', 'userId'],
      name: 'unique_product_user_review'
    }
  ]
});

// Hooks
Review.afterCreate(async (review) => {
  // Update product rating after creating a review
  const Product = require('./Product');
  await Product.updateRating(review.productId);
});

Review.afterUpdate(async (review) => {
  // Update product rating after updating a review
  if (review.changed('rating')) {
    const Product = require('./Product');
    await Product.updateRating(review.productId);
  }
});

Review.afterDestroy(async (review) => {
  // Update product rating after deleting a review
  const Product = require('./Product');
  await Product.updateRating(review.productId);
});

// Instance methods
Review.prototype.markHelpful = async function() {
  this.helpfulCount += 1;
  await this.save();
};

Review.prototype.addAdminResponse = async function(response) {
  this.adminResponse = response;
  this.respondedAt = new Date();
  await this.save();
};

Review.prototype.approve = async function() {
  this.isApproved = true;
  await this.save();
};

Review.prototype.reject = async function() {
  this.isApproved = false;
  await this.save();
};

// Static methods
Review.findByProduct = async function(productId, approved = true) {
  const where = { productId };
  if (approved !== null) {
    where.isApproved = approved;
  }
  
  return await this.findAll({
    where,
    order: [['createdAt', 'DESC']],
    include: [{
      model: require('./User'),
      attributes: ['id', 'username']
    }]
  });
};

Review.findByUser = async function(userId) {
  return await this.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    include: [{
      model: require('./Product'),
      attributes: ['id', 'name', 'image']
    }]
  });
};

Review.findPendingReviews = async function() {
  return await this.findAll({
    where: { isApproved: false },
    order: [['createdAt', 'ASC']]
  });
};

Review.getAverageRating = async function(productId) {
  const reviews = await this.findAll({
    where: {
      productId,
      isApproved: true
    }
  });
  
  if (reviews.length === 0) return 0;
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return (totalRating / reviews.length).toFixed(1);
};

Review.getRatingDistribution = async function(productId) {
  const reviews = await this.findAll({
    where: {
      productId,
      isApproved: true
    }
  });
  
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(review => {
    distribution[review.rating] = (distribution[review.rating] || 0) + 1;
  });
  
  return distribution;
};

module.exports = Review;
