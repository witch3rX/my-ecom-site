import { updateCartCount, showToast } from '../app.js';
import { AuthSystem } from './auth.js';

/**
 * Format price in BDT with commas
 */
function formatPrice(price) {
    return '৳' + price.toLocaleString('en-BD');
}

/**
 * Get image URL with fallback for cart
 */
function getImageUrl(productImage) {
    // If it's a local image path
    if (productImage && productImage.startsWith('/images/')) {
        return productImage;
    }
    // If it's an external URL, use it directly
    return productImage || 'https://via.placeholder.com/100x100/dc3545/fff?text=IR7';
}

// Enhanced cart management functions
function updateQuantity(productId, size, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    newQuantity = parseInt(newQuantity);

    // Remove the specific item (by ID and size)
    const updatedCart = cart.filter(item => !(item.id === productId && item.selectedSize === size));
    
    // Find the original item
    const itemToReAdd = cart.find(item => item.id === productId && item.selectedSize === size);
    
    if (itemToReAdd && newQuantity > 0) {
        // Add the item back with the new quantity
        for (let i = 0; i < newQuantity; i++) {
            updatedCart.push({ ...itemToReAdd });
        }
    }
    
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    updateCartCount();
    renderCartPage();
}

function removeItem(productId, size) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const updatedCart = cart.filter(item => !(item.id === productId && item.selectedSize === size));
    
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    updateCartCount();
    renderCartPage();
}

function showCheckoutModal(totalAmount) {
    const isLoggedIn = AuthSystem.isAuthenticated();
    const currentUser = AuthSystem.getCurrentUser();
    
    const checkoutModal = document.createElement('div');
    checkoutModal.className = 'modal fade';
    checkoutModal.id = 'checkoutModal';
    checkoutModal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Checkout - Order Total: ${formatPrice(totalAmount)}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    ${isLoggedIn ? `
                        <div class="alert alert-info">
                            <i class="fas fa-user me-2"></i>Welcome, ${currentUser.firstName}! 
                            <a href="#" onclick="switchToGuest()" class="alert-link">Not you? Checkout as guest</a>
                        </div>
                    ` : `
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            You're checking out as a guest. 
                            <a href="auth.html" class="alert-link">Sign in for faster checkout</a>
                        </div>
                    `}
                    
                    <form id="checkoutForm">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">First Name *</label>
                                <input type="text" class="form-control" name="firstName" 
                                       value="${isLoggedIn ? currentUser.firstName : ''}" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Last Name *</label>
                                <input type="text" class="form-control" name="lastName" 
                                       value="${isLoggedIn ? currentUser.lastName : ''}" required>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Email *</label>
                                <input type="email" class="form-control" name="email" 
                                       value="${isLoggedIn ? currentUser.email : ''}" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Phone Number *</label>
                                <input type="tel" class="form-control" name="phone" 
                                       value="${isLoggedIn ? currentUser.phone : ''}" required>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Delivery Address *</label>
                            <textarea class="form-control" name="address" rows="3" required 
                                      placeholder="Full address including area, city, and postal code"></textarea>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Payment Method *</label>
                            <div class="payment-methods">
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="radio" name="paymentMethod" 
                                           id="cod" value="COD" checked>
                                    <label class="form-check-label" for="cod">
                                        <i class="fas fa-money-bill-wave me-2"></i>Cash on Delivery (COD)
                                    </label>
                                </div>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="radio" name="paymentMethod" 
                                           id="bkash" value="bKash">
                                    <label class="form-check-label" for="bkash">
                                        <i class="fas fa-mobile-alt me-2"></i>bKash
                                    </label>
                                </div>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="radio" name="paymentMethod" 
                                           id="nagad" value="Nagad">
                                    <label class="form-check-label" for="nagad">
                                        <i class="fas fa-wallet me-2"></i>Nagad
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="paymentMethod" 
                                           id="card" value="Credit Card">
                                    <label class="form-check-label" for="card">
                                        <i class="fas fa-credit-card me-2"></i>Credit/Debit Card
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-3 form-check">
                            <input type="checkbox" class="form-check-input" id="agreeTerms" required>
                            <label class="form-check-label" for="agreeTerms">
                                I agree to the <a href="#" data-bs-toggle="modal" data-bs-target="#termsModal">Terms and Conditions</a>
                            </label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-danger" onclick="submitOrder(${totalAmount})">
                        <i class="fas fa-lock me-2"></i>Place Order
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(checkoutModal);
    
    const modal = new bootstrap.Modal(checkoutModal);
    modal.show();
    
    // Remove modal from DOM when hidden
    checkoutModal.addEventListener('hidden.bs.modal', function () {
        document.body.removeChild(checkoutModal);
    });
}


