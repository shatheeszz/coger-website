const { User } = require('./models');
const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');

/**
 * Seed admin user for Coger Enterprises
 * Run: node seedAdminUser.js
 */

async function seedAdminUser() {
  try {
    // Ensure database is synced
    await sequelize.sync({ alter: true });
    console.log('Database synced...');

    // Check if admin user already exists
    const existingUser = await User.findOne({ where: { email: 'admin@coger.in' } });
    
    if (existingUser) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin@1', salt);

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@coger.in',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Coger',
      phone: '+91-9999999999',
      role: 'admin'
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@coger.in');
    console.log('Password: admin@1');
    console.log('User ID:', adminUser.id);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error.message);
    process.exit(1);
  }
}

seedAdminUser();
