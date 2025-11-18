// ========================================
// PART 1: API Configuration & Authentication
// ========================================

// API Base URL - Change this to your deployed backend URL
const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to make API calls with authentication
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    const config = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        showToast(error.message, 'error');
        throw error;
    }
}

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Logout function
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = 'login.html';
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.background = type === 'error' ? '#d9534f' : '#2d5016';
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.pointerEvents = 'auto';
    }, 100);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}


// ========================================
// PART 2: Dashboard Data Loading
// ========================================

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const data = await apiCall('/dashboard');
        
        if (data.success && data.data) {
            const stats = data.data;
            
            // Update dashboard cards
            document.getElementById('dashboardTotalProducts').textContent = stats.totalProducts || 0;
            document.getElementById('dashboardTotalOrders').textContent = stats.totalOrders || 0;
            document.getElementById('dashboardTotalCustomers').textContent = stats.totalCustomers || 0;
            document.getElementById('dashboardMonthlySales').textContent = `₹${stats.totalRevenue?.toLocaleString() || 0}`;
            document.getElementById('dashboardLowStock').textContent = stats.lowStockProducts || 0;
            document.getElementById('dashboardPendingOrders').textContent = stats.pendingOrders || 0;
            
            showToast('Dashboard loaded successfully!');
        }
    } catch (error) {
        console.error('Failed to load dashboard:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

// Load sales analytics
async function loadSalesAnalytics() {
    try {
        const data = await apiCall('/dashboard/sales');
        
        if (data.success && data.data) {
            // You can use this data to populate charts
            console.log('Sales data loaded:', data.data);
        }
    } catch (error) {
        console.error('Failed to load sales analytics:', error);
    }
}

// ========================================
// PART 3: Product Management
// ========================================

// Load all products
async function loadProducts() {
    try {
        const data = await apiCall('/products');
        
        if (data.success && data.products) {
            displayProducts(data.products);
            showToast('Products loaded successfully!');
        }
    } catch (error) {
        console.error('Failed to load products:', error);
        showToast('Failed to load products', 'error');
    }
}

// Display products in table
function displayProducts(products) {
    const tbody = document.querySelector('#products table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.category || 'N/A'}</td>
            <td>₹${product.price?.toLocaleString() || 0}</td>
            <td>${product.stock || 0}</td>
            <td>
                <span class="badge ${product.stock > 10 ? 'badge-success' : 'badge-warning'}">
                    ${product.stock > 10 ? 'In Stock' : 'Low Stock'}
                </span>
            </td>
            <td class="action-buttons">
                <button class="btn-info" onclick="editProduct(${product.id})">✏️ Edit</button>
                <button class="btn-danger" onclick="deleteProduct(${product.id})">🗑️ Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Show add product form
function showAddProductForm() {
    document.getElementById('productFormContainer').style.display = 'block';
    document.getElementById('productForm').reset();
    document.getElementById('editProductId').value = '';
}

// Save product (add or update)
async function saveProduct(event) {
    event.preventDefault();
    
    const productData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        description: document.getElementById('productDesc').value
    };
    
    const productId = document.getElementById('editProductId').value;
    
    try {
        const endpoint = productId ? `/products/${productId}` : '/products';
        const method = productId ? 'PUT' : 'POST';
        
        const data = await apiCall(endpoint, {
            method,
            body: JSON.stringify(productData)
        });
        
        if (data.success) {
            showToast(productId ? 'Product updated!' : 'Product added!');
            document.getElementById('productFormContainer').style.display = 'none';
            loadProducts();
        }
    } catch (error) {
        console.error('Failed to save product:', error);
    }
}

// Delete product
async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const data = await apiCall(`/products/${id}`, {
            method: 'DELETE'
        });
        
        if (data.success) {
            showToast('Product deleted!');
            loadProducts();
        }
    } catch (error) {
        console.error('Failed to delete product:', error);
    }
}

// ========================================
// PART 4: Orders & Page Initialization
// ========================================

// Load orders
async function loadOrders() {
    try {
        const data = await apiCall('/orders');
        
        if (data.success && data.orders) {
            displayOrders(data.orders);
            showToast('Orders loaded successfully!');
        }
    } catch (error) {
        console.error('Failed to load orders:', error);
        showToast('Failed to load orders', 'error');
    }
}

// Display orders in table
function displayOrders(orders) {
    const tbody = document.querySelector('#orders table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        const statusBadge = {
            'pending': 'badge-warning',
            'processing': 'badge-info',
            'shipped': 'badge-primary',
            'delivered': 'badge-success',
            'cancelled': 'badge-danger'
        }[order.status] || 'badge-secondary';
        
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${order.customerName || 'N/A'}</td>
            <td>₹${order.totalAmount?.toLocaleString() || 0}</td>
            <td><span class="badge ${statusBadge}">${order.status}</span></td>
            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            <td class="action-buttons">
                <button class="btn-info" onclick="viewOrder(${order.id})">👁️ View</button>
                <button class="btn-success" onclick="updateOrderStatus(${order.id})">✔️ Update</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!checkAuth()) return;
    
    // Load dashboard data on page load
    loadDashboardStats();
    loadSalesAnalytics();
    
    // Load products and orders
    loadProducts();
    loadOrders();
    
    console.log('Admin dashboard initialized');
});