// Global function for order submission
window.submitOrder = async function(totalAmount) {
    const form = document.getElementById('checkoutForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);
    const orderData = {
        customer: {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address')
        },
        paymentMethod: formData.get('paymentMethod'),
        items: JSON.parse(localStorage.getItem('cart')) || [],
        totalAmount: totalAmount,
        orderDate: new Date().toISOString()
    };

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();
        
        if (result.success) {
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
            modal.hide();
            
            // Clear cart and show success
            localStorage.removeItem('cart');
            updateCartCount();
            showOrderSuccess(result.orderId, totalAmount);
        } else {
            throw new Error('Order failed');
        }
    } catch (error) {
        showToast('Order failed. Please try again.', 'error');
    }
};

window.switchToGuest = function() {
    AuthSystem.signOut();
    const modal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
    modal.hide();
    setTimeout(() => showCheckoutModal(total), 500);
};

function showOrderSuccess(orderId, totalAmount) {
    const cartContentDiv = document.getElementById('cart-content');
    const cartSummaryCol = document.getElementById('cart-summary-col');
    
    cartContentDiv.innerHTML = `
        <div class="text-center p-5 bg-success bg-opacity-10 border border-success rounded-3 fade-in">
            <i class="fas fa-check-circle fa-4x text-success mb-3"></i>
            <h3 class="text-success fw-bold mb-3">Order Confirmed!</h3>
            <p class="lead">Your order <strong>#${orderId}</strong> totaling <strong>${formatPrice(totalAmount)}</strong> has been confirmed.</p>
            <div class="order-details mt-4 p-3 bg-white rounded">
                <h5 class="mb-3">Order Details</h5>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Total Amount:</strong> ${formatPrice(totalAmount)}</p>
                <p><strong>Estimated Delivery:</strong> 3-5 business days</p>
                <p class="text-muted small">You will receive a confirmation email shortly.</p>
            </div>
            <div class="d-flex gap-2 justify-content-center mt-4">
                <a href="index.html" class="btn btn-primary btn-lg">
                    <i class="fas fa-home me-2"></i>Continue Shopping
                </a>
                <button class="btn btn-outline-primary btn-lg" onclick="window.print()">
                    <i class="fas fa-print me-2"></i>Print Receipt
                </button>
            </div>
        </div>
    `;
    
    if (cartSummaryCol) {
        cartSummaryCol.style.display = 'none';
    }

    console.log(`Order placed: #${orderId} for ${formatPrice(totalAmount)}`);
}

