const sequelize = require('../config/database');
const User = require('./User');
const Order = require('./Order');

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

module.exports = {
  sequelize,
  User,
  Order
};
