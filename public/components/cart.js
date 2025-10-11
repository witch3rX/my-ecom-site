// cart.js (Located in components/cart.js)

// =========================================================================
// I. MODULE IMPORTS
// =========================================================================

// Import essential functions from the core app module
import { updateCartCount, showToast } from '../app.js';
// Import the Authentication System for checkout logic
import { AuthSystem } from './auth.js';


// =========================================================================
// II. HELPER FUNCTIONS
// =========================================================================

/**
 * Format price in BDT (Bangladeshi Taka) with commas for readability.
 * @param {number} price - The numerical price value.
 * @returns {string} The formatted price string.
 */
function formatPrice(price) {
    if (typeof price !== 'number' || isNaN(price)) {
        return '৳0';
    }
    // Ensures price is rounded for display and formatted with BD locale
    return '৳' + Math.round(price).toLocaleString('en-BD');
}

/**
 * Get image URL with a local path check and a placeholder fallback for the cart view.
 * @param {string} productImage - The source image path or URL.
 * @returns {string} A valid image URL.
 */
function getImageUrl(productImage) {
    // If it's a local image path
    if (productImage && productImage.startsWith('/images/')) {
        return productImage;
    }
    // Fallback to a red placeholder image
    return productImage || 'https://via.placeholder.com/100x100/dc3545/fff?text=IR7';
}
/**
 * Generates a simple PDF receipt using jsPDF and triggers a download.
 * @param {object} order - The final order object.
 */
function generatePDFReceipt(order) {
    // Check if the jsPDF library is loaded (Make sure you added the script tag in cart.html!)
    if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
        showToast("Error: PDF library not loaded. Please ensure the jspdf script is included in cart.html.", "error");
        return;
    }

    // Initialize jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // --- Data Safety and Formatting ---
    const customer = order.customer || {};
    const shipping = order.shippingAddress || {}; // Use the nested address object
    
    // Extract data with robust fallbacks for PDF display
    const customerName = (customer.firstName && customer.lastName) ? 
                         `${customer.firstName} ${customer.lastName}` : 
                         customer.firstName || customer.lastName || 'Valued Customer';
                         
    const phone = shipping.phone || order.shippingPhone || 'N/A';
    const email = customer.email || 'N/A';
    const totalAmount = order.totalAmount || 0;
    const subtotal = order.subtotal || 0;
    const shippingFee = order.shippingFee || 0;
    
    // Safely construct the address lines for the PDF (assuming simple string address from form)
    const addressLine1 = shipping.address || 'No Address Provided';
    const cityPostcode = 'N/A'; // Since the form only collects one address line, these are unknown
    const country = 'Bangladesh';
    
    // Set initial text position
    let y = 15;
    
    // --- Header ---
    doc.setFontSize(22);
    doc.setTextColor(220, 53, 69); // Bootstrap Red
    doc.text("IR7 Football Shop Receipt", 105, y, null, null, 'center');
    y += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Date: ${new Date(order.orderDate).toLocaleDateString()}`, 105, y, null, null, 'center');
    y += 10;
    
    // --- Order Details ---
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Order & Customer Details", 10, y);
    doc.line(10, y + 2, 200, y + 2); // Horizontal line
    y += 8;

    doc.setFontSize(10);
    doc.text(`Order ID: ${order.orderId}`, 10, y);
    doc.text(`Customer: ${customerName}`, 100, y);
    y += 6;
    doc.text(`Payment Method: ${order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment (Simulated)'}`, 10, y);
    doc.text(`Email: ${email}`, 100, y);
    y += 10;
    
    // --- Shipping Address ---
    doc.setFontSize(12);
    doc.text("Shipping To:", 10, y);
    y += 6;
    doc.setFontSize(10);
    
    // Print the structured address lines
    doc.text(`Address: ${addressLine1}`, 10, y);
    y += 6;
    doc.text(`City/Postcode: ${cityPostcode}`, 10, y);
    y += 6;
    doc.text(`Country: ${country}`, 10, y);
    y += 6;
    doc.text(`Phone: ${phone}`, 10, y);
    y += 10;

    // --- Items Table ---
    const headers = [['Product', 'Size', 'Qty', 'Price', 'Total']];
    const data = (order.items || []).map(item => [
        item.name,
        item.size,
        item.quantity,
        formatPrice(item.price),
        formatPrice(item.price * item.quantity)
    ]);

    // Use autoTable plugin
    if (typeof doc.autoTable === 'function') {
        doc.autoTable({
            startY: y,
            head: headers,
            body: data,
            theme: 'striped',
            headStyles: { fillColor: [220, 53, 69] }, 
            styles: { fontSize: 8, cellPadding: 2 }
        });
        y = doc.autoTable.previous.finalY + 10;
    } else {
        doc.text("Items: (Table could not be generated)", 10, y);
        y += 10;
    }
    
    // --- Summary Totals ---
    doc.setFontSize(12);
    doc.text(`Subtotal: ${formatPrice(subtotal)}`, 150, y);
    y += 6;
    doc.text(`Shipping: ${shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}`, 150, y);
    y += 8;
    
    doc.setFontSize(14);
    doc.setTextColor(220, 53, 69); // Red for Total
    doc.text(`Total Amount: ${formatPrice(totalAmount)}`, 150, y);
    y += 15;
    
    // --- Footer ---
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Thank you for shopping with The IR7 Football Shop!", 105, y, null, null, 'center');

    // Save the PDF and trigger download
    doc.save(`Receipt_Order_${order.orderId}.pdf`);
    
    showToast('Receipt download started!', 'success');
}
// =========================================================================
// III. CART DATA MANAGEMENT (CRUD)
// =========================================================================

