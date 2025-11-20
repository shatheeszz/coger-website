// ==================================================
// Coger Enterprises - Admin Dashboard JavaScript
// Uses config.js and utils.js for centralized functions
// ==================================================

// Check authentication on page load
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupNavigation();
    refreshDashboard();
});

// ==================================================
// Navigation & Section Switching
// ==================================================

function setupNavigation() {
    const menuItems = document.querySelectorAll('.menu-item[data-section]');
    
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.getAttribute('data-section');
            switchSection(sectionId);
            
            // Update active state
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function switchSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.focus();
    }
    
    // Load data based on section
    switch (sectionId) {
        case 'dashboard':
            refreshDashboard();
            break;
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'customers':
            loadCustomers();
            break;
        case 'reviews':
            loadReviews();
            break;
        default:
            break;
    }
}

// ==================================================
// Dashboard Functions
// ==================================================

async function refreshDashboard() {
    try {
        // Fetch dashboard stats
        const stats = await apiCall('/admin/dashboard');
        
        // Update dashboard cards
        document.getElementById('dashboardTotalProducts').textContent = stats.totalProducts || 0;
        document.getElementById('dashboardTotalOrders').textContent = stats.totalOrders || 0;
        document.getElementById('dashboardTotalCustomers').textContent = stats.totalCustomers || 0;
        document.getElementById('dashboardMonthlySales').textContent = `₹${stats.monthlySales || 0}`;
        document.getElementById('dashboardLowStock').textContent = stats.lowStock || 0;
        document.getElementById('dashboardPendingOrders').textContent = stats.pendingOrders || 0;
        
    } catch (error) {
        showToast('Failed to load dashboard data', 'error');
        console.error('Dashboard error:', error);
    }
}

// ==================================================
// Products Management
// ==================================================

async function loadProducts() {
    try {
        const products = await apiCall('/products');
        displayProducts(products);
    } catch (error) {
        showToast('Failed to load products', 'error');
        console.error('Products error:', error);
    }
}

function displayProducts(products) {
    const productsList = document.getElementById('productsList');
    
    if (!products || products.length === 0) {
        productsList.innerHTML = '<p>No products found. Click "+ Add Product" to create one.</p>';
        return;
    }
    
    let html = '<table><thead><tr><th>ID</th><th>Name</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody>';
    
    products.forEach(product => {
        html += `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>₹${product.price}</td>
                <td>${product.stock}</td>
                <td>
                    <button class="btn-info small-btn" onclick="editProduct(${product.id})">Edit</button>
                    <button class="btn-danger small-btn" onclick="deleteProduct(${product.id})">Delete</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    productsList.innerHTML = html;
}

function showAddProductForm() {
    showToast('Add product form coming soon...');
}

function editProduct(id) {
    showToast(`Edit product ${id} - Feature coming soon...`);
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        await apiCall(`/products/${id}`, { method: 'DELETE' });
        showToast('Product deleted successfully');
        loadProducts();
    } catch (error) {
        showToast('Failed to delete product', 'error');
    }
}

// ==================================================
// Orders Management
// ==================================================

async function loadOrders() {
    try {
        const orders = await apiCall('/orders');
        displayOrders(orders);
    } catch (error) {
        showToast('Failed to load orders', 'error');
    }
}

function displayOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    
    if (!orders || orders.length === 0) {
        ordersList.innerHTML = '<p>No orders found.</p>';
        return;
    }
    
    let html = '<table><thead><tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
    
    orders.forEach(order => {
        html += `
            <tr>
                <td>#${order.id}</td>
                <td>${order.customerName}</td>
                <td>${new Date(order.date).toLocaleDateString()}</td>
                <td>₹${order.total}</td>
                <td>${order.status}</td>
                <td>
                    <button class="btn-info small-btn" onclick="viewOrder(${order.id})">View</button>
                    <button class="btn-success small-btn" onclick="updateOrderStatus(${order.id})">Update</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    ordersList.innerHTML = html;
}

function viewOrder(id) {
    showToast(`View order #${id} - Feature coming soon...`);
}

function updateOrderStatus(id) {
    showToast(`Update order #${id} status - Feature coming soon...`);
}

// ==================================================
// Customers Management
// ==================================================

async function loadCustomers() {
    try {
        const customers = await apiCall('/customers');
        displayCustomers(customers);
    } catch (error) {
        showToast('Failed to load customers', 'error');
    }
}

function displayCustomers(customers) {
    const customersList = document.getElementById('customersList');
    
    if (!customers || customers.length === 0) {
        customersList.innerHTML = '<p>No customers found.</p>';
        return;
    }
    
    let html = '<table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Actions</th></tr></thead><tbody>';
    
    customers.forEach(customer => {
        html += `
            <tr>
                <td>${customer.id}</td>
                <td>${customer.name}</td>
                <td>${customer.email}</td>
                <td>${customer.phone || 'N/A'}</td>
                <td>${customer.orderCount || 0}</td>
                <td>
                    <button class="btn-info small-btn" onclick="viewCustomer(${customer.id})">View</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    customersList.innerHTML = html;
}

function viewCustomer(id) {
    showToast(`View customer #${id} - Feature coming soon...`);
}

// ==================================================
// Reviews Management
// ==================================================

async function loadReviews() {
    try {
        const reviews = await apiCall('/reviews');
        displayReviews(reviews);
    } catch (error) {
        showToast('Failed to load reviews', 'error');
    }
}

function displayReviews(reviews) {
    const reviewsList = document.getElementById('reviewsList');
    
    if (!reviews || reviews.length === 0) {
        reviewsList.innerHTML = '<p>No reviews found.</p>';
        return;
    }
    
    let html = '<table><thead><tr><th>Product</th><th>Customer</th><th>Rating</th><th>Comment</th><th>Date</th><th>Actions</th></tr></thead><tbody>';
    
    reviews.forEach(review => {
        html += `
            <tr>
                <td>${review.productName}</td>
                <td>${review.customerName}</td>
                <td>⭐ ${review.rating}/5</td>
                <td>${review.comment}</td>
                <td>${new Date(review.date).toLocaleDateString()}</td>
                <td>
                    <button class="btn-danger small-btn" onclick="deleteReview(${review.id})">Delete</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    reviewsList.innerHTML = html;
}

async function deleteReview(id) {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
        await apiCall(`/reviews/${id}`, { method: 'DELETE' });
        showToast('Review deleted successfully');
        loadReviews();
    } catch (error) {
        showToast('Failed to delete review', 'error');
    }
}
