// components/admin.js - Fixed Admin Panel (Security Update)
import { AuthSystem } from './auth.js';

/**
 * Enhanced Admin Panel JavaScript with Modular Authentication and API Integration
 */
class AdminPanel {
    constructor() {
        this.currentTab = 'dashboard';
        this.adminUsers = ['admin@ir7.com']; 
        this.categories = [];
        this.users = [];
        this.products = [];
        this.orders = [];
        this.init();
    }

    init() {
        this.checkAdminAccess();
    }

    checkAdminAccess() {
        const currentUser = AuthSystem.getCurrentUser();
        
        if (!currentUser) {
            this.showAccessDenied('Authentication Required', 'Please log in to access the admin panel.');
            return;
        }

        if (!this.isAdminUser(currentUser.email)) {
            this.showAccessDenied('Access Denied', 'You do not have permission to access the admin panel.');
            return;
        }

        this.setupAdminUI(currentUser);
        this.setupEventListeners();
        this.loadDashboard();
        this.loadCategories(); 
    }
    
    isAdminUser(email) {
        return this.adminUsers.includes(email.toLowerCase());
    }

    showAccessDenied(title, message) {
        const accessDenied = document.createElement('div');
        accessDenied.className = 'modal fade show d-block';
        accessDenied.style.backgroundColor = 'rgba(0,0,0,0.5)';
        accessDenied.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title text-danger">${title}</h5>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                        <p class="text-muted">Contact the system administrator if you believe this is an error.</p>
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
        document.body.appendChild(accessDenied);
    }

    setupAdminUI(currentUser) {
        document.querySelector('.admin-container').style.display = 'block';
        
        const welcomeElement = document.createElement('div');
        welcomeElement.className = 'navbar-text ms-3';
        welcomeElement.innerHTML = `<small class="text-white">Welcome, ${currentUser.firstName} (Admin)</small>`;
        document.querySelector('.navbar-nav').appendChild(welcomeElement);
    }
    