/**
 * Updates the quantity of a specific item (by ID and size) in the cart.
 * Includes stock validation to prevent ordering more than available.
 * @param {number} productId - The ID of the product.
 * @param {string} size - The selected size of the product.
 * @param {number} newQuantity - The quantity requested by the user.
 */

function updateQuantity(productId, size, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    newQuantity = parseInt(newQuantity);

    // Find the product item in the cart
    const productItem = cart.find(item => item.id === productId && item.selectedSize === size);
    if (!productItem) {
        showToast('Error: Product not found in cart.', 'error');
        return;
    }

    // 1. Basic quantity check
    if (newQuantity < 1 || isNaN(newQuantity)) {
        newQuantity = 1;
    }

    // 2. Stock validation
    if (newQuantity > productItem.stock) {
        showToast(`Only ${productItem.stock} items available in stock. Quantity limited.`, 'warning');
        newQuantity = productItem.stock;
    }
    
    // Update the cart array with the new quantity
    const updatedCart = cart.map(item => {
        if (item.id === productId && item.selectedSize === size) {
            item.quantity = newQuantity;
        }
        return item;
    });

    localStorage.setItem('cart', JSON.stringify(updatedCart));
    renderCart(); // Re-render the cart immediately
    updateCartCount();
}

/**
 * Removes a specific item (identified by ID and size) from the cart.
 * @param {number} productId - The ID of the product.
 * @param {string} size - The selected size of the product.
 */
function removeItem(productId, size) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Filter out the specific item
    const updatedCart = cart.filter(item => !(item.id === productId && item.selectedSize === size));

    localStorage.setItem('cart', JSON.stringify(updatedCart));
    renderCart(); // Re-render the cart immediately
    updateCartCount();
    showToast('Item removed from cart.', 'success');
}


// =========================================================================
// IV. CART RENDERING
// =========================================================================

/**
 * Renders the cart items and the order summary on the cart.html page.
 */
function renderCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const container = document.getElementById('cart-items-container');
    const summary = document.getElementById('cart-summary');
    
    if (!container || !summary) {
        console.error("Cart container or summary element not found. Check cart.html IDs.");
        return; 
    }

    // --- Calculate Totals ---
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const freeShippingThreshold = 3000;
    const standardShippingFee = 110;
    const shippingFee = subtotal >= freeShippingThreshold ? 0 : standardShippingFee;
    const totalAmount = subtotal + shippingFee;

    // ----------------------------------------------------
    // Render Cart Items
    // ----------------------------------------------------
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info text-center py-5" role="alert">
                <i class="fas fa-info-circle fa-3x mb-3 text-primary"></i>
                <h4 class="alert-heading">Your cart is empty!</h4>
                <p>Looks like you haven't added anything to your cart yet. Time to explore our premium football gear.</p>
            </div>
            <p class="text-center mt-3"><a href="index.html#shop" class="btn btn-danger btn-lg"><i class="fas fa-store me-2"></i> Start Shopping</a></p>
        `;
    } else {
        container.innerHTML = cart.map(item => `
            <div class="card mb-3 shadow-sm border-light cart-item-card" data-product-id="${item.id}" data-size="${item.selectedSize}">
                <div class="row g-0 align-items-center">
                    <div class="col-md-3 col-4">
                        <img src="${getImageUrl(item.image)}" class="img-fluid rounded-start p-2" alt="${item.name}" loading="lazy">
                    </div>
                    <div class="col-md-9 col-8">
                        <div class="card-body py-2 px-3">
                            <h5 class="card-title mb-1 text-truncate">${item.name}</h5>
                            <p class="card-text mb-1 small text-muted">
                                Size: <span class="badge bg-secondary me-2">${item.selectedSize}</span>
                                Category: ${item.category}
                            </p>
                            <p class="card-text fw-bold mb-2 text-danger fs-5">
                                ${formatPrice(item.price)} <small class="text-muted fw-normal">x ${item.quantity}</small> 
                                = ${formatPrice(item.price * item.quantity)}
                            </p>
                            
                            <div class="d-flex align-items-center mb-2">
                                <label for="quantity-${item.id}-${item.selectedSize}" class="form-label me-2 small mb-0 fw-bold">Qty:</label>
                                <input type="number" class="form-control form-control-sm quantity-input me-3" 
                                       id="quantity-${item.id}-${item.selectedSize}"
                                       data-product-id="${item.id}"
                                       data-size="${item.selectedSize}"
                                       value="${item.quantity}" min="1" max="${item.stock || 99}" style="width: 70px;">
                                
                                <button class="btn btn-sm btn-outline-danger remove-from-cart" 
                                        data-product-id="${item.id}"
                                        data-size="${item.selectedSize}"
                                        title="Remove item">
                                    <i class="fas fa-trash"></i> <span class="d-none d-sm-inline">Remove</span>
                                </button>
                            </div>
                            <small class="text-success mt-1 d-block"><i class="fas fa-boxes me-1"></i>In Stock: ${item.stock}</small>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // ----------------------------------------------------
    // Render Cart Summary
    // ----------------------------------------------------
    summary.innerHTML = `
        <div class="card shadow-lg sticky-top" style="top: 85px;">
            <div class="card-header bg-danger text-white text-uppercase fw-bold fs-5">
                <i class="fas fa-receipt me-2"></i> Order Summary
            </div>
            <div class="card-body">
                <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">Subtotal (${cart.length} items):</span>
                    <span class="fw-bold">${formatPrice(subtotal)}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">Shipping Fee:</span>
                    <span class="fw-bold text-success">${shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}</span>
                </div>
                ${shippingFee > 0 ? `<p class="small text-muted mb-3"><i class="fas fa-truck-loading me-1"></i> Enjoy **FREE** shipping on orders over **${formatPrice(freeShippingThreshold)}**</p>` : ''}
                <hr>
                <div class="d-flex justify-content-between mb-3 fs-4">
                    <span class="fw-bold">Total Amount:</span>
                    <span class="fw-bold text-danger">${formatPrice(totalAmount)}</span>
                </div>
                <button class="btn btn-success btn-lg w-100" id="checkout-button" ${cart.length === 0 ? 'disabled' : ''} data-bs-toggle="modal" data-bs-target="#checkoutModal">
                    <i class="fas fa-arrow-right me-2"></i> Proceed to Checkout
                </button>
            </div>
            <div class="card-footer text-center bg-light">
                <small class="text-muted"><i class="fas fa-shield-alt me-1"></i>Secure checkout by IR7</small>
                <small class="text-muted d-block mt-1"><i class="fas fa-undo-alt me-1"></i>30-day return policy</small>
            </div>
        </div>
    `;

    // --- Attach Event Listeners ---
    attachCartEventListeners(totalAmount);
}

