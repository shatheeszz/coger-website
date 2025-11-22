const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  category: {
    type: DataTypes.ENUM('coconut', 'oil', 'coir', 'shell', 'copra', 'other'),
    allowNull: false,
    defaultValue: 'coconut'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  compareAtPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  sku: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'piece',
    validate: {
      isIn: [['piece', 'kg', 'liter', 'bundle', 'box']]
    }
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '/images/products/default.jpg'
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  specifications: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['category'] },
    { fields: ['sku'], unique: true },
    { fields: ['isActive'] },
    { fields: ['isFeatured'] }
  ]
});

// Instance methods
Product.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  return {
    ...values,
    price: parseFloat(values.price),
    compareAtPrice: values.compareAtPrice ? parseFloat(values.compareAtPrice) : null,
    rating: parseFloat(values.rating)
  };
};

// Static methods
Product.findByCategory = async function(category) {
  return await this.findAll({
    where: {
      category,
      isActive: true
    },
    order: [['createdAt', 'DESC']]
  });
};

Product.findFeatured = async function() {
  return await this.findAll({
    where: {
      isFeatured: true,
      isActive: true
    },
    order: [['rating', 'DESC']],
    limit: 8
  });
};

Product.searchProducts = async function(query) {
  const { Op } = require('sequelize');
  return await this.findAll({
    where: {
      [Op.or]: [
        { name: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } },
        { category: { [Op.like]: `%${query}%` } }
      ],
      isActive: true
    },
    order: [['rating', 'DESC']]
  });
};

Product.updateRating = async function(productId) {
  const Review = require('./Review');
  const reviews = await Review.findAll({ where: { productId } });
  
  if (reviews.length === 0) {
    await this.update(
      { rating: 0, reviewCount: 0 },
      { where: { id: productId } }
    );
    return;
  }
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const avgRating = (totalRating / reviews.length).toFixed(1);
  
  await this.update(
    { rating: avgRating, reviewCount: reviews.length },
    { where: { id: productId } }
  );
};

module.exports = Product;
