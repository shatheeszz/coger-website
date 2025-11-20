// ========================================
// API Configuration for Coger Enterprises
// ========================================

const CONFIG = {
    // API Base URL - automatically switches between local and production
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : 'https://api.cogeragri.in/api',
    
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
