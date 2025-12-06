// Coger Admin Dashboard - Complete Implementation
// All modules: Products, Orders, Customers, Reviews

const db = {
  products: [
    {id: 1, name: 'Coconut Oil', sku: 'COO-001', category: 'Oils', price: 450, stock: 150, status: 'Active'},
    {id: 2, name: 'Desiccated Coconut', sku: 'DES-002', category: 'Powders', price: 280, stock: 15, status: 'Low Stock'},
    {id: 3, name: 'Coconut Milk', sku: 'MIL-003', category: 'Beverages', price: 120, stock: 2, status: 'Out of Stock'}
  ],
  orders: [
    {id: 'ORD-001', customer: 'Raj Kumar', date: '2025-12-04', amount: 2500, status: 'Delivered', payment: 'UPI'},
    {id: 'ORD-002', customer: 'Priya Singh', date: '2025-12-05', amount: 1800, status: 'Processing', payment: 'Card'},
    {id: 'ORD-003', customer: 'Amit Patel', date: '2025-12-06', amount: 3200, status: 'Pending', payment: 'Card'}
  ],
  customers: [
    {id: 1, name: 'Raj Kumar', email: 'raj@email.com', phone: '9876543210', orders: 5, spent: 12500},
    {id: 2, name: 'Priya Singh', email: 'priya@email.com', phone: '9876543211', orders: 3, spent: 7800},
    {id: 3, name: 'Amit Patel', email: 'amit@email.com', phone: '9876543212', orders: 8, spent: 25400}
  ],
  reviews: [
    {id: 1, customer: 'Raj', product: 'Coconut Oil', rating: 5, text: 'Excellent!', date: '2025-12-04', status: 'Approved'},
    {id: 2, customer: 'Priya', product: 'Desiccated Coconut', rating: 4, text: 'Good product', date: '2025-12-05', status: 'Pending'}
  ]
};

window.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupNav();
  refreshDash();
});

function checkAuth() {
  const token = localStorage.getItem('adminToken');
  if (!token) window.location.href = 'login.html';
}

function setupNav() {
  document.querySelectorAll('[data-section]').forEach(item => {
    item.addEventListener('click', () => switchSection(item.getAttribute('data-section')));
  });
}

function switchSection(id) {
  document.querySelectorAll('section').forEach(s => s.style.display = 'none');
  const section = document.getElementById(id);
  if (section) section.style.display = 'block';
  document.querySelectorAll('[data-section]').forEach(item => item.classList.remove('active'));
  document.querySelector(`[data-section="${id}"]`).classList.add('active');
  
  if (id === 'products') loadProducts();
  else if (id === 'orders') loadOrders();
  else if (id === 'customers') loadCustomers();
  else if (id === 'reviews') loadReviews();
}

function refreshDash() {
  document.querySelector('[data-metric="totalProducts"]').textContent = db.products.length;
  document.querySelector('[data-metric="totalOrders"]').textContent = db.orders.length;
  document.querySelector('[data-metric="totalCustomers"]').textContent = db.customers.length;
  const revenue = db.orders.reduce((sum, o) => sum + o.amount, 0);
  document.querySelector('[data-metric="monthlyRevenue"]').textContent = '₹' + revenue.toLocaleString();
  const lowStock = db.products.filter(p => p.stock < 20).length;
  document.querySelector('[data-metric="lowStockItems"]').textContent = lowStock;
  const pending = db.orders.filter(o => o.status === 'Pending').length;
  document.querySelector('[data-metric="pendingOrders"]').textContent = pending;
}

function loadProducts() {
  const list = document.getElementById('productsList');
  if (!list) return;
  list.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Name</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${db.products.map(p => `
          <tr>
            <td>${p.name}</td>
            <td>${p.sku}</td>
            <td>${p.category}</td>
            <td>₹${p.price}</td>
            <td>${p.stock}</td>
            <td><span class="badge badge-${p.status === 'Active' ? 'success' : p.status === 'Low Stock' ? 'warning' : 'danger'}">${p.status}</span></td>
            <td><button class="btn btn-small" onclick="editProduct(${p.id})">Edit</button> <button class="btn btn-danger btn-small" onclick="deleteProduct(${p.id})">Delete</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function loadOrders() {
  const list = document.getElementById('ordersList');
  if (!list) return;
  list.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Order ID</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th><th>Payment</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${db.orders.map(o => `
          <tr>
            <td>${o.id}</td>
            <td>${o.customer}</td>
            <td>${o.date}</td>
            <td>₹${o.amount}</td>
            <td><span class="badge badge-${o.status === 'Delivered' ? 'success' : o.status === 'Processing' ? 'info' : 'warning'}">${o.status}</span></td>
            <td>${o.payment}</td>
            <td><button class="btn btn-small" onclick="editOrder('${o.id}')">View</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function loadCustomers() {
  const list = document.getElementById('customersList');
  if (!list) return;
  list.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Total Spent</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${db.customers.map(c => `
          <tr>
            <td>${c.name}</td>
            <td>${c.email}</td>
            <td>${c.phone}</td>
            <td>${c.orders}</td>
            <td>₹${c.spent}</td>
            <td><button class="btn btn-small" onclick="viewCustomer(${c.id})">View</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function loadReviews() {
  const list = document.getElementById('reviewsList');
  if (!list) return;
  list.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Customer</th><th>Product</th><th>Rating</th><th>Review</th><th>Status</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${db.reviews.map(r => `
          <tr>
            <td>${r.customer}</td>
            <td>${r.product}</td>
            <td>${'⭐'.repeat(r.rating)}</td>
            <td>${r.text}</td>
            <td><span class="badge badge-${r.status === 'Approved' ? 'success' : 'warning'}">${r.status}</span></td>
            <td><button class="btn btn-success btn-small" onclick="approveReview(${r.id})">Approve</button> <button class="btn btn-danger btn-small" onclick="deleteReview(${r.id})">Reject</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function editProduct(id) {
  alert('Edit Product ' + id + ' (Feature coming soon)');
}

function deleteProduct(id) {
  if (confirm('Delete product?')) {
    db.products = db.products.filter(p => p.id !== id);
    loadProducts();
    showToast('Product deleted successfully', 'success');
  }
}

function editOrder(id) {
  alert('View Order ' + id + ' (Feature coming soon)');
}

function viewCustomer(id) {
  alert('View Customer ' + id + ' (Feature coming soon)');
}

function approveReview(id) {
  const review = db.reviews.find(r => r.id === id);
  if (review) {
    review.status = 'Approved';
    loadReviews();
    showToast('Review approved!', 'success');
  }
}

function deleteReview(id) {
  if (confirm('Delete this review?')) {
    db.reviews = db.reviews.filter(r => r.id !== id);
    loadReviews();
    showToast('Review deleted!', 'success');
  }
}

function showToast(msg, type) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function logout() {
  localStorage.removeItem('adminToken');
  window.location.href = 'login.html';
}
