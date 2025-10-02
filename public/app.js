// Global state for products and filters
let allProducts = [];
let currentProducts = [];
let currentFilters = {
    category: 'all',
    priceRange: [0, 10000],
    sizes: [],
    brands: [],
    sortBy: 'newest',
    searchQuery: '',
    inStock: false
};

// Function to update the cart count in the header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
        element.style.display = totalItems > 0 ? 'block' : 'none';
    });
}

// Function to show toast messages
function showToast(message, type = 'success') {
    // Create toast if it doesn't exist
    let toast = document.getElementById('cartToast');
    let toastMessage = document.getElementById('toast-message');
    
    if (!toast) {
        const toastContainer = document.getElementById('toast-container');
        if (toastContainer) {
            toastContainer.innerHTML = `
                <div id="cartToast" class="toast align-items-center text-white border-0" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="d-flex">
                        <div class="toast-body" id="toast-message">${message}</div>
                        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                </div>
            `;
            toast = document.getElementById('cartToast');
            toastMessage = document.getElementById('toast-message');
        }
    }

    if (toast && toastMessage) {
        // Set background color based on type
        if (type === 'error') {
            toast.style.backgroundColor = '#dc3545';
        } else if (type === 'info') {
            toast.style.backgroundColor = '#17a2b8';
        } else if (type === 'warning') {
            toast.style.backgroundColor = '#ffc107';
        } else {
            toast.style.backgroundColor = '#28a745';
        }
        
        toastMessage.textContent = message;
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }
}

