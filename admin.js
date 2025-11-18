// ========================================
// PART 1: API Configuration & Authentication
// ========================================

const API_BASE_URL = 'http://localhost:3000/api';

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

function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = 'login.html';
}

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
// PART 2: Dashboard Stats & Analytics
// ========================================

async function updateDashboard() {
    try {
        const data = await apiCall('/dashboard');
        if (data.success && data.data) {
            const stats = data.data;
            document.getElementById('dashboardTotalProducts').textContent = stats.totalProducts || 0;
            document.getElementById('dashboardTotalOrders').textContent = stats.totalOrders || 0;
            document.getElementById('dashboardTotalCustomers').textContent = stats.totalCustomers || 0;
            document.getElementById('dashboardMonthlySales').textContent = `₹${stats.totalRevenue?.toLocaleString() || 0}`;
            document.getElementById('dashboardLowStock').textContent = stats.lowStockProducts || 0;
            document.getElementById('dashboardPendingOrders').textContent = stats.pendingOrders || 0;
        }
    } catch (error) {
        console.error('Failed to load dashboard:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

async function renderAnalytics() {
    // Fetch required analytics data and display charts (using Chart.js)
    try {
        const salesData = await apiCall('/dashboard/sales');
        // render charts here with salesData
        console.log('Sales analytics:', salesData);
        // For brevity, implement charts as needed using Chart.js
    } catch (error) {
        console.error('Failed to load sales analytics:', error);
    }
}

// ========================================
// PART 3: Products Dashboard
// ========================================

async function loadProducts() {
    try {
        const data = await apiCall('/products');
        if (data.success && data.products) {
            displayProducts(data.products);
        }
    } catch (error) {
        console.error('Failed to load products:', error);
        showToast('Failed to load products', 'error');
    }
}

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
          <td>
            <button class="btn-info" onclick="editProduct(${product.id})">✏️ Edit</button>
            <button class="btn-danger" onclick="deleteProduct(${product.id})">🗑️ Delete</button>
          </td>`;
        tbody.appendChild(row);
    });
}

function showAddProductForm() {
    document.getElementById('productFormContainer').style.display = 'block';
    document.getElementById('productForm').reset();
    document.getElementById('editProductId').value = '';
}

async function saveProduct(event) {
    event.preventDefault();
    const productId = document.getElementById('editProductId').value;

    const productData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        description: document.getElementById('productDesc').value
    };

    try {
        const endpoint = productId ? `/products/${productId}` : '/products';
        const method = productId ? 'PUT' : 'POST';

        const data = await apiCall(endpoint, { method, body: JSON.stringify(productData) });
        if (data.success) {
            showToast(productId ? 'Product updated!' : 'Product added!');
            document.getElementById('productFormContainer').style.display = 'none';
            loadProducts();
        }
    } catch (error) {
        console.error('Failed to save product:', error);
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
        const data = await apiCall(`/products/${id}`, { method: 'DELETE' });
        if (data.success) {
            showToast('Product deleted!');
            loadProducts();
        }
    } catch (error) {
        console.error('Failed to delete product:', error);
    }
}

function editProduct(id) {
    // Implement fetching product and populating form or fetch via API
    alert('Edit product feature to be implemented');
}

// ========================================
// PART 4: Orders Dashboard
// ========================================

async function loadOrders() {
    try {
        const data = await apiCall('/orders');
        if (data.success && data.orders) {
            displayOrders(data.orders);
        }
    } catch (error) {
        console.error('Failed to load orders:', error);
        showToast('Failed to load orders', 'error');
    }
}

function displayOrders(orders) {
    const tbody = document.querySelector('#orders table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    orders.forEach(order => {
        const statusBadge = {
            'pending': 'badge-warning',
            'processing': 'badge-info',
            'shipped': 'badge-primary',
            'delivered': 'badge-success',
            'cancelled': 'badge-danger'
        }[order.status] || 'badge-secondary';
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>#${order.id}</td>
          <td>${order.customerName || 'N/A'}</td>
          <td>₹${order.totalAmount?.toLocaleString() || 0}</td>
          <td><span class="badge ${statusBadge}">${order.status}</span></td>
          <td>${new Date(order.createdAt).toLocaleDateString()}</td>
          <td>
            <button class="btn-info" onclick="viewOrder(${order.id})">👁️ View</button>
            <button class="btn-success" onclick="updateOrderStatus(${order.id})">✔️ Update</button>
          </td>`;
        tbody.appendChild(row);
    });
}

function viewOrder(id) {
    alert(`View details for order ${id} - to be implemented`);
}

function updateOrderStatus(id) {
    alert(`Update status for order ${id} - to be implemented`);
}

// ========================================
// PART 5: Customers Dashboard
// ========================================

async function loadCustomers() {
    try {
        const data = await apiCall('/customers');
        if (data.success && data.customers) {
            displayCustomers(data.customers);
        }
    } catch (error) {
        console.error('Failed to load customers:', error);
        showToast('Failed to load customers', 'error');
    }
}

function displayCustomers(customers) {
    const tbody = document.querySelector('#customers table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    customers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${customer.name}</td>
          <td>${customer.email}</td>
          <td>${customer.phone}</td>
          <td>${customer.totalOrders || 0}</td>
          <td>₹${customer.totalSpent?.toLocaleString() || 0}</td>
          <td>${customer.loyaltyPoints || 0}</td>
          <td><button class="btn-info" onclick="viewCustomer(${customer.id})">View</button></td>`;
        tbody.appendChild(row);
    });
}

function viewCustomer(id) {
    alert(`View customer details for ${id} - to be implemented`);
}

// ========================================
// PART 6: Finances, Loyalty & Reviews - placeholders/scaffolds
// ========================================

function renderFinances() {
    alert('Finance management dashboard to be implemented');
}

function renderLoyalty() {
    alert('Loyalty program dashboard to be implemented');
}

function renderReviews() {
    alert('Customer reviews dashboard to be implemented');
}

// ========================================
// PART 7: Initialization and Navigation
// ========================================

const menuItems = document.querySelectorAll('.menu-item');
const sections = document.querySelectorAll('main section');

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        sections.forEach(s => (s.style.display = 'none'));
        const sectionId = item.getAttribute('data-section');
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
            section.focus();
        }

        // Map section to function
        switch (sectionId) {
            case 'dashboard': updateDashboard(); break;
            case 'products': loadProducts(); break;
            case 'orders': loadOrders(); break;
            case 'customers': loadCustomers(); break;
            case 'analytics': renderAnalytics(); break;
            case 'finances': renderFinances(); break;
            case 'loyalty': renderLoyalty(); break;
            case 'reviews': renderReviews(); break;
            default: break;
        }
    });
});

window.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    document.querySelector('.menu-item.active').click();
});
