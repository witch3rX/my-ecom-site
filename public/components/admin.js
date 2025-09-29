// Enhanced Admin Panel JavaScript with Authentication
class AdminPanel {
    constructor() {
        this.currentTab = 'dashboard';
        this.adminUsers = ['admin@ir7.com']; // List of admin emails
        this.init();
    }

    init() {
        this.checkAdminAccess();
    }

    checkAdminAccess() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser) {
            this.showLoginModal();
            return;
        }

        // Check if current user is admin
        if (!this.isAdminUser(currentUser.email)) {
            this.showAccessDenied();
            return;
        }

        this.setupAdminUI(currentUser);
        this.setupEventListeners();
        this.loadDashboard();
    }

    isAdminUser(email) {
        return this.adminUsers.includes(email.toLowerCase());
    }

    showLoginModal() {
        const loginModal = document.createElement('div');
        loginModal.className = 'modal fade show d-block';
        loginModal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        loginModal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Admin Login Required</h5>
                    </div>
                    <div class="modal-body">
                        <p>Please log in with an admin account to access the admin panel.</p>
                        <div class="alert alert-warning">
                            <strong>Demo Admin Credentials:</strong><br>
                            Email: admin@ir7.com<br>
                            Password: admin123
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="window.location.href='auth.html'">
                            Go to Login
                        </button>
                        <button type="button" class="btn btn-primary" onclick="window.location.href='index.html'">
                            Back to Shop
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(loginModal);
    }

    showAccessDenied() {
        const accessDenied = document.createElement('div');
        accessDenied.className = 'modal fade show d-block';
        accessDenied.style.backgroundColor = 'rgba(0,0,0,0.5)';
        accessDenied.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title text-danger">Access Denied</h5>
                    </div>
                    <div class="modal-body">
                        <p>You don't have permission to access the admin panel.</p>
                        <p class="text-muted">Only authorized admin users can access this section.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" onclick="window.location.href='index.html'">
                            Back to Shop
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(accessDenied);
    }

    setupAdminUI(currentUser) {
        // Show admin content
        document.querySelector('.admin-container').style.display = 'block';
        
        // Update admin welcome message
        const welcomeElement = document.createElement('div');
        welcomeElement.className = 'navbar-text ms-3';
        welcomeElement.innerHTML = `<small class="text-white">Welcome, ${currentUser.firstName} (Admin)</small>`;
        document.querySelector('.navbar-nav').appendChild(welcomeElement);
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-link[data-tab]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = e.target.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });

        // Add product button
        document.getElementById('add-product-btn')?.addEventListener('click', () => {
            this.showProductModal();
        });

        // Save product
        document.getElementById('save-product')?.addEventListener('click', () => {
            this.saveProduct();
        });

        // Logout
        document.getElementById('admin-logout')?.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Show selected tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(`${tabName}-tab`).style.display = 'block';

        // Load tab data
        switch(tabName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'orders':
                this.loadOrders();
                break;
            case 'products':
                this.loadProducts();
                break;
            case 'users':
                this.loadUsers();
                break;
        }
    }

    async loadDashboard() {
        try {
            // Load orders
            const ordersResponse = await fetch('/api/admin/orders');
            const orders = await ordersResponse.json();
            
            // Load products from API
            const productsResponse = await fetch('/api/products');
            const products = await productsResponse.json();
            
            // Load users from localStorage
            const users = JSON.parse(localStorage.getItem('users')) || [];

            // Update dashboard stats
            document.getElementById('total-orders').textContent = orders.length;
            document.getElementById('pending-orders').textContent = 
                orders.filter(order => order.status === 'pending').length;
            document.getElementById('total-products').textContent = products.length;
            document.getElementById('total-users').textContent = users.length;

        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    async loadOrders() {
        try {
            const response = await fetch('/api/admin/orders');
            const orders = await response.json();
            
            const tbody = document.getElementById('orders-table-body');
            if (!tbody) return;

            tbody.innerHTML = orders.map(order => `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.customer?.firstName} ${order.customer?.lastName}</td>
                    <td>৳${order.totalAmount?.toLocaleString() || '0'}</td>
                    <td>
                        <select class="form-select form-select-sm order-status" data-order-id="${order.id}">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                    <td>${new Date(order.orderDate).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-order" data-order-id="${order.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `).join('');

            // Add event listeners for status changes
            tbody.querySelectorAll('.order-status').forEach(select => {
                select.addEventListener('change', (e) => {
                    this.updateOrderStatus(e.target.dataset.orderId, e.target.value);
                });
            });

        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }

    async updateOrderStatus(orderId, status) {
        try {
            const response = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                alert('Order status updated successfully');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Error updating order status');
        }
    }

    async loadProducts() {
        try {
            const response = await fetch('/api/products');
            const products = await response.json();
            
            const tbody = document.getElementById('products-table-body');
            if (!tbody) return;

            tbody.innerHTML = products.map(product => `
                <tr>
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>৳${product.price.toLocaleString()}</td>
                    <td>
                        <button class="btn btn-sm btn-warning edit-product" data-product-id="${product.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-product" data-product-id="${product.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');

            // Add event listeners for product actions
            tbody.querySelectorAll('.edit-product').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.editProduct(e.target.closest('button').dataset.productId);
                });
            });

            tbody.querySelectorAll('.delete-product').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.deleteProduct(e.target.closest('button').dataset.productId);
                });
            });

        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    loadUsers() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            </tr>
        `).join('');
    }

    showProductModal(product = null) {
        const modalElement = document.getElementById('productModal');
        if (!modalElement) return;

        const modal = new bootstrap.Modal(modalElement);
        const form = document.getElementById('product-form');
        
        if (product) {
            // Edit mode
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-description').value = product.description;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-image').value = product.image;
            document.getElementById('product-sizes').value = product.sizes ? product.sizes.join(', ') : '';
            document.querySelector('.modal-title').textContent = 'Edit Product';
        } else {
            // Add mode
            form.reset();
            document.querySelector('.modal-title').textContent = 'Add New Product';
        }
        
        modal.show();
    }

    async saveProduct() {
        const formData = {
            id: document.getElementById('product-id').value || Date.now(),
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            description: document.getElementById('product-description').value,
            price: parseInt(document.getElementById('product-price').value),
            image: document.getElementById('product-image').value,
            sizes: document.getElementById('product-sizes').value ? 
                   document.getElementById('product-sizes').value.split(',').map(s => s.trim()) : [],
            hasSizes: document.getElementById('product-sizes').value !== ''
        };

        // Basic validation
        if (!formData.name || !formData.description || !formData.price) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            // Send to server
            const response = await fetch('/api/admin/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Product saved successfully!');
                const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
                modal.hide();
                this.loadProducts();
            } else {
                alert('Error saving product');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error saving product');
        }
    }

    editProduct(productId) {
        // Fetch product details and show in modal
        fetch(`/api/products/${productId}`)
            .then(response => response.json())
            .then(product => {
                this.showProductModal(product);
            })
            .catch(error => {
                console.error('Error fetching product:', error);
                alert('Error loading product details');
            });
    }

    deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            fetch(`/api/admin/products/${productId}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    alert('Product deleted successfully!');
                    this.loadProducts();
                } else {
                    alert('Error deleting product');
                }
            })
            .catch(error => {
                console.error('Error deleting product:', error);
                alert('Error deleting product');
            });
        }
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminPanel();
});