// Generate star rating HTML
function generateStarRating(rating) {
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

// Sample products data
const sampleProducts = [
    {
        id: 1,
        name: "Argentina Home Jersey 2024",
        category: "jerseys",
        price: 2499,
        image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400&h=400&fit=crop",
        description: "Official Argentina home jersey 2024 edition with player name and number printing available",
        brand: "Adidas",
        sizes: ["S", "M", "L", "XL"],
        hasSizes: true,
        stock: 15,
        rating: 4.8,
        reviews: 127,
        details: "100% polyester, machine washable, official licensed product"
    },
    {
        id: 2,
        name: "Nike Mercurial Superfly 9",
        category: "boots",
        price: 18999,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
        description: "Professional football boots with advanced traction and comfort",
        brand: "Nike",
        sizes: ["8", "9", "10", "11", "12"],
        hasSizes: true,
        stock: 8,
        rating: 4.9,
        reviews: 89,
        details: "Synthetic leather, FG/AG studs, lightweight design"
    },
    {
        id: 3,
        name: "Adidas Champions League Ball",
        category: "balls",
        price: 3499,
        image: "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=400&h=400&fit=crop",
        description: "Official UEFA Champions League match ball 2024",
        brand: "Adidas",
        sizes: ["Size 5"],
        hasSizes: false,
        stock: 25,
        rating: 4.7,
        reviews: 203,
        details: "Official match ball, synthetic leather, hand-stitched"
    },
    {
        id: 4,
        name: "Puma Team Training Jersey",
        category: "jerseys",
        price: 1299,
        image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop",
        description: "Professional training jersey for team practice sessions",
        brand: "Puma",
        sizes: ["S", "M", "L", "XL", "XXL"],
        hasSizes: true,
        stock: 0,
        rating: 4.5,
        reviews: 67,
        details: "Moisture-wicking fabric, breathable, team customization available"
    },
    {
        id: 5,
        name: "Football Shin Guards",
        category: "accessories",
        price: 799,
        image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400&h=400&fit=crop",
        description: "Professional shin guards with ankle protection",
        brand: "Nike",
        sizes: ["S/M", "L/XL"],
        hasSizes: true,
        stock: 42,
        rating: 4.6,
        reviews: 156,
        details: "Lightweight plastic shell, comfortable foam padding"
    },
    {
        id: 6,
        name: "Goalkeeper Gloves",
        category: "accessories",
        price: 2199,
        image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=400&fit=crop",
        description: "Professional goalkeeper gloves with finger protection",
        brand: "Adidas",
        sizes: ["8", "9", "10", "11"],
        hasSizes: true,
        stock: 18,
        rating: 4.8,
        reviews: 94,
        details: "Latex palm, finger spine technology, adjustable strap"
    }
];

// Load all products
async function loadAllProducts() {
    try {
        // Try to load from API first
        const response = await fetch('/api/products');
        if (response.ok) {
            allProducts = await response.json();
            console.log('Loaded products from API:', allProducts);
        } else {
            throw new Error('API not available');
        }
    } catch (error) {
        console.log('Using sample products:', error.message);
        // Fallback to sample products
        allProducts = sampleProducts;
    }
    
    currentProducts = [...allProducts];
    applyFilters();
}

// Function to load and display dynamic categories
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        const categories = await response.json();
        
        const activeCategories = categories.filter(cat => cat.isActive);
        const categoryFilters = document.querySelector('.category-filters');
        
        if (categoryFilters) {
            let filtersHtml = '<a href="#all" class="btn btn-outline-dark category-filter active" data-category="all">All</a>';
            
            activeCategories.forEach(category => {
                filtersHtml += `
                    <a href="#${category.name}" class="btn btn-outline-dark category-filter" data-category="${category.name}">
                        ${category.displayName}
                    </a>
                `;
            });
            
            categoryFilters.innerHTML = filtersHtml;
            
            // Re-attach event listeners
            categoryFilters.querySelectorAll('.category-filter').forEach(filter => {
                filter.addEventListener('click', (e) => {
                    e.preventDefault();
                    const category = e.target.getAttribute('data-category');
                    console.log(`Category filter clicked: ${category}`);
                    window.location.hash = category;
                });
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        // Fallback to default categories
        const categoryFilters = document.querySelector('.category-filters');
        if (categoryFilters) {
            categoryFilters.innerHTML = `
                <a href="#all" class="btn btn-outline-dark category-filter active" data-category="all">All</a>
                <a href="#jerseys" class="btn btn-outline-dark category-filter" data-category="jerseys">Jerseys</a>
                <a href="#boots" class="btn btn-outline-dark category-filter" data-category="boots">Boots</a>
                <a href="#balls" class="btn btn-outline-dark category-filter" data-category="balls">Balls</a>
                <a href="#accessories" class="btn btn-outline-dark category-filter" data-category="accessories">Accessories</a>
            `;
        }
    }
}

// Apply all filters and sorting
function applyFilters() {
    let filteredProducts = [...allProducts];

    // Category filter
    if (currentFilters.category !== 'all') {
        filteredProducts = filteredProducts.filter(product => 
            product.category === currentFilters.category
        );
    }

    // Price range filter
    filteredProducts = filteredProducts.filter(product => 
        product.price >= currentFilters.priceRange[0] && 
        product.price <= currentFilters.priceRange[1]
    );

    // Size filter
    if (currentFilters.sizes.length > 0) {
        filteredProducts = filteredProducts.filter(product => {
            if (!product.sizes || product.sizes.length === 0) return false;
            return currentFilters.sizes.some(size => product.sizes.includes(size));
        });
    }

    // Brand filter
    if (currentFilters.brands.length > 0) {
        filteredProducts = filteredProducts.filter(product => {
            const brand = getProductBrand(product.name);
            return currentFilters.brands.includes(brand);
        });
    }

    // Search filter
    if (currentFilters.searchQuery) {
        const query = currentFilters.searchQuery.toLowerCase();
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        );
    }

    // In stock filter
    if (currentFilters.inStock) {
        filteredProducts = filteredProducts.filter(product => product.stock > 0);
    }

    // Apply sorting
    filteredProducts = sortProducts(filteredProducts, currentFilters.sortBy);

    currentProducts = filteredProducts;
    renderFilteredProducts();
}

// Sort products based on criteria
function sortProducts(products, sortBy) {
    const sorted = [...products];
    
    switch (sortBy) {
        case 'price-low':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-high':
            return sorted.sort((a, b) => b.price - a.price);
        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'rating':
            return sorted.sort((a, b) => b.rating - a.rating);
        case 'newest':
        default:
            return sorted.sort((a, b) => b.id - a.id);
    }
}

// Get product brand from name
function getProductBrand(productName) {
    const brands = ['Nike', 'Adidas', 'Puma', 'New Balance', 'Under Armour'];
    for (let brand of brands) {
        if (productName.toLowerCase().includes(brand.toLowerCase())) {
            return brand;
        }
    }
    return 'Other';
}

// Format price in BDT with commas
function formatPrice(price) {
    return '৳' + price.toLocaleString('en-BD');
}

// Get image URL with fallback
function getImageUrl(productImage) {
    if (!productImage) {
        return 'https://via.placeholder.com/300x200/007bff/fff?text=IR7+Football';
    }
    
    if (productImage.startsWith('/images/')) {
        return productImage;
    }
    
    if (productImage.startsWith('http://') || productImage.startsWith('https://')) {
        return productImage;
    }
    
    if (productImage.startsWith('images/')) {
        return '/' + productImage;
    }
    
    return 'https://via.placeholder.com/300x200/007bff/fff?text=IR7+Football';
}

// Enhanced add to cart function with size and stock validation
function addToCart(product, selectedSize = null) {
    // Check stock
    if (product.stock <= 0) {
        showToast('This product is out of stock', 'error');
        return;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Create cart item with size
    const cartItem = {
        ...product,
        quantity: 1,
        selectedSize: selectedSize || (product.hasSizes ? product.sizes[0] : 'Standard')
    };
    
    // Check if same product with same size already exists
    const existingItemIndex = cart.findIndex(item => 
        item.id === product.id && item.selectedSize === cartItem.selectedSize
    );
    
    if (existingItemIndex > -1) {
        // Check if adding more would exceed stock
        if (cart[existingItemIndex].quantity >= product.stock) {
            showToast(`Only ${product.stock} items available in stock`, 'warning');
            return;
        }
        // Increment quantity if same product with same size exists
        cart[existingItemIndex].quantity += 1;
    } else {
        // Add new item
        cart.push(cartItem);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast(`${product.name} (${cartItem.selectedSize}) added to cart!`);
    console.log(`Added ${product.name} to cart with size ${cartItem.selectedSize}`);
}

// Render filtered products with reviews and stock status
function renderFilteredProducts() {
    const container = document.getElementById('app-container');
    if (!container) return;

    // Clear and re-render container
    container.innerHTML = `
        <div class="product-grid" id="product-list"></div>
    `;

    const productListDiv = document.getElementById('product-list');
    
    if (currentProducts.length === 0) {
        productListDiv.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h4 class="text-muted">No products found</h4>
                <p class="text-muted">Try adjusting your filters or search terms.</p>
                <button class="btn btn-primary" onclick="resetAllFilters()">Reset Filters</button>
            </div>
        `;
        return;
    }

    // Load wishlist
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    // Render each product
    currentProducts.forEach(product => {
        const isInWishlist = wishlist.some(item => item.id === product.id);
        const wishlistClass = isInWishlist ? 'text-danger' : 'text-muted';
        const isOutOfStock = product.stock <= 0;
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // Generate size options if product has sizes
        const sizeOptions = product.hasSizes && !isOutOfStock ? `
            <div class="size-selection mb-3">
                <label class="form-label small fw-bold">Size:</label>
                <select class="form-select form-select-sm size-select" data-product-id="${product.id}">
                    ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
                </select>
            </div>
        ` : '';
        
        // Stock badge
        const stockBadge = isOutOfStock ? 
            '<span class="badge bg-secondary position-absolute top-0 start-0 m-2">Out of Stock</span>' :
            (product.stock < 10 ? `<span class="badge bg-warning position-absolute top-0 start-0 m-2">Only ${product.stock} left</span>` : '');
        
        productCard.innerHTML = `
            <div class="product-image-container position-relative">
                <img src="${getImageUrl(product.image)}" 
                     alt="${product.name}" 
                     class="product-image ${isOutOfStock ? 'opacity-50' : ''}"
                     loading="lazy"
                     width="300"
                     height="200"
                     onerror="this.src='https://via.placeholder.com/300x200/007bff/fff?text=IR7+Football'">
                <button class="btn wishlist-btn position-absolute top-0 end-0 m-2 ${wishlistClass}" 
                        data-product-id="${product.id}">
                    <i class="fas fa-heart"></i>
                </button>
                ${stockBadge}
                ${product.price > 2000 ? `<span class="badge bg-danger position-absolute top-0 end-0 m-2" style="left: auto; right: 0;">Premium</span>` : ''}
            </div>
            <div class="product-info">
                <h5 class="product-title">${product.name}</h5>
                <p class="product-category">${product.category.toUpperCase()}</p>
                
                <!-- Rating and Reviews -->
                <div class="product-rating mb-2">
                    <div class="stars small">
                        ${generateStarRating(product.rating)}
                        <span class="text-muted ms-1">(${product.reviews})</span>
                    </div>
                </div>
                
                <p class="product-price">${formatPrice(product.price)}</p>
                <p class="product-description">${product.description}</p>
                
                ${sizeOptions}
                
                <div class="product-actions">
                    <button class="btn btn-outline-primary btn-sm view-details" 
                            data-product-id="${product.id}">
                        <i class="fas fa-eye me-1"></i>Details
                    </button>
                    <button class="btn btn-danger btn-sm add-to-cart ${isOutOfStock ? 'disabled' : ''}" 
                            data-product-id="${product.id}"
                            ${isOutOfStock ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus me-1"></i>${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        `;
        productListDiv.appendChild(productCard);
    });

    // Add event listeners for all buttons
    setupProductEventListeners();
    
    // Update product count
    const productCount = document.getElementById('product-count');
    if (productCount) {
        productCount.textContent = `${currentProducts.length} products found`;
    }
}

// Setup event listeners for product buttons
function setupProductEventListeners() {
    // Wishlist buttons
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('button').dataset.productId);
            toggleWishlist(productId);
        });
    });

    // Add to Cart buttons
    document.querySelectorAll('.add-to-cart:not(.disabled)').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('button').dataset.productId);
            const product = currentProducts.find(p => p.id === productId);

            if (product) {
                // Get selected size if applicable
                let selectedSize = null;
                if (product.hasSizes) {
                    const sizeSelect = document.querySelector(`.size-select[data-product-id="${productId}"]`);
                    selectedSize = sizeSelect ? sizeSelect.value : product.sizes[0];
                }
                
                addToCart(product, selectedSize);
                
                // Add visual feedback
                const btn = e.target.closest('button');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check me-1"></i>Added!';
                btn.disabled = true;
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }, 2000);
            }
        });
    });

    // View Details buttons
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('button').dataset.productId);
            const product = currentProducts.find(p => p.id === productId);
            if (product) {
                const sizeInfo = product.hasSizes ? `\nAvailable Sizes: ${product.sizes.join(', ')}` : '';
                const stockInfo = `\nStock: ${product.stock > 0 ? `${product.stock} available` : 'Out of stock'}`;
                alert(`Product Details:\n\n${product.name}\nPrice: ${formatPrice(product.price)}\nCategory: ${product.category}${sizeInfo}${stockInfo}\nRating: ${product.rating}/5 (${product.reviews} reviews)\n\n${product.details}`);
            }
        });
    });
}