/**
 * Helper function to attach event listeners after cart rendering.
 * @param {number} totalAmount - The calculated final total amount for the order.
 */
function attachCartEventListeners(totalAmount) {
    // 1. Quantity change handler
    document.querySelectorAll('.quantity-input').forEach(input => {
        // Use remove/add pattern to prevent multiple listeners on re-render
        input.removeEventListener('change', handleQuantityChange);
        input.addEventListener('change', handleQuantityChange);
    });

    // 2. Remove item handler
    document.querySelectorAll('.remove-from-cart').forEach(button => {
        // Use remove/add pattern to prevent multiple listeners on re-render
        button.removeEventListener('click', handleRemoveItem);
        button.addEventListener('click', handleRemoveItem);
    });

    // 3. Checkout button handler (to initialize modal steps)
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
        // IMPORTANT: Use the modal's `show` event to run the initialization logic
        const checkoutModal = document.getElementById('checkoutModal');
        if (checkoutModal) {
            
            // Define a persistent handler function
            const checkoutModalShowHandler = function() {
                // Call the setup function when the modal is about to be shown
                setupCheckoutSteps(totalAmount);
            };
            
            // Remove previous handler to prevent duplicates
            checkoutModal.removeEventListener('show.bs.modal', checkoutModalShowHandler);
            
            // Attach the handler
            checkoutModal.addEventListener('show.bs.modal', checkoutModalShowHandler);
        }
    }
}

/**
 * Event handler for quantity input change.
 */
function handleQuantityChange(e) {
    const productId = parseInt(e.target.dataset.productId);
    const size = e.target.dataset.size;
    let newQuantity = parseInt(e.target.value);
    
    if (newQuantity < 1 || isNaN(newQuantity)) {
        newQuantity = 1;
        e.target.value = 1;
    }

    updateQuantity(productId, size, newQuantity);
}

/**
 * Event handler for remove button click.
 */
function handleRemoveItem(e) {
    const targetButton = e.target.closest('button');
    if (targetButton) {
        const productId = parseInt(targetButton.dataset.productId);
        const size = targetButton.dataset.size;
        // FIX: Removed confirm() to prevent blocking
        removeItem(productId, size);
    }
}


// =========================================================================
// V. CHECKOUT LOGIC (MULTI-STEP MODAL)
// =========================================================================

// Global variables to store checkout state
let shippingData = {};
let paymentMethod = 'COD'; // Default: Cash on Delivery
let finalTotalAmount = 0;

/**
 * Manages the transition, validation, and data rendering between checkout steps.
 * This is the main function called when the checkout button is clicked.
 * @param {number} totalAmount - The calculated final total amount for the order.
 */
