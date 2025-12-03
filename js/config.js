// ========================================
// API Configuration for Coger Enterprises
// ========================================

const CONFIG = {
    // API Base URL - automatically switches between local and production
    API_BASE_URL: (function() {
    const isProduction = window.location.hostname.includes('.cogeragri.in') || window.location.hostname.includes('coger.in');
    if (isProduction) return 'https://cuddly-carnival-vpx6765554xcxj77-3000.app.github.dev/api';
    
    // For Codespaces and localhost, use dynamic port
    const port = window.location.port ? ':' + window.location.port : '';
    return window.location.protocol + '//' + window.location.hostname + port + '/api';
  })(),
    
    // Application Settings
    APP_NAME: 'Coger Enterprises',
    CURRENCY: '₹',
    ITEMS_PER_PAGE: 12,
    LOW_STOCK_THRESHOLD: 10,
    
    // LocalStorage Keys
    STORAGE_KEYS: {
        AUTH_TOKEN: 'authToken',
        USER_DATA: 'userData',
        CART_ITEMS: 'cartItems'
    },
    
    // Product Categories
    CATEGORIES: ['All', 'Coconut', 'Dals', 'Equipment', 'Machinery', 'Others'],
    
    // Order Status Options
    ORDER_STATUS: {
        PENDING: 'pending',
        PROCESSING: 'processing',
        SHIPPED: 'shipped',
        DELIVERED: 'delivered',
        CANCELLED: 'cancelled'
    },
    
    // Payment Methods
    PAYMENT_METHODS: {
        COD: 'Cash on Delivery',
        UPI: 'UPI',
        CARD: 'Card',
        NET_BANKING: 'Net Banking'
    }
};

// Make config globally available
window.CONFIG = CONFIG;
