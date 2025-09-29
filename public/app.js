import { renderProductsPage } from './components/product_list.js';

// Function to update the cart count in the header
export function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
        element.style.display = totalItems > 0 ? 'block' : 'none';
    });
}

// Function to show toast messages
export function showToast(message, type = 'success') {
    const toast = document.getElementById('cartToast');
    const toastMessage = document.getElementById('toast-message');
    
    if (toast && toastMessage) {
        // Set background color based on type
        if (type === 'error') {
            toast.style.backgroundColor = '#dc3545';
        } else {
            toast.style.backgroundColor = '#28a745';
        }
        
        toastMessage.textContent = message;
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }
}

// Function to update active category filter
function updateActiveCategory(category) {
    // Remove active class from all filters
    document.querySelectorAll('.category-filter').forEach(filter => {
        filter.classList.remove('active');
    });
    
    // Add active class to current filter
    const activeFilter = document.querySelector(`.category-filter[data-category="${category}"]`);
    if (activeFilter) {
        activeFilter.classList.add('active');
    }
}

// Enhanced router function
function router() {
    const appContainer = document.getElementById('app-container');
    const path = window.location.hash.substring(1);

    if (!appContainer) return;

    // Handle category filtering
    const category = path === '' ? 'all' : path;
    console.log(`Routing to category: ${category}`);
    updateActiveCategory(category);
    renderProductsPage(appContainer, category);
}

// Check if user is admin
function isAdminUser(user) {
    const adminEmails = ['admin@ir7.com'];
    return user && adminEmails.includes(user.email.toLowerCase());
}

// Update user display in header with admin link
function updateUserDisplay() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const authLink = document.querySelector('a[href="auth.html"]');
    
    if (currentUser && authLink) {
        // Update auth link to show user name with dropdown
        authLink.innerHTML = `
            <i class="fas fa-user me-1"></i>${currentUser.firstName}
            <i class="fas fa-caret-down ms-1"></i>
        `;
        authLink.setAttribute('data-bs-toggle', 'dropdown');
        authLink.setAttribute('aria-expanded', 'false');
        
        // Create dropdown menu if it doesn't exist
        if (!document.getElementById('user-dropdown')) {
            const dropdownMenu = document.createElement('div');
            dropdownMenu.className = 'dropdown-menu dropdown-menu-end';
            dropdownMenu.id = 'user-dropdown';
            
            let dropdownContent = `
                <div class="dropdown-header">
                    <strong>${currentUser.firstName} ${currentUser.lastName}</strong>
                    <br>
                    <small class="text-muted">${currentUser.email}</small>
                </div>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href="#" id="profile-link">
                    <i class="fas fa-user-circle me-2"></i>My Profile
                </a>
                <a class="dropdown-item" href="#" id="orders-link">
                    <i class="fas fa-shopping-bag me-2"></i>My Orders
                </a>
            `;
            
            // Add admin link if user is admin
            if (isAdminUser(currentUser)) {
                dropdownContent += `
                    <div class="dropdown-divider"></div>
                    <a class="dropdown-item text-warning" href="admin.html" id="admin-link">
                        <i class="fas fa-crown me-2"></i>Admin Panel
                    </a>
                `;
            }
            
            dropdownContent += `
                <div class="dropdown-divider"></div>
                <a class="dropdown-item text-danger" href="#" id="logout-link">
                    <i class="fas fa-sign-out-alt me-2"></i>Logout
                </a>
            `;
            
            dropdownMenu.innerHTML = dropdownContent;
            
            // Add dropdown menu to navbar nav
            const navbarNav = document.querySelector('.navbar-nav');
            const authListItem = authLink.parentElement;
            authListItem.classList.add('dropdown');
            authListItem.appendChild(dropdownMenu);
            
            // Add logout event listener
            document.getElementById('logout-link').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                showToast('Logged out successfully', 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            });
            
            // Add profile and orders event listeners
            document.getElementById('profile-link').addEventListener('click', (e) => {
                e.preventDefault();
                showToast('Profile page coming soon!', 'info');
            });
            
            document.getElementById('orders-link').addEventListener('click', (e) => {
                e.preventDefault();
                showToast('Orders page coming soon!', 'info');
            });
        }
        
    } else if (authLink) {
        // Reset to default sign in text and remove dropdown
        authLink.innerHTML = '<i class="fas fa-user me-1"></i>Sign In';
        authLink.removeAttribute('data-bs-toggle');
        authLink.removeAttribute('aria-expanded');
        
        const authListItem = authLink.parentElement;
        authListItem.classList.remove('dropdown');
        
        const dropdownMenu = document.getElementById('user-dropdown');
        if (dropdownMenu) {
            dropdownMenu.remove();
        }
    }
}

// Initialize application
function initApp() {
    console.log('Initializing IR7 Football Shop...');
    
    // Initialize cart if not exists
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    
    // Set up category filter click handlers
    document.querySelectorAll('.category-filter').forEach(filter => {
        filter.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.getAttribute('data-category');
            console.log(`Category filter clicked: ${category}`);
            window.location.hash = category;
        });
    });
    
    // Set up shop now button
    const shopNowBtn = document.querySelector('a[href="#shop"]');
    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const shopSection = document.getElementById('shop');
            if (shopSection) {
                shopSection.scrollIntoView({ 
                    behavior: 'smooth'
                });
            }
        });
    }
    
    // Update user display
    updateUserDisplay();
    
    // Initialize the application
    router();
    updateCartCount();
    
    console.log('IR7 Football Shop initialized successfully');
}

// Track initialization state to prevent duplicate calls
let appInitialized = false;

function initializeAppOnce() {
    if (!appInitialized) {
        appInitialized = true;
        initApp();
    }
}

// Use only one event listener instead of multiple
if (document.readyState === 'loading') {
    // Loading hasn't finished yet, wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', initializeAppOnce);
} else {
    // DOMContentLoaded has already fired
    initializeAppOnce();
}

// Hashchange should still work independently
window.addEventListener('hashchange', router);

// Export for other modules
export { router, showToast };