    setupEventListeners() {
        document.querySelectorAll('.nav-link[data-tab]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = e.target.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });

        document.getElementById('add-product-btn')?.addEventListener('click', () => {
            this.showProductModal();
        });

        document.getElementById('save-product')?.addEventListener('click', () => {
            this.saveProduct();
        });

        document.getElementById('add-category-btn')?.addEventListener('click', () => {
            this.showCategoryModal();
        });

        document.getElementById('save-category')?.addEventListener('click', () => {
            this.saveCategory();
        });

        // Event delegation for table actions
        document.getElementById('products-table-body')?.addEventListener('click', (e) => {
            this.handleProductActions(e);
        });
        document.getElementById('categories-table-body')?.addEventListener('click', (e) => {
            this.handleCategoryActions(e);
        });
        document.getElementById('orders-table-body')?.addEventListener('click', (e) => {
            this.handleOrderActions(e);
        });
        document.getElementById('users-table-body')?.addEventListener('click', (e) => {
            this.handleUserActions(e);
        });

        document.getElementById('admin-logout')?.addEventListener('click', (e) => {
            e.preventDefault();
            AuthSystem.signOut(); 
            window.location.href = 'index.html';
        });
    }

    switchTab(tabName) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(`${tabName}-tab`).style.display = 'block';

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
            case 'categories':
                this.loadCategories();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
        }
    }

    // ==================== FIXED: LOAD OPERATIONS ====================
    async loadDashboard() {
        try {
            const [ordersResponse, productsResponse, usersResponse] = await Promise.all([
                fetch('/api/admin/orders').catch(() => ({ ok: false })),
                fetch('/api/products').catch(() => ({ ok: false })),
                fetch('/api/admin/users').catch(() => ({ ok: false }))
            ]);

            let orders = [];
            let products = [];
            let users = [];

            if (ordersResponse.ok) orders = await ordersResponse.json();
            if (productsResponse.ok) products = await productsResponse.json();
            if (usersResponse.ok) users = await usersResponse.json();

            this.products = products;
            this.users = users;
            this.orders = orders;

            // Calculate dashboard stats
            const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            const pendingOrders = orders.filter(order => order.status === 'pending').length;
            const lowStockProducts = products.filter(product => product.stock < 5 && product.stock > 0).length;
            const outOfStockProducts = products.filter(product => product.stock === 0).length;

            // Update dashboard elements
            if(document.getElementById('total-orders')) document.getElementById('total-orders').textContent = orders.length;
            if(document.getElementById('pending-orders')) document.getElementById('pending-orders').textContent = pendingOrders;
            if(document.getElementById('total-products')) document.getElementById('total-products').textContent = products.length;
            if(document.getElementById('total-users')) document.getElementById('total-users').textContent = users.length;
            if(document.getElementById('total-revenue')) document.getElementById('total-revenue').textContent = `৳${totalRevenue.toLocaleString()}`;
            if(document.getElementById('low-stock')) document.getElementById('low-stock').textContent = lowStockProducts;
            if(document.getElementById('out-of-stock')) document.getElementById('out-of-stock').textContent = outOfStockProducts;
            
            this.renderRecentOrders(orders);
            this.renderTopSelling(orders, products);

        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showToast('Error loading dashboard data. Using demo data.', 'warning');
            this.loadDemoData();
        }
    }

    async loadOrders() {
        try {
            const response = await fetch('/api/admin/orders');
            if (!response.ok) throw new Error('Failed to fetch orders');
            
            const orders = await response.json();
            this.orders = orders;
            
            const tbody = document.getElementById('orders-table-body');
            if (!tbody) return;

            tbody.innerHTML = orders.map(order => `
                <tr data-order-id="${order.id}">
                    <td>${order.id}</td>
                    <td>${order.customer?.firstName || 'N/A'} ${order.customer?.lastName || ''}</td>
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
                    <td>${new Date(order.orderDate || Date.now()).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-order" data-action="view-order" data-order-id="${order.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning edit-order" data-action="edit-order" data-order-id="${order.id}">
                            <i class="fas fa-edit"></i>
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
            this.showToast('Failed to load orders data. Check API status.', 'error');
        }
    }

    async loadProducts() {
        try {
            const response = await fetch('/api/products');
            if (!response.ok) throw new Error('Failed to fetch products');
            
            const products = await response.json();
            this.products = products;
            
            const tbody = document.getElementById('products-table-body');
            if (!tbody) return;

            tbody.innerHTML = products.map(product => `
                <tr data-product-id="${product.id}">
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>৳${product.price.toLocaleString()}</td>
                    <td>
                        <span class="badge ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'}">
                            ${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                    </td>
                    <td>
                        <div class="stars small">
                            ${this.generateStarRating(product.rating)} 
                            <small class="text-muted">(${product.reviews})</small>
                        </div>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-warning edit-product" data-action="edit-product" data-product-id="${product.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-info stock-product" data-action="manage-stock" data-product-id="${product.id}">
                            <i class="fas fa-boxes"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-product" data-action="delete-product" data-product-id="${product.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');

        } catch (error) {
            console.error('Error loading products:', error);
            this.showToast('Failed to load products data. Check API status.', 'error');
        }
    }

    async loadCategories() {
        try {
            const response = await fetch('/api/categories');
            if (!response.ok) throw new Error('Failed to fetch categories');
            
            this.categories = await response.json();
            
            const tbody = document.getElementById('categories-table-body');
            if (!tbody) return;

            tbody.innerHTML = this.categories.map(category => `
                <tr data-category-id="${category.id}">
                    <td>${category.id}</td>
                    <td>${category.name}</td>
                    <td>${category.displayName}</td>
                    <td>
                        <span class="badge ${category.isActive ? 'bg-success' : 'bg-secondary'}">
                            ${category.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-warning edit-category" data-action="edit-category" data-category-id="${category.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-category" data-action="delete-category" data-category-id="${category.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');

            // Update category dropdown in product modal
            this.updateCategoryDropdown();

        } catch (error) {
            console.error('Error loading categories:', error);
            this.showToast('Failed to load categories data. Check API status.', 'error');
            this.categories = [];
        }
    }

    async loadUsers() {
        try {
            const response = await fetch('/api/admin/users');
            if (!response.ok) throw new Error('Failed to fetch users');

            this.users = await response.json();
            
            const tbody = document.getElementById('users-table-body');
            if (!tbody) return;

            tbody.innerHTML = this.users.map(user => `
                <tr data-user-id="${user.id}">
                    <td>${user.id?.slice(-6) || 'N/A'}</td>
                    <td>${user.firstName} ${user.lastName || ''}</td>
                    <td>${user.email}</td>
                    <td>${user.phone || 'N/A'}</td>
                    <td>${user.orders ? user.orders.length : 0}</td>
                    <td>${new Date(user.createdAt || Date.now()).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-user" data-action="view-orders" data-user-id="${user.id}" data-user-email="${user.email}">
                            <i class="fas fa-eye"></i> Orders
                        </button>
                        <button class="btn btn-sm btn-danger delete-user" data-action="delete-user" data-user-id="${user.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `).join('');

        } catch (error) {
            console.error('Error loading users:', error);
            this.showToast('Failed to load users data. Check API status.', 'error');
        }
    }

    // ==================== FIXED: CRUD OPERATIONS ====================
    async updateOrderStatus(orderId, status) {
        try {
            const response = await fetch(`/api/admin/orders/${orderId}/status`, { 
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showToast(`Order ${orderId} status updated to ${status}`, 'success');
                this.loadOrders();
            } else {
                throw new Error(data.message || 'Failed to update order status');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            this.showToast('Error updating order status: ' + error.message, 'error');
        }
    }

    async saveProduct() {
        const productId = document.getElementById('product-id')?.value;
        const modal = document.getElementById('productModal');
        
        const formData = {
            name: document.getElementById('product-name')?.value,
            description: document.getElementById('product-description')?.value,
            price: parseFloat(document.getElementById('product-price')?.value),
            category: document.getElementById('product-category')?.value,
            stock: parseInt(document.getElementById('product-stock')?.value) || 0,
            image: document.getElementById('product-image')?.value,
            sizes: document.getElementById('product-sizes')?.value.split(',').map(s => s.trim()).filter(s => s),
            rating: parseFloat(document.getElementById('product-rating')?.value) || 4.0,
            reviews: parseInt(document.getElementById('product-reviews')?.value) || 0,
        };

        if (!formData.name || isNaN(formData.price) || !formData.category) {
            this.showToast('Please fill in required fields (Name, Price, Category)', 'error');
            return;
        }

        const method = productId ? 'PUT' : 'POST';
        const url = productId ? `/api/admin/products/${productId}` : '/api/admin/products';
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                this.showToast(`Product ${productId ? 'updated' : 'added'} successfully!`, 'success');
                bootstrap.Modal.getInstance(modal).hide();
                this.loadProducts(); 
            } else {
                this.showToast(data.message || `Failed to ${productId ? 'update' : 'add'} product.`, 'error');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            this.showToast('An error occurred while saving the product.', 'error');
        }
    }

    async deleteProduct(productId) {
        if (!confirm(`Are you sure you want to delete product ID ${productId}?`)) return;

        try {
            const response = await fetch(`/api/admin/products/${productId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                this.showToast('Product deleted successfully!', 'success');
                this.loadProducts();
            } else {
                this.showToast(data.message || 'Failed to delete product.', 'error');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            this.showToast('An error occurred during product deletion.', 'error');
        }
    }

    async deleteUser(userId) {
        if (!confirm(`Are you sure you want to delete user ID ${userId}? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                this.showToast('User deleted successfully!', 'success');
                this.loadUsers();
            } else {
                this.showToast(data.message || 'Failed to delete user.', 'error');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showToast('An error occurred during user deletion.', 'error');
        }
    }

    // ==================== FIXED: EVENT HANDLERS ====================
    handleOrderActions(e) {
        const target = e.target.closest('button');
        if (!target) return;
        
        const action = target.dataset.action;
        const orderId = target.dataset.orderId;

        if (action === 'view-order') {
            this.viewOrderDetails(orderId);
        } else if (action === 'edit-order') {
            this.showToast(`Editing Order ${orderId} is a feature pending implementation.`, 'warning');
        }
    }

    handleProductActions(e) {
        const target = e.target.closest('button');
        if (!target) return;
        
        const action = target.dataset.action;
        const productId = target.dataset.productId;

        switch (action) {
            case 'edit-product':
                this.editProduct(productId);
                break;
            case 'manage-stock':
                this.manageStock(productId);
                break;
            case 'delete-product':
                this.deleteProduct(productId);
                break;
        }
    }

    handleCategoryActions(e) {
        const target = e.target.closest('button');
        if (!target) return;
        
        const action = target.dataset.action;
        const categoryId = target.dataset.categoryId;

        if (action === 'edit-category') {
            this.editCategory(categoryId);
        } else if (action === 'delete-category') {
            this.deleteCategory(categoryId);
        }
    }

    handleUserActions(e) {
        const button = e.target.closest('button');
        if (!button) return;

        const action = button.dataset.action;
        const userId = button.dataset.userId;
        const userEmail = button.dataset.userEmail;

        if (action === 'view-orders') {
            this.showToast(`Fetching orders for user: ${userEmail} (Feature coming soon!)`, 'info');
        } else if (action === 'delete-user') {
            this.deleteUser(userId);
        }
    }

    // ==================== FIXED: UTILITY METHODS ====================
    showProductModal(product = null) {
        const modal = document.getElementById('productModal');
        const form = document.getElementById('product-form');
        
        form.reset();
        document.getElementById('product-id').value = '';
        
        this.updateCategoryDropdown();
        
        if (product) {
            document.querySelector('.modal-title').textContent = 'Edit Product';
            modal.dataset.mode = 'edit';
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-description').value = product.description;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-stock').value = product.stock;
            document.getElementById('product-image').value = product.image || '';
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-sizes').value = product.sizes ? product.sizes.join(', ') : '';
            document.getElementById('product-rating').value = product.rating || 4.0;
            document.getElementById('product-reviews').value = product.reviews || 0;
        } else {
            document.querySelector('.modal-title').textContent = 'Add New Product';
            modal.dataset.mode = 'add';
        }

        new bootstrap.Modal(modal).show();
    }

    updateCategoryDropdown() {
        const categorySelect = document.getElementById('product-category');
        if (categorySelect && this.categories.length > 0) {
            categorySelect.innerHTML = this.categories
                .filter(cat => cat.isActive)
                .map(cat => `<option value="${cat.name}">${cat.displayName}</option>`)
                .join('');
        }
    }

    async editProduct(productId) {
        try {
            const response = await fetch(`/api/products/${productId}`);
            if (!response.ok) throw new Error('Product not found');
            const product = await response.json();
            this.showProductModal(product);
        } catch (error) {
            // Fallback to local products if API fails
            const product = this.products.find(p => p.id == productId);
            if (product) {
                this.showProductModal(product);
            } else {
                this.showToast('Error fetching product data for editing: ' + error.message, 'error');
            }
        }
    }

    showCategoryModal(category = null) {
        const modal = document.getElementById('categoryModal');
        const modalTitle = modal.querySelector('.modal-title');
        const nameInput = document.getElementById('category-name');
        const displayNameInput = document.getElementById('category-display-name');
        const activeCheck = document.getElementById('category-active');
        
        modal.dataset.mode = category ? 'edit' : 'add';
        modalTitle.textContent = category ? 'Edit Category' : 'Add New Category';
        
        if (category) {
            modal.dataset.categoryId = category.id;
            nameInput.value = category.name;
            displayNameInput.value = category.displayName;
            activeCheck.checked = category.isActive;
            nameInput.disabled = true;
        } else {
            modal.dataset.categoryId = '';
            nameInput.value = '';
            displayNameInput.value = '';
            activeCheck.checked = true;
            nameInput.disabled = false;
        }
        
        new bootstrap.Modal(modal).show();
    }

    async editCategory(categoryId) {
        const category = this.categories.find(c => c.id == categoryId);
        if (category) {
            this.showCategoryModal(category);
        } else {
            this.showToast(`Category ID ${categoryId} not found.`, 'error');
        }
    }

    async saveCategory() {
        const modal = document.getElementById('categoryModal');
        const isEditing = modal.dataset.mode === 'edit';
        const categoryId = modal.dataset.categoryId;
        
        const name = document.getElementById('category-name').value.trim();
        const displayName = document.getElementById('category-display-name').value.trim();
        const isActive = document.getElementById('category-active').checked;

        if (!name || !displayName) {
            this.showToast('Name and Display Name are required', 'error');
            return;
        }

        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `/api/admin/categories/${categoryId}` : '/api/admin/categories';
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: name,
                    displayName: displayName,
                    isActive: isActive 
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.showToast(`Category ${isEditing ? 'updated' : 'created'} successfully!`, 'success');
                bootstrap.Modal.getInstance(modal).hide();
                this.loadCategories();
            } else {
                this.showToast(data.message || 'Failed to save category.', 'error');
            }
        } catch (error) {
            console.error('Error saving category:', error);
            this.showToast('An error occurred while saving the category.', 'error');
        }
    }

    async deleteCategory(categoryId) {
        if (!confirm(`Are you sure you want to delete category ID ${categoryId}? This will affect related products.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/categories/${categoryId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                this.showToast('Category deleted successfully!', 'success');
                this.loadCategories();
            } else {
                this.showToast(data.message || 'Failed to delete category.', 'error');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            this.showToast('An error occurred while deleting the category.', 'error');
        }
    }

    manageStock(productId) {
        const product = this.products.find(p => p.id == productId);
        if (product) {
            document.getElementById('stock-product-name').textContent = product.name;
            document.getElementById('stock-product-id').value = productId;
            document.getElementById('current-stock').textContent = product.stock;
            document.getElementById('new-stock').value = product.stock;
            new bootstrap.Modal(document.getElementById('stockModal')).show();
        }
    }

    async updateStock() {
        const productId = document.getElementById('stock-product-id').value;
        const newStock = parseInt(document.getElementById('new-stock').value);
        
        if (isNaN(newStock) || newStock < 0) {
            this.showToast('Please enter a valid stock quantity', 'error');
            return;
        }

        try {
            const product = this.products.find(p => p.id == productId);
            const response = await fetch(`/api/admin/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...product, stock: newStock })
            });

            if (response.ok) {
                this.showToast('Stock updated successfully!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('stockModal')).hide();
                this.loadProducts();
            } else {
                this.showToast('Failed to update stock', 'error');
            }
        } catch (error) {
            console.error('Error updating stock:', error);
            this.showToast('Error updating stock', 'error');
        }
    }

    viewOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            const items = order.items?.map(item => 
                `${item.name} (${item.selectedSize}) - ${item.quantity} x ৳${item.price}`
            ).join('\n') || 'No items';
            
            alert(`Order Details - ${orderId}\n\nCustomer: ${order.customer?.firstName} ${order.customer?.lastName}\nEmail: ${order.customer?.email}\nTotal: ৳${order.totalAmount}\nStatus: ${order.status}\n\nItems:\n${items}`);
        } else {
            this.showToast('Order details not found', 'error');
        }
    }

    renderRecentOrders(orders) {
        const recentOrdersContainer = document.getElementById('recent-orders');
        if (!recentOrdersContainer) return;

        const recent = orders
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
            .slice(0, 5);

        if (recent.length === 0) {
            recentOrdersContainer.innerHTML = `<p class="text-muted text-center">No recent orders.</p>`;
            return;
        }

        recentOrdersContainer.innerHTML = recent.map(order => `
            <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                <div>
                    <strong>Order #${order.id}</strong>
                    <small class="d-block text-muted">${new Date(order.orderDate).toLocaleDateString()}</small>
                </div>
                <span class="badge bg-primary">৳${(order.totalAmount || 0).toLocaleString()}</span>
                <span class="badge bg-secondary">${order.status}</span>
            </div>
        `).join('');
    }

    renderTopSelling(orders, products) {
        // Implementation for top selling products
    }

    async loadAnalytics() {
        this.showToast('Loading analytics data...', 'info');
        
        try {
            const orders = this.orders.length > 0 ? this.orders : await (await fetch('/api/admin/orders')).json();
            const products = this.products.length > 0 ? this.products : await (await fetch('/api/products')).json();
            
            // Basic analytics calculations
            const monthlySales = orders.reduce((acc, order) => {
                const month = new Date(order.orderDate).toLocaleString('default', { month: 'short', year: 'numeric' });
                acc[month] = (acc[month] || 0) + (order.totalAmount || 0);
                return acc;
            }, {});

            const productSales = {};
            const categorySales = {};
            
            orders.forEach(order => {
                order.items?.forEach(item => {
                    const productName = item.name;
                    const productCategory = item.category;
                    const quantity = item.quantity;
                    
                    productSales[productName] = (productSales[productName] || 0) + quantity;
                    categorySales[productCategory] = (categorySales[productCategory] || 0) + quantity;
                });
            });

            const topProducts = Object.entries(productSales)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5);

            // Update analytics UI
            const salesChartElement = document.getElementById('monthly-revenue');
            if (salesChartElement) {
                salesChartElement.innerHTML = Object.entries(monthlySales)
                    .map(([month, amount]) => `
                        <div class="d-flex justify-content-between mb-2">
                            <span>${month}</span>
                            <span class="fw-bold">৳${amount.toLocaleString()}</span>
                        </div>
                    `).join('');
            }

            const topProductsElement = document.getElementById('top-products');
            if (topProductsElement) {
                topProductsElement.innerHTML = topProducts
                    .map(([product, sales]) => `
                        <div class="d-flex justify-content-between mb-2">
                            <span>${product}</span>
                            <span class="fw-bold">${sales} sold</span>
                        </div>
                    `).join('');
            }

            const categorySalesElement = document.getElementById('category-sales');
            if (categorySalesElement) {
                categorySalesElement.innerHTML = Object.entries(categorySales)
                    .map(([category, sales]) => `
                        <div class="d-flex justify-content-between mb-2">
                            <span>${this.categories.find(c => c.name === category)?.displayName || category}</span>
                            <span class="fw-bold">${sales} sold</span>
                        </div>
                    `).join('');
            }

        } catch (error) {
            console.error('Error loading analytics:', error);
            this.showToast('Error loading analytics data', 'error');
        }
    }

    generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        let stars = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        // Half star
        if (halfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }

    loadDemoData() {
        // Fallback demo data if API fails
        document.getElementById('total-orders').textContent = '12';
        document.getElementById('pending-orders').textContent = '3';
        document.getElementById('total-products').textContent = '14';
        document.getElementById('total-users').textContent = '8';
        document.getElementById('total-revenue').textContent = '৳45,299';
        document.getElementById('low-stock').textContent = '2';
        document.getElementById('out-of-stock').textContent = '1';
    }

    showToast(message, type = 'success') {
        let toastContainer = document.getElementById('admin-toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'admin-toast-container';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }

        const toastId = 'toast-' + Date.now();
        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center text-white border-0 ${type === 'error' ? 'bg-danger' : type === 'warning' ? 'bg-warning' : 'bg-success'}" role="alert">
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;

        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement);
        toast.show();

        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }
}

// Global instance
let adminPanelInstance = null;

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    adminPanelInstance = new AdminPanel();
});

// Make functions globally available if needed
window.updateStock = function() {
    if (adminPanelInstance) {
        adminPanelInstance.updateStock();
    } else {
        console.error("AdminPanel not yet initialized.");
    }
};