function setupCheckoutSteps(totalAmount) {
    let currentStep = 1;
    const steps = ['step-shipping', 'step-payment', 'step-review', 'step-confirmation'];
    finalTotalAmount = totalAmount; // Store final amount globally

    // Helper to show the correct step content
    const showStep = (stepIndex) => {
        currentStep = stepIndex;
        steps.forEach((id, index) => {
            const stepElement = document.getElementById(id);
            if (stepElement) {
                // Ensure all steps are hidden first, and only the current one is shown
                stepElement.style.display = (index === stepIndex - 1) ? 'block' : 'none';
                // Remove the special confirmation styling if going back from step 4
                if (index !== 3) { 
                    stepElement.classList.remove('flex-column', 'align-items-center', 'text-center');
                }
                
                // Update modal title/progress
                const modalTitle = document.getElementById('checkoutModalLabel');
                if (modalTitle) {
                    modalTitle.textContent = `Checkout - Step ${stepIndex}: ${
                        stepIndex === 1 ? 'Shipping Details' : 
                        stepIndex === 2 ? 'Payment Method' : 
                        stepIndex === 3 ? 'Review & Place Order' : 'Order Confirmation'
                    }`;
                }
            }
        });
    };
    
    // Reset validation state on modal initialization
    document.getElementById('shipping-form')?.classList.remove('was-validated');

    // --- Step 1 (Shipping) Handlers ---
    document.getElementById('btn-continue-payment').onclick = () => {
        const form = document.getElementById('shipping-form');
        const phoneInput = document.getElementById('shipping-phone');
        const phone = phoneInput.value.trim();
        
        // Custom Phone Number Validation: 10-15 digits
        const phoneRegex = /^\d{10,15}$/;
        if (!phoneRegex.test(phone)) {
            phoneInput.setCustomValidity('Phone number must be 10-15 digits.');
        } else {
            phoneInput.setCustomValidity(''); // Validation passes
        }
        
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            showToast('Please fill out all required shipping fields correctly.', 'warning');
            return;
        }

        // Capture and store validated shipping data
        shippingData = {
            firstName: document.getElementById('shipping-first-name').value.trim(),
            lastName: document.getElementById('shipping-last-name').value.trim(),
            phone: phone,
            address: document.getElementById('shipping-address').value.trim(),
            // Assuming simplified address structure for now
            address1: document.getElementById('shipping-address').value.trim(),
            city: 'Dhaka', // Placeholder
            postcode: '1000', // Placeholder
            country: 'Bangladesh' // Placeholder
        };
        showStep(2);
    };

    // --- Step 2 (Payment) Handlers ---
    document.getElementById('btn-back-shipping').onclick = () => showStep(1);
    
    document.getElementById('btn-continue-review').onclick = () => {
        const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
        if (!selectedPayment) {
            showToast('Please select a payment method.', 'warning');
            return;
        }
        paymentMethod = selectedPayment.value;
        
        // Proceed to render the Review step and show it
        renderReviewStep();
        showStep(3);
    };

    // --- Step 3 (Review) Handlers ---
    document.getElementById('btn-back-payment').onclick = () => showStep(2);

    document.getElementById('btn-place-order').onclick = placeOrder;
    
    // Load existing user data to pre-fill shipping form on step 1
    loadShippingDefaults();
    
    // Initialize to the first step
    showStep(1);
}

/**
 * Pre-fills the shipping form with data from the currently logged-in user, if available.
 */
function loadShippingDefaults() {
    const currentUser = AuthSystem.getCurrentUser();
    if (currentUser) {
        document.getElementById('shipping-first-name').value = currentUser.firstName || '';
        document.getElementById('shipping-last-name').value = currentUser.lastName || '';
        document.getElementById('shipping-phone').value = currentUser.phone || '';
        // Note: Address is not stored in currentUser object (must be fetched from profile API)
    }
}

/**
 * Renders the shipping info and final order summary in the review step (Step 3).
 */
