import { addToCart } from './product_list.js';
import { updateCartCount, showToast } from '../app.js';

/**
 * Format price in BDT with commas
 */
function formatPrice(price) {
    return '৳' + price.toLocaleString('en-BD');
}

export async function renderProductDetail(container, productId) {
    container.innerHTML = `
        <div class="container py-5">
            <div class="d-flex justify-content-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    `;

    try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) throw new Error('Product not found');
        
        const product = await response.json();
        
        container.innerHTML = `
            <div class="container py-5 fade-in">
                <nav aria-label="breadcrumb" class="mb-4">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="index.html">Home</a></li>
                        <li class="breadcrumb-item"><a href="#${product.category}">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</a></li>
                        <li class="breadcrumb-item active">${product.name}</li>
                    </ol>
                </nav>
                
                <div class="row">
                    <div class="col-md-6 mb-4">
                        <div class="product-image-container">
                            <img src="https://via.placeholder.com/600x400/007bff/fff?text=${encodeURIComponent(product.name)}" 
                                 alt="${product.name}" 
                                 class="img-fluid rounded-3 shadow">
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="product-details">
                            <h1 class="display-5 fw-bold mb-3">${product.name}</h1>
                            <p class="text-muted text-uppercase small mb-3">${product.category}</p>
                            <div class="price-section mb-4">
                                <span class="h2 text-primary fw-bold">${formatPrice(product.price)}</span>
                            </div>
                            
                            <p class="lead mb-4">${product.description}</p>
                            
                            <div class="product-features mb-4">
                                <h5 class="mb-3">Product Details</h5>
                                <p>${product.details}</p>
                            </div>
                            
                            <div class="product-actions">
                                <div class="d-flex gap-3 align-items-center mb-4">
                                    <button class="btn btn-primary btn-lg flex-fill add-to-cart-detail" 
                                            data-product-id="${product.id}">
                                        <i class="fas fa-cart-plus me-2"></i>Add to Cart
                                    </button>
                                </div>
                                
                                <div class="security-badges text-center">
                                    <small class="text-muted">
                                        <i class="fas fa-lock me-1"></i>Secure checkout • 
                                        <i class="fas fa-shield-alt me-1"></i>Buyer protection
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listener for the detail page add to cart button
        document.querySelector('.add-to-cart-detail').addEventListener('click', () => {
            addToCart(product);
            showToast(`${product.name} added to cart!`);
        });

    } catch (error) {
        container.innerHTML = `
            <div class="container py-5 text-center">
                <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h3 class="text-muted">Product Not Found</h3>
                <p class="text-muted mb-4">The product you're looking for doesn't exist.</p>
                <a href="index.html" class="btn btn-primary">Back to Shop</a>
            </div>
        `;
    }
}