// Wishlist functionality
function toggleWishlist(productId) {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const product = currentProducts.find(p => p.id === productId);
    
    if (!product) return;

    const existingIndex = wishlist.findIndex(item => item.id === productId);
    
    if (existingIndex > -1) {
        // Remove from wishlist
        wishlist.splice(existingIndex, 1);
        showToast('Removed from wishlist', 'info');
    } else {
        // Add to wishlist
        wishlist.push(product);
        showToast('Added to wishlist', 'success');
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistUI(productId);
}

function updateWishlistUI(productId) {
    const wishlistBtn = document.querySelector(`.wishlist-btn[data-product-id="${productId}"]`);
    if (wishlistBtn) {
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const isInWishlist = wishlist.some(item => item.id === productId);
        wishlistBtn.className = `btn wishlist-btn position-absolute top-0 end-0 m-2 ${isInWishlist ? 'text-danger' : 'text-muted'}`;
        wishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
    }
}

// Setup enhanced filtering
function setupEnhancedFilters() {
    // Price range filter
    const priceRangeInput = document.getElementById('price-range');
    if (priceRangeInput) {
        priceRangeInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('price-range-value').textContent = `৳${value}`;
            currentFilters.priceRange[1] = value;
            applyFilters();
        });
    }

    // Size filters
    document.querySelectorAll('.size-filter').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const size = e.target.value;
            if (e.target.checked) {
                currentFilters.sizes.push(size);
            } else {
                currentFilters.sizes = currentFilters.sizes.filter(s => s !== size);
            }
            applyFilters();
        });
    });

    // Brand filters
    document.querySelectorAll('.brand-filter').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const brand = e.target.value;
            if (e.target.checked) {
                currentFilters.brands.push(brand);
            } else {
                currentFilters.brands = currentFilters.brands.filter(b => b !== brand);
            }
            applyFilters();
        });
    });

    // In stock filter
    const inStockFilter = document.getElementById('in-stock-filter');
    if (inStockFilter) {
        inStockFilter.addEventListener('change', (e) => {
            currentFilters.inStock = e.target.checked;
            applyFilters();
        });
    }

    // Sort functionality
    const sortSelect = document.getElementById('sort-options');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentFilters.sortBy = e.target.value;
            applyFilters();
            showToast(`Sorted by: ${e.target.options[e.target.selectedIndex].text}`, 'info');
        });
    }

    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentFilters.searchQuery = e.target.value.trim();
                applyFilters();
            }, 300);
        });
    }

    // Reset filters button
    const resetFiltersBtn = document.getElementById('reset-filters');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetAllFilters);
    }
}