function renderReviewStep() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // 1. Render Shipping/Payment Info
    const shippingInfoHtml = `
        <h5 class="mb-3 text-primary"><i class="fas fa-truck me-2"></i> Shipping To:</h5>
        <p class="mb-1 fw-bold">${shippingData.firstName} ${shippingData.lastName}</p>
        <p class="mb-1"><i class="fas fa-map-marker-alt me-2 text-muted"></i> ${shippingData.address}</p>
        <p class="mb-3"><i class="fas fa-phone me-2 text-muted"></i> ${shippingData.phone}</p>
        
        <h5 class="mb-3 text-primary"><i class="fas fa-dollar-sign me-2"></i> Payment Method:</h5>
        <p class="mb-0 text-success fw-bold">${paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Online Payment (Simulated)'}</p>
    `;
    document.getElementById('review-shipping-info').innerHTML = shippingInfoHtml;

    // 2. Render Cart Items
    const itemsHtml = cart.map(item => `
        <li class="list-group-item d-flex justify-content-between align-items-center py-2">
            <span class="text-truncate" style="max-width: 70%;">
                ${item.name} 
                <small class="text-muted">(${item.selectedSize}) x ${item.quantity}</small>
            </span>
            <span class="fw-bold text-end">${formatPrice(item.price * item.quantity)}</span>
        </li>
    `).join('');
    document.getElementById('review-cart-items').innerHTML = itemsHtml;
    
    // 3. Render Final Order Summary
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = finalTotalAmount - subtotal;

    document.getElementById('review-order-summary').innerHTML = `
        <li class="list-group-item d-flex justify-content-between text-muted">
            <span>Subtotal:</span>
            <span>${formatPrice(subtotal)}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between text-muted">
            <span>Shipping:</span>
            <span class="text-success">${shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between fs-5 bg-light fw-bold text-danger">
            <span class="fw-bold">Total Payable:</span>
            <span>${formatPrice(finalTotalAmount)}</span>
        </li>
    `;
}

/**
 * Handles order submission to the server (via mock API), updates local storage, and shows confirmation.
 */
async function placeOrder() {
    const placeOrderButton = document.getElementById('btn-place-order');
    const originalButtonHtml = placeOrderButton.innerHTML;
    placeOrderButton.disabled = true;
    placeOrderButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span> Placing Order...';

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const currentUser = AuthSystem.getCurrentUser();
    
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = finalTotalAmount - subtotal;

    // --- CRITICAL FIX: Ensure the shipping address is a structured object on submit ---
    const shippingAddressObject = {
        address1: shippingData.address,
        phone: shippingData.phone,
        city: shippingData.city,
        postcode: shippingData.postcode,
        country: shippingData.country,
    };

    const orderData = {
        orderDate: new Date().toISOString(),
        customer: currentUser ? { 
            id: currentUser.id, 
            firstName: currentUser.firstName, 
            lastName: currentUser.lastName, 
            email: currentUser.email 
        } : { 
            id: 'guest-' + Date.now(),
            firstName: shippingData.firstName, 
            lastName: shippingData.lastName, 
            email: 'guest-' + Date.now() + '@ir7.com' // Placeholder for guests
        },
        shippingAddress: shippingAddressObject, // Sending structured object
        shippingPhone: shippingData.phone, // Sending phone number separately for easy access
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            size: item.selectedSize,
            quantity: item.quantity,
            price: item.price,
            category: item.category
        })),
        paymentMethod: paymentMethod,
        subtotal: subtotal,
        shippingFee: shippingFee,
        totalAmount: finalTotalAmount,
        status: 'pending' // Initial status
    };

    try {
        // --- API CALL (Mocked to rely on your /api/orders endpoint in server.js) ---
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to process order on server.');
        }

        const finalOrder = await response.json();

        // --- SUCCESS ACTIONS ---
        localStorage.removeItem('cart');
        updateCartCount();

        // Render confirmation step
        renderConfirmation(finalOrder); // This handles the UI transition
        
        showToast('🎉 Order Placed Successfully! Reloading cart content.', 'success');

    } catch (error) {
        console.error('Order Submission Error:', error);
        showToast(`Order failed: ${error.message}. Please check your server or connection.`, 'error');
        // Restore button state
        placeOrderButton.disabled = false;
        placeOrderButton.innerHTML = originalButtonHtml;
    }
}

/**
 * Renders the final confirmation step in the modal (Step 4).
 * This function also handles the UI transition to step 4.
 * @param {object} order - The final order object returned from the server.
 */
