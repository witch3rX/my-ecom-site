// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.currentTab = 'dashboard';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboard();
        this.checkAdminAccess();
    }

    checkAdminAccess() {
        // Simple admin check - in production, use proper authentication
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            alert('Please log in as admin');
            window.location.href = 'auth.html';
            return;
        }
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
        document.getElementById('add-product-btn').addEventListener('click', () => {
            this.showProductModal();
        });

        // Save product
        document.getElementById('save-product').addEventListener('click', () => {
            this.saveProduct();
        });

        // Logout
        document.getElementById('admin-logout').addEventListener('click', (e) => {
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
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        const form = document.getElementById('product-form');
        
        if (product) {
            // Edit mode
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-description').value = product.description;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-image').value = product.image;
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
            hasSizes: document.getElementById('product-category').value === 'jerseys' || 
                      document.getElementById('product-category').value === 'boots'
        };

        // Basic validation
        if (!formData.name || !formData.description || !formData.price) {
            alert('Please fill in all required fields');
            return;
        }

        // Note: In a real application, you would send this to your backend API
        // For now, we'll just show a success message
        alert('Product saved successfully! In a real application, this would be saved to the database.');
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
        modal.hide();
        
        // Reload products
        this.loadProducts();
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
            // Note: In a real application, you would send DELETE request to your API
            alert('Product deleted! In a real application, this would remove it from the database.');
            this.loadProducts();
        }
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminPanel();
});