import { updateCartCount, showToast, generateStarRating } from '../app.js';

/**
 * Format price in BDT with commas
 */
function formatPrice(price) {
    return '৳' + price.toLocaleString('en-BD');
}

/**
 * Get image URL with fallback
 */
function getImageUrl(productImage) {
    // If no image provided, use placeholder
    if (!productImage) {
        return 'https://via.placeholder.com/300x200/007bff/fff?text=IR7+Football';
    }
    
    // If it's a local image path (starts with /images/)
    if (productImage.startsWith('/images/')) {
        return productImage;
    }
    
    // If it's already a full URL (http/https), use it directly
    if (productImage.startsWith('http://') || productImage.startsWith('https://')) {
        return productImage;
    }
    
    // For any other case, assume it's a local image path and prepend if needed
    if (productImage.startsWith('images/')) {
        return '/' + productImage;
    }
    
    // Default fallback
    return 'https://via.placeholder.com/300x200/007bff/fff?text=IR7+Football';
}

/**
 * Enhanced add to cart function with size and stock validation
 */
export function addToCart(product, selectedSize = null) {
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

/**
 * Enhanced product rendering with reviews, ratings, and stock management
 */
export async function renderProductsPage(container, category) {
    // Show loading state
    container.innerHTML = `
        <div class="d-flex justify-content-center align-items-center py-5">
            <div class="spinner-border text-danger" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <span class="ms-2">Loading products...</span>
        </div>
    `;

    try {
        const url = category === 'all' ? '/api/products' : `/api/products?category=${category}`;
        console.log(`Fetching from: ${url}`);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const products = await response.json();
        console.log(`Received ${products.length} products`, products);
        
        // Clear and re-render container
        container.innerHTML = `
            <div class="product-grid" id="product-list"></div>
        `;

        const productListDiv = document.getElementById('product-list');
        
        if (products.length === 0) {
            productListDiv.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h4 class="text-muted">No products found</h4>
                    <p class="text-muted">No products available in the ${category} category.</p>
                    <a href="#all" class="btn btn-primary">View All Products</a>
                </div>
            `;
            return;
        }

        // Load wishlist
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

        // Render each product with enhanced features
        products.forEach(product => {
            const isInWishlist = wishlist.some(item => item.id === product.id);
            const wishlistClass = isInWishlist ? 'text-danger' : 'text-muted';
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock < 10;
            
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            // Generate size options if product has sizes and is in stock
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
                (isLowStock ? `<span class="badge bg-warning position-absolute top-0 start-0 m-2">Only ${product.stock} left</span>` : '');
            
            // Premium badge for high-priced items
            const premiumBadge = product.price > 2000 ? 
                '<span class="badge bg-danger position-absolute top-0 end-0 m-2" style="left: auto; right: 0;">Premium</span>' : '';
            
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
                    ${premiumBadge}
                </div>
                <div class="product-info">
                    <h5 class="product-title">${product.name}</h5>
                    <p class="product-category">${product.category.toUpperCase()}</p>
                    
                    <!-- Rating and Reviews -->
                    <div class="product-rating mb-2">
                        <div class="stars small">
                            ${generateStarRating(product.rating)}
                            <span class="text-muted ms-1">(${product.reviews} reviews)</span>
                        </div>
                    </div>
                    
                    <p class="product-price">${formatPrice(product.price)}</p>
                    <p class="product-description">${product.description}</p>
                    
                    <!-- Stock Information -->
                    <div class="stock-info mb-2">
                        <small class="${isOutOfStock ? 'text-danger' : isLowStock ? 'text-warning' : 'text-success'}">
                            <i class="fas ${isOutOfStock ? 'fa-times-circle' : 'fa-check-circle'} me-1"></i>
                            ${isOutOfStock ? 'Out of Stock' : (isLowStock ? `Only ${product.stock} left in stock` : 'In Stock')}
                        </small>
                    </div>
                    
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
        setupProductEventListeners(products);

    } catch (error) {
        console.error('Error fetching products:', error);
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h4 class="text-danger">Failed to load products</h4>
                <p class="text-muted">Please check your connection and try again.</p>
                <button class="btn btn-primary" onclick="window.location.reload()">Retry</button>
            </div>
        `;
    }
}

/**
 * Setup event listeners for product buttons
 */
function setupProductEventListeners(products) {
    // Wishlist buttons
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('button').dataset.productId);
            toggleWishlist(productId, products);
        });
    });

    // Add to Cart buttons (only for in-stock items)
    document.querySelectorAll('.add-to-cart:not(.disabled)').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('button').dataset.productId);
            const product = products.find(p => p.id === productId);

            if (product && product.stock > 0) {
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
            const product = products.find(p => p.id === productId);
            if (product) {
                const sizeInfo = product.hasSizes ? `\nAvailable Sizes: ${product.sizes.join(', ')}` : '';
                const stockInfo = `\nStock: ${product.stock > 0 ? `${product.stock} available` : 'Out of stock'}`;
                const ratingInfo = `\nRating: ${product.rating}/5 (${product.reviews} reviews)`;
                
                // Enhanced product details modal
                showProductDetailsModal(product, sizeInfo, stockInfo, ratingInfo);
            }
        });
    });
}

