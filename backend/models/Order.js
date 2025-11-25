const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  orderNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    validate: {
      notEmpty: true
    }
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  shippingCost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  customerPhone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shippingAddress: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  billingAddress: {
    type: DataTypes.JSON,
    allowNull: true
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'cod'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending',
    allowNull: false
  },
  paymentDetails: {
    type: DataTypes.JSON,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  trackingNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

// Hooks
Order.beforeCreate(async (order) => {
  // Generate unique order number
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  order.orderNumber = `ORD-${timestamp}-${random}`;
});

// Instance methods
Order.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  return {
    ...values,
    subtotal: parseFloat(values.subtotal),
    tax: parseFloat(values.tax),
    discount: parseFloat(values.discount),
    shippingCost: parseFloat(values.shippingCost),
    total: parseFloat(values.total)
  };
};

Order.prototype.canCancel = function() {
  return ['pending', 'processing'].includes(this.status);
};

Order.prototype.cancel = async function(reason) {
  if (!this.canCancel()) {
    throw new Error('Order cannot be cancelled in current status');
  }
  
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  await this.save();
};

Order.prototype.updateStatus = async function(newStatus) {
  const validTransitions = {
    pending: ['processing', 'cancelled'],
    processing: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: []
  };
  
  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
  }
  
  this.status = newStatus;
  
  if (newStatus === 'delivered') {
    this.deliveredAt = new Date();
    this.paymentStatus = 'paid';
  }
  
  await this.save();
};

// Static methods
Order.findByUser = async function(userId) {
  return await this.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']]
  });
};

Order.findByStatus = async function(status) {
  return await this.findAll({
    where: { status },
    order: [['createdAt', 'DESC']]
  });
};

Order.findPendingOrders = async function() {
  return await this.findAll({
    where: {
      status: ['pending', 'processing']
    },
    order: [['createdAt', 'ASC']]
  });
};

Order.getTotalRevenue = async function(startDate, endDate) {
  const { Op } = require('sequelize');
  const orders = await this.findAll({
    where: {
      status: 'delivered',
      paymentStatus: 'paid',
      deliveredAt: {
        [Op.between]: [startDate, endDate]
      }
    }
  });
  
  return orders.reduce((total, order) => total + parseFloat(order.total), 0);
};

module.exports = Order;
