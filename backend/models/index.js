const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const Review = require('./Review');

// Define associations/relationships between models

// User-Order relationship (One-to-Many)
User.hasMany(Order, {
  foreignKey: 'userId',
  as: 'orders'
});
Order.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User-Review relationship (One-to-Many)
User.hasMany(Review, {
  foreignKey: 'userId',
  as: 'reviews'
});
Review.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Product-Review relationship (One-to-Many)
Product.hasMany(Review, {
  foreignKey: 'productId',
  as: 'reviews'
});
Review.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product'
});

// Export all models and sequelize instance
module.exports = {
  sequelize,
  User,
  Product,
  Order,
  Review
};