/**
 * Show enhanced product details modal
 */
function showProductDetailsModal(product, sizeInfo, stockInfo, ratingInfo) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('product-details-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'product-details-modal';
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Product Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="product-details-content">
                        <!-- Content will be populated dynamically -->
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" id="add-to-cart-from-modal">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Populate modal content
    const modalContent = document.getElementById('product-details-content');
    const isOutOfStock = product.stock <= 0;
    
    modalContent.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <img src="${getImageUrl(product.image)}" 
                     alt="${product.name}" 
                     class="img-fluid rounded-3"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/400x300/007bff/fff?text=IR7+Football'">
            </div>
            <div class="col-md-6">
                <h4>${product.name}</h4>
                <p class="text-muted text-uppercase">${product.category}</p>
                
                <div class="rating mb-3">
                    ${generateStarRating(product.rating)}
                    <span class="text-muted ms-2">(${product.reviews} reviews)</span>
                </div>
                
                <h3 class="text-primary mb-3">${formatPrice(product.price)}</h3>
                
                <div class="stock-status mb-3">
                    <span class="badge ${isOutOfStock ? 'bg-danger' : 'bg-success'}">
                        ${isOutOfStock ? 'Out of Stock' : 'In Stock'}
                    </span>
                    ${!isOutOfStock && product.stock < 10 ? 
                        `<span class="badge bg-warning ms-2">Only ${product.stock} left</span>` : ''}
                </div>
                
                <p class="mb-3">${product.description}</p>
                
                ${product.hasSizes && !isOutOfStock ? `
                    <div class="size-selection mb-3">
                        <label class="form-label fw-bold">Select Size:</label>
                        <select class="form-select" id="modal-size-select">
                            ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
                        </select>
                    </div>
                ` : ''}
                
                <div class="product-features">
                    <h6>Product Features:</h6>
                    <p class="text-muted">${product.details}</p>
                </div>
            </div>
        </div>
    `;

    // Setup modal event listeners
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    // Add to cart from modal
    document.getElementById('add-to-cart-from-modal').addEventListener('click', () => {
        if (isOutOfStock) {
            showToast('This product is out of stock', 'error');
            return;
        }

        let selectedSize = null;
        if (product.hasSizes) {
            const sizeSelect = document.getElementById('modal-size-select');
            selectedSize = sizeSelect ? sizeSelect.value : product.sizes[0];
        }
        
        addToCart(product, selectedSize);
        bsModal.hide();
    });
}

/**
 * Wishlist functionality
 */
function toggleWishlist(productId, products) {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const product = products.find(p => p.id === productId);
    
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

/**
 * Filter products by various criteria
 */
export function filterProducts(products, filters) {
    let filtered = [...products];

    // Category filter
    if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter(product => product.category === filters.category);
    }

    // Price range filter
    if (filters.priceRange) {
        filtered = filtered.filter(product => 
            product.price >= filters.priceRange[0] && 
            product.price <= filters.priceRange[1]
        );
    }

    // Size filter
    if (filters.sizes && filters.sizes.length > 0) {
        filtered = filtered.filter(product => {
            if (!product.sizes || product.sizes.length === 0) return false;
            return filters.sizes.some(size => product.sizes.includes(size));
        });
    }

    // Brand filter
    if (filters.brands && filters.brands.length > 0) {
        filtered = filtered.filter(product => {
            const brand = getProductBrand(product.name);
            return filters.brands.includes(brand);
        });
    }

    // In stock filter
    if (filters.inStock) {
        filtered = filtered.filter(product => product.stock > 0);
    }

    // Search filter
    if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        );
    }

    return filtered;
}

/**
 * Sort products by various criteria
 */
export function sortProducts(products, sortBy) {
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
        case 'stock':
            return sorted.sort((a, b) => b.stock - a.stock);
        case 'newest':
        default:
            return sorted.sort((a, b) => b.id - a.id);
    }
}

/**
 * Get product brand from name
 */
function getProductBrand(productName) {
    const brands = ['Nike', 'Adidas', 'Puma', 'New Balance', 'Under Armour'];
    for (let brand of brands) {
        if (productName.toLowerCase().includes(brand.toLowerCase())) {
            return brand;
        }
    }
    return 'Other';
}

// Make functions available globally for filter functionality
window.productManager = {
    filterProducts,
    sortProducts,
    resetFilters: function() {
        // Reset all filter inputs
        document.querySelectorAll('.size-filter, .brand-filter').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        const priceRangeInput = document.getElementById('price-range');
        if (priceRangeInput) {
            priceRangeInput.value = 10000;
            document.getElementById('price-range-value').textContent = '৳10000';
        }
        
        const inStockFilter = document.getElementById('in-stock-filter');
        if (inStockFilter) {
            inStockFilter.checked = false;
        }
        
        // Reset sort
        const sortSelect = document.getElementById('sort-options');
        if (sortSelect) {
            sortSelect.value = 'newest';
        }
        
        // Reset search
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        showToast('Filters reset successfully', 'info');
    }
};