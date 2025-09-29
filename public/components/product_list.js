import { updateCartCount, showToast } from '../app.js';

/**
 * Format price in BDT with commas
 */
function formatPrice(price) {
    return '৳' + price.toLocaleString('en-BD');
}

/**
 * Enhanced add to cart function with size support
 */
export function addToCart(product, selectedSize = null) {
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
 * Enhanced product rendering with size selection
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

        // Render each product
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            // Generate size options if product has sizes
            const sizeOptions = product.hasSizes ? `
                <div class="size-selection mb-3">
                    <label class="form-label small fw-bold">Size:</label>
                    <select class="form-select form-select-sm size-select" data-product-id="${product.id}">
                        ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
                    </select>
                </div>
            ` : '';
            
            productCard.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.image || 'https://via.placeholder.com/300x200/007bff/fff?text=IR7+Football'}" 
                         alt="${product.name}" 
                         class="product-image"
                         onerror="this.src='https://via.placeholder.com/300x200/007bff/fff?text=IR7+Football'">
                </div>
                <div class="product-info">
                    <h5 class="product-title">${product.name}</h5>
                    <p class="product-category">${product.category.toUpperCase()}</p>
                    <p class="product-price">${formatPrice(product.price)}</p>
                    <p class="product-description">${product.description}</p>
                    
                    ${sizeOptions}
                    
                    <div class="product-actions">
                        <button class="btn btn-outline-primary btn-sm view-details" 
                                data-product-id="${product.id}">
                            <i class="fas fa-eye me-1"></i>Details
                        </button>
                        <button class="btn btn-danger btn-sm add-to-cart" 
                                data-product-id="${product.id}">
                            <i class="fas fa-cart-plus me-1"></i>Add to Cart
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
    // Add to Cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('button').dataset.productId);
            const product = products.find(p => p.id === productId);

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
            const product = products.find(p => p.id === productId);
            if (product) {
                const sizeInfo = product.hasSizes ? `\nAvailable Sizes: ${product.sizes.join(', ')}` : '';
                alert(`Product Details:\n\n${product.name}\nPrice: ${formatPrice(product.price)}\nCategory: ${product.category}${sizeInfo}\n\n${product.details}`);
            }
        });
    });
}