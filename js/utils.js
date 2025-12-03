// ========================================
// Utility Functions for Coger Enterprises
// ========================================

// API Call with Authentication
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    
    const config = { ...defaultOptions, ...options, headers: { ...defaultOptions.headers, ...options.headers } };
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, config);
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.clear();
                window.location.href = 'login.html';
            }
            throw new Error(typeof data.error === 'string' ? data.error : (data.error?.message || 'API request failed'));
        }
        return data;
    } catch (error) {
        console.error('API Error:', error);
        showToast(error.message, 'error');
        throw error;
    }
}

// Toast Notification System
function showToast(message, type = 'success') {
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span><button onclick="this.parentElement.remove()">×</button>`;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
}

// Authentication Functions
function checkAuth() {
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// Format Currency
function formatCurrency(amount) {
    return `${CONFIG.CURRENCY}${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Cart Management Functions
function getCart() {
    const cart = localStorage.getItem(CONFIG.STORAGE_KEYS.CART_ITEMS);
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cartItems) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.CART_ITEMS, JSON.stringify(cartItems));
    updateCartBadge();
}

function addToCart(product, quantity = 1) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, quantity, stock: product.stock });
    }
    
    saveCart(cart);
    showToast(`${product.name} added to cart!`, 'success');
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
}

function updateCartQuantity(productId, quantity) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            saveCart(cart);
        }
    }
}

function getCartTotal() {
    return getCart().reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getCartCount() {
    return getCart().reduce((count, item) => count + item.quantity, 0);
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
        const count = getCartCount();
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
});