// Reset all filters
function resetAllFilters() {
    currentFilters = {
        category: 'all',
        priceRange: [0, 10000],
        sizes: [],
        brands: [],
        sortBy: 'newest',
        searchQuery: '',
        inStock: false
    };
    
    // Reset UI elements
    document.querySelectorAll('.size-filter, .brand-filter').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    const priceRangeInput = document.getElementById('price-range');
    if (priceRangeInput) {
        priceRangeInput.value = 10000;
        document.getElementById('price-range-value').textContent = '৳10000';
    }
    
    const sortSelect = document.getElementById('sort-options');
    if (sortSelect) {
        sortSelect.value = 'newest';
    }
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    
    const inStockFilter = document.getElementById('in-stock-filter');
    if (inStockFilter) {
        inStockFilter.checked = false;
    }
    
    // Update active category
    updateActiveCategory('all');
    
    applyFilters();
    showToast('All filters reset', 'info');
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
    
    currentFilters.category = category;
}

// Enhanced router function
function router() {
    const path = window.location.hash.substring(1);
    const category = path === '' ? 'all' : path;
    
    console.log(`Routing to category: ${category}`);
    updateActiveCategory(category);
    applyFilters();
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
async function initApp() {
    console.log('Initializing IR7 Football Shop...');
    
    // Show loading state
    const container = document.getElementById('app-container');
    if (container) {
        container.innerHTML = `
            <div class="d-flex justify-content-center align-items-center py-5">
                <div class="spinner-border text-danger" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <span class="ms-2">Loading products...</span>
            </div>
        `;
    }
    
    // Initialize storage
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    if (!localStorage.getItem('wishlist')) {
        localStorage.setItem('wishlist', JSON.stringify([]));
    }
    
    // Load dynamic categories first
    await loadCategories();
    
    // Load all products
    await loadAllProducts();
    
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
    
    // Setup enhanced filters
    setupEnhancedFilters();
    
    // Update user display
    updateUserDisplay();
    
    // Initialize the application
    updateCartCount();
    
    console.log('IR7 Football Shop initialized successfully');
}

// Track initialization state to prevent duplicate calls
let appInitialized = false;

async function initializeAppOnce() {
    if (!appInitialized) {
        appInitialized = true;
        await initApp();
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

// Add admin access shortcut (Ctrl+Alt+A)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.key === 'a') {
        window.location.href = 'admin.html';
    }
});

// Make reset function available globally
window.resetAllFilters = resetAllFilters;
window.generateStarRating = generateStarRating;


// ... (all your existing app.js code remains the same) ...

// Export functions for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        updateCartCount, 
        generateStarRating,
        resetAllFilters,
        showToast,
        formatPrice
    };
} else {
    // For ES6 modules
    window.updateCartCount = updateCartCount;
    window.generateStarRating = generateStarRating;
    window.resetAllFilters = resetAllFilters;
    window.showToast = showToast;
    window.formatPrice = formatPrice;
}

// Explicit exports for ES6 modules
export { 
    updateCartCount, 
    generateStarRating, 
    resetAllFilters, 
    showToast, 
    formatPrice 
};