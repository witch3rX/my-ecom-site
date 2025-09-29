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

// In the showCheckoutModal function, add this check:
function showCheckoutModal(totalAmount) {
    // Check if user is authenticated
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        // Redirect to auth page if not logged in
        if (confirm('You need to sign in to complete your order. Would you like to sign in now?')) {
            window.location.href = 'auth.html';
        }
        return;
    }
    
    // Rest of the checkout modal code...
    console.log('Proceeding with checkout for user:', currentUser.firstName, 'Amount:', totalAmount);
    // Add your existing checkout modal logic here
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

// Update user display in header
function updateUserDisplay() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const authLink = document.querySelector('a[href="auth.html"]');
    
    if (currentUser && authLink) {
        // Update auth link to show user name
        authLink.innerHTML = `<i class="fas fa-user me-1"></i>${currentUser.firstName}`;
        
        // Check if logout link already exists
        if (!document.getElementById('logout-link')) {
            // Add logout option
            const logoutItem = document.createElement('li');
            logoutItem.className = 'nav-item';
            logoutItem.innerHTML = `
                <a class="nav-link" href="#" id="logout-link">
                    <i class="fas fa-sign-out-alt me-1"></i>Logout
                </a>
            `;
            
            // Add logout link to navbar
            const navbarNav = document.querySelector('.navbar-nav');
            if (navbarNav) {
                navbarNav.appendChild(logoutItem);
                
                // Add logout event listener
                document.getElementById('logout-link').addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('currentUser');
                    showToast('Logged out successfully', 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                });
            }
        }
    } else if (authLink) {
        // Reset to default sign in text
        authLink.innerHTML = '<i class="fas fa-user me-1"></i>Sign In';
        
        // Remove logout link if exists
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
            logoutLink.parentElement.remove();
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

// Event listeners
window.addEventListener('hashchange', router);
window.addEventListener('load', initApp);
document.addEventListener('DOMContentLoaded', initApp);

// Export for other modules
export { router, showCheckoutModal };