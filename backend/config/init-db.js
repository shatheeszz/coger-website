const { sequelize, User, Product, Order, Review } = require('../models');
const bcrypt = require('bcryptjs');

// Sample data for seeding
const sampleProducts = [
  {
    name: 'Fresh Coconut',
    description: 'Farm-fresh tender coconuts, perfect for drinking water and enjoying the soft flesh',
    category: 'coconut',
    price: 45.00,
    compareAtPrice: 50.00,
    stock: 100,
    sku: 'COC-001',
    unit: 'piece',
    isFeatured: true,
    image: '/images/products/fresh-coconut.jpg',
    tags: ['fresh', 'organic', 'best-seller']
  },
  {
    name: 'Coconut Oil (500ml)',
    description: 'Premium quality cold-pressed coconut oil, 100% pure and natural',
    category: 'oil',
    price: 250.00,
    stock: 50,
    sku: 'OIL-001',
    unit: 'liter',
    isFeatured: true,
    image: '/images/products/coconut-oil.jpg',
    tags: ['oil', 'cooking', 'organic']
  },
  {
    name: 'Coir Rope (10m)',
    description: 'Strong and durable coir rope made from coconut fiber',
    category: 'coir',
    price: 150.00,
    stock: 75,
    sku: 'COIR-001',
    unit: 'bundle',
    image: '/images/products/coir-rope.jpg',
    tags: ['coir', 'rope', 'eco-friendly']
  },
  {
    name: 'Coconut Shell Bowls (Set of 4)',
    description: 'Handcrafted bowls made from natural coconut shells',
    category: 'shell',
    price: 300.00,
    compareAtPrice: 350.00,
    stock: 30,
    sku: 'SHELL-001',
    unit: 'box',
    image: '/images/products/shell-bowls.jpg',
    tags: ['shell', 'handicraft', 'eco-friendly']
  },
  {
    name: 'Dried Copra (1kg)',
    description: 'High-quality dried coconut kernel for oil extraction',
    category: 'copra',
    price: 120.00,
    stock: 200,
    sku: 'COPRA-001',
    unit: 'kg',
    image: '/images/products/copra.jpg',
    tags: ['copra', 'dried']
  }
];

async function initializeDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    console.log('🔄 Syncing models with database...');
    await sequelize.sync({ force: true }); // WARNING: This will drop all tables!
    console.log('✅ Models synchronized');
    
    console.log('🔄 Creating admin user...');
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@cogerenterprises.com',
      password: 'admin123', // Will be hashed automatically by the User model
      role: 'admin',
      phone: '+91 9876543210',
      address: 'Coger Enterprises HQ, Tamil Nadu'
    });
    console.log('✅ Admin user created');
    
    console.log('🔄 Creating customer users...');
    const customers = await Promise.all([
      User.create({
        username: 'customer1',
        email: 'customer1@example.com',
        password: 'password123',
        role: 'customer',
        phone: '+91 9876543211'
      }),
      User.create({
        username: 'customer2',
        email: 'customer2@example.com',
        password: 'password123',
        role: 'customer',
        phone: '+91 9876543212'
      })
    ]);
    console.log('✅ Customer users created');
    
    console.log('🔄 Creating products...');
    const products = await Promise.all(
      sampleProducts.map(product => Product.create(product))
    );
    console.log('✅ Products created');
    
    console.log('🔄 Creating sample orders...');
    const order1 = await Order.create({
      userId: customers[0].id,
      items: [
        { productId: products[0].id, name: products[0].name, quantity: 5, price: products[0].price },
        { productId: products[1].id, name: products[1].name, quantity: 2, price: products[1].price }
      ],
      subtotal: (5 * products[0].price) + (2 * products[1].price),
      tax: 50.00,
      total: (5 * products[0].price) + (2 * products[1].price) + 50.00,
      customerName: customers[0].username,
      customerEmail: customers[0].email,
      customerPhone: customers[0].phone,
      shippingAddress: {
        street: '123 Main St',
        city: 'Chennai',
        state: 'Tamil Nadu',
        zipCode: '600001',
        country: 'India'
      },
      paymentMethod: 'cod',
      status: 'delivered',
      paymentStatus: 'paid'
    });
    console.log('✅ Sample orders created');
    
    console.log('🔄 Creating sample reviews...');
    await Review.create({
      productId: products[0].id,
      userId: customers[0].id,
      rating: 5,
      title: 'Excellent Quality',
      comment: 'Very fresh coconuts! The water was sweet and the flesh was soft. Highly recommended.',
      isVerifiedPurchase: true
    });
    await Review.create({
      productId: products[1].id,
      userId: customers[1].id,
      rating: 4,
      title: 'Good Oil',
      comment: 'The coconut oil is pure and has a nice aroma. Using it for cooking and it works great.',
      isVerifiedPurchase: false
    });
    console.log('✅ Sample reviews created');
    
    console.log('\n🎉 Database initialization complete!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${await User.count()}`);
    console.log(`   Products: ${await Product.count()}`);
    console.log(`   Orders: ${await Order.count()}`);
    console.log(`   Reviews: ${await Review.count()}`);
    console.log('\n🔑 Admin credentials:');
    console.log('   Email: admin@cogerenterprises.com');
    console.log('   Password: admin123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