export function renderCartPage() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContentDiv = document.getElementById('cart-content');
    const cartSummaryCol = document.getElementById('cart-summary-col');
    const cartSummaryDiv = document.getElementById('cart-summary');

    if (!cartContentDiv || !cartSummaryDiv || !cartSummaryCol) {
        return;
    }
    
    if (cartContentDiv.querySelector('.bg-success')) {
        cartSummaryCol.style.display = 'none';
        return;
    }

    cartContentDiv.innerHTML = '';
    cartSummaryDiv.innerHTML = '';
    let subtotal = 0;

    if (cart.length === 0) {
        cartContentDiv.innerHTML = `
            <div class="text-center p-5">
                <i class="fas fa-shopping-cart fa-4x text-muted mb-3"></i>
                <h4 class="text-muted mb-3">Your cart is empty</h4>
                <p class="text-muted mb-4">Discover our amazing football gear and fill your cart!</p>
                <a href="index.html#shop" class="btn btn-primary btn-lg">
                    <i class="fas fa-shopping-bag me-2"></i>Start Shopping
                </a>
            </div>
        `;
        cartSummaryCol.style.display = 'none';
        return;
    }
    
    cartSummaryCol.style.display = 'block';

    // Build cart items
    let cartItemsHtml = '<div class="cart-items">';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        cartItemsHtml += `
            <div class="cart-item fade-in" id="cart-item-${item.id}-${item.selectedSize}">
                <img src="${getImageUrl(item.image)}" 
                     alt="${item.name}" 
                     class="cart-item-image"
                     onerror="this.src='https://via.placeholder.com/100x100/dc3545/fff?text=IR7'">
                
                <div class="cart-item-details">
                    <h5 class="mb-2">${item.name}</h5>
                    <p class="cart-item-category mb-2">${item.category.toUpperCase()}</p>
                    ${item.selectedSize ? `<p class="cart-item-size mb-1"><strong>Size:</strong> ${item.selectedSize}</p>` : ''}
                    <p class="cart-item-price mb-0">${formatPrice(item.price)} each</p>
                </div>

                <div class="cart-item-controls d-flex align-items-center gap-3">
                    <div class="quantity-controls">
                        <label class="form-label small mb-1">Qty:</label>
                        <input type="number" 
                               class="form-control quantity-input" 
                               data-product-id="${item.id}"
                               data-size="${item.selectedSize}"
                               value="${item.quantity}" 
                               min="1" 
                               max="10">
                    </div>
                    
                    <div class="text-center">
                        <div class="fw-bold text-dark fs-5">${formatPrice(itemTotal)}</div>
                    </div>
                    
                    <button class="btn remove-from-cart" 
                            data-product-id="${item.id}"
                            data-size="${item.selectedSize}"
                            title="Remove item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    cartItemsHtml += '</div>';
    cartContentDiv.innerHTML = cartItemsHtml;

    // Calculate totals
    const shipping = subtotal > 3000 ? 0 : 110;
    const taxRate = 0.05;
    const tax = subtotal * taxRate;
    const total = subtotal + shipping + tax;

    // Cart summary
    cartSummaryDiv.innerHTML = `
        <div class="cart-summary">
            <h4 class="text-center">
                <i class="fas fa-receipt me-2"></i>Order Summary
            </h4>
            
            <div class="summary-line">
                <span>Subtotal (${cart.length} items):</span>
                <span class="fw-semibold">${formatPrice(subtotal)}</span>
            </div>
            
            <div class="summary-line">
                <span>Shipping:</span>
                <span class="fw-semibold">${shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
            </div>
            
            <div class="summary-line">
                <span>VAT (5%):</span>
                <span class="fw-semibold">${formatPrice(tax)}</span>
            </div>
            
            ${subtotal < 3000 ? `
                <div class="alert alert-info small mt-3">
                    <i class="fas fa-shipping-fast me-2"></i>
                    Add ${formatPrice(3000 - subtotal)} more for free shipping!
                </div>
            ` : `
                <div class="alert alert-success small mt-3">
                    <i class="fas fa-check-circle me-2"></i>
                    You qualify for free shipping!
                </div>
            `}
            
            <div class="summary-line summary-total border-top pt-3 mt-2">
                <span>Total:</span>
                <span class="fs-4 text-danger">${formatPrice(total)}</span>
            </div>
            
            <div class="d-grid gap-2 mt-4">
                <button class="btn btn-danger btn-lg fw-bold rounded-pill py-3" id="checkout-button">
                    <i class="fas fa-lock me-2"></i>Proceed to Checkout
                </button>
                <button class="btn btn-outline-secondary btn-lg rounded-pill py-3" onclick="window.location.href='index.html#shop'">
                    <i class="fas fa-arrow-left me-2"></i>Continue Shopping
                </button>
            </div>
            
            <div class="text-center mt-3">
                <small class="text-muted">
                    <i class="fas fa-shield-alt me-1"></i>
                    Secure payment • 30-day returns • Free shipping over ৳3,000
                </small>
            </div>
        </div>
    `;

    // Event listeners
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const productId = parseInt(e.target.dataset.productId);
            const size = e.target.dataset.size;
            let newQuantity = parseInt(e.target.value);
            
            if (newQuantity < 1 || isNaN(newQuantity)) {
                newQuantity = 1;
                e.target.value = 1;
            } else if (newQuantity > 10) {
                newQuantity = 10;
                e.target.value = 10;
            }

            updateQuantity(productId, size, newQuantity);
        });
    });

    document.querySelectorAll('.remove-from-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (button) {
                const productId = parseInt(button.dataset.productId);
                const size = button.dataset.size;
                if (confirm('Are you sure you want to remove this item from your cart?')) {
                    removeItem(productId, size);
                }
            }
        });
    });

    document.getElementById('checkout-button').addEventListener('click', () => {
        showCheckoutModal(total);
    });
}

// Initialize cart page
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('cart.html')) {
        renderCartPage();
    }
});