function renderConfirmation(order) {
    const confirmationStep = document.getElementById('step-confirmation');
    
    if (!confirmationStep) {
        console.error("Confirmation step container not found.");
        return;
    }

    // 1. Crucial step: Hide all other checkout steps explicitly to fix the blank screen issue.
    document.querySelectorAll('.checkout-step').forEach(step => {
        step.style.display = 'none';
    });
    
    // 2. Set the confirmation step to be visible and correctly styled.
    confirmationStep.style.display = 'flex'; 
    confirmationStep.classList.add('flex-column', 'align-items-center', 'text-center');

    // Update modal title
    const modalTitle = document.getElementById('checkoutModalLabel');
    if (modalTitle) {
        modalTitle.textContent = 'Checkout - Order Confirmation';
    }

    // CRITICAL DATA RETRIEVAL FIX: Safely retrieve and structure customer/shipping data
    const customer = order.customer || {};
    // Handle both object and string format for shippingAddress
    const shipping = (typeof order.shippingAddress === 'object' && order.shippingAddress !== null) 
                     ? order.shippingAddress 
                     : {};
    
    // Safely construct the name (prioritizing full name)
    const customerName = (customer.firstName && customer.lastName) ? 
                         `${customer.firstName} ${customer.lastName}` : 
                         customer.firstName || customer.lastName || (customer.email ? customer.email.split('@')[0] : 'Valued Customer');
                         
    // Safely get the phone number (prioritize nested field, then top-level field)
    const shippingPhone = shipping.phone || order.shippingPhone || 'N/A';
    
    // Safely get the email
    const customerEmail = customer.email || 'N/A';
    
    // Safely construct the full shipping address string for display
    const fullShippingAddress = [
        shipping.address1, 
        shipping.address, // Fallback for previous simple string saving
        shipping.city, 
        shipping.postcode, 
        shipping.country
    ].filter(Boolean).join(', ') || 'No Address Provided';


    confirmationStep.innerHTML = `
        <div class="p-4 border rounded shadow-sm w-100" style="max-width: 500px;">
            <h2 class="text-success mb-3"><i class="fas fa-check-circle fa-3x mb-2"></i></h2>
            <h3 class="mb-3">Order Confirmed, ${customerName}!</h3>
            <p class="lead">Your order **#${order.orderId}** has been successfully placed.</p>
            <p class="mb-4 text-muted small">We've sent a confirmation to **${customerEmail}** at phone number **${shippingPhone}**.</p>
            
            <ul class="list-group list-group-flush mb-4 text-start">
                <li class="list-group-item d-flex justify-content-between">
                    <span class="fw-bold">Order ID:</span>
                    <span class="text-primary">${order.orderId}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between">
                    <span class="fw-bold">Total Payable:</span>
                    <span class="fw-bold text-danger">${formatPrice(order.totalAmount)}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between flex-column align-items-start">
                    <span class="fw-bold">Shipping To:</span>
                    <span class="small text-muted">${fullShippingAddress}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between">
                    <span class="fw-bold">Payment Method:</span>
                    <span>${order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment (Simulated)'}</span>
                </li>
            </ul>

            <button class="btn btn-danger btn-lg mt-3" data-bs-dismiss="modal" onclick="window.location.href='index.html';">
                <i class="fas fa-home me-2"></i> Continue Shopping
            </button>
            <button class="btn btn-outline-primary mt-3 ms-2" id="btn-download-pdf" data-order-id="${order.orderId}">
                <i class="fas fa-file-download me-2"></i> Download Receipt
            </button>
        </div>
    `;
    
    // Handle PDF download
    const downloadButton = document.getElementById('btn-download-pdf');
    if (downloadButton) {
        // Attach the actual PDF generation handler
        downloadButton.addEventListener('click', () => generatePDFReceipt(order));
    }
    
    renderCart();
}
// =========================================================================
// VI. INITIALIZATION
// =========================================================================

/**
 * Ensures cart rendering runs only once and only on the cart page.
 */
function initializeCartPage() {
    // Check if the current page is cart.html
    if (window.location.pathname.endsWith('cart.html')) {
        renderCart();
    }
}

// Initialize cart page rendering when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeCartPage);

// Export key functions for use in other modules
export { renderCart, updateQuantity, removeItem, formatPrice, getImageUrl };