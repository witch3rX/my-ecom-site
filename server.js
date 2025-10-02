const express = require('express');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const app = express();
const PORT = process.env.PORT || 5000;

// Storage files
const ORDERS_FILE = path.join(__dirname, 'orders.json');
const CATEGORIES_FILE = path.join(__dirname, 'categories.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

// Email configuration
const emailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "your-email@gmail.com",
        pass: "your-app-password"
    }
});

// Helper function to read orders
function readOrders() {
    try {
        if (fs.existsSync(ORDERS_FILE)) {
            const data = fs.readFileSync(ORDERS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading orders file:', error);
    }
    return [];
}

// Helper function to write orders
function writeOrders(orders) {
    try {
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing orders file:', error);
        return false;
    }
}

// Helper function to read users
function readUsers() {
    try {
        if (fs.existsSync(USERS_FILE)) {
            const data = fs.readFileSync(USERS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading users file:', error);
    }
    return [];
}

// Helper function to write users
function writeUsers(users) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing users file:', error);
        return false;
    }
}

// Helper function to read categories
function readCategories() {
    try {
        if (fs.existsSync(CATEGORIES_FILE)) {
            const data = fs.readFileSync(CATEGORIES_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading categories file:', error);
    }
    // Return default categories if file doesn't exist
    return [
        { id: 1, name: 'jerseys', displayName: 'Jerseys', isActive: true },
        { id: 2, name: 'boots', displayName: 'Boots', isActive: true },
        { id: 3, name: 'balls', displayName: 'Balls', isActive: true },
        { id: 4, name: 'accessories', displayName: 'Accessories', isActive: true }
    ];
}

// Helper function to write categories
function writeCategories(categories) {
    try {
        fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing categories file:', error);
        return false;
    }
}

// Product persistence helper functions
function getInitialProducts() {
    return [
        {
            id: 1,
            name: 'Manchester United Home Jersey 2025-26',
            description: 'Official home jersey for the current season.',
            price: 1299,
            category: 'jerseys',
            details: 'Available in S, M, L, XL. 100% Polyester. Authentic patch included.',
            image: '/images/products/manu.jpg',
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            hasSizes: true,
            stock: 15,
            rating: 4.8,
            reviews: 23
        },
        {
            id: 2,
            name: 'Real Madrid Home Jersey 2025-26',
            description: 'Limited edition home jersey featuring sleek design.',
            price: 1299,
            category: 'jerseys',
            details: 'Customizable with name and number. Climacool ventilation.',
            image: '/images/products/rm.jpg',
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            hasSizes: true,
            stock: 8,
            rating: 4.9,
            reviews: 18
        },
        {
            id: 3,
            name: 'Barcelona Home Jersey 2025-26',
            description: 'Special edition home jersey with unique design.',
            price: 1299,
            category: 'jerseys',
            details: 'Regular fit. Premium edition. Official licensed product.',
            image: '/images/products/barca.jpg',
            sizes: ['S', 'M', 'L', 'XL'],
            hasSizes: true,
            stock: 0,
            rating: 4.7,
            reviews: 15
        },
        {
            id: 4,
            name: 'Brazil National Jersey',
            description: 'Official Brazil national team jersey.',
            price: 1299,
            category: 'jerseys',
            details: 'Messi edition. Lightweight fabric. Moisture wicking.',
            image: '/images/products/bra.jpg',
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            hasSizes: true,
            stock: 12,
            rating: 4.6,
            reviews: 31
        },
        {
            id: 5,
            name: 'Nike Phantom GX Elite Boots',
            description: 'Premium football boots with innovative grip technology.',
            price: 4999,
            category: 'boots',
            details: 'Textured finish for better ball control. Dynamic Fit collar.',
            image: '/images/products/gx.jpg',
            sizes: ['6', '7', '8', '9', '10', '11'],
            hasSizes: true,
            stock: 6,
            rating: 4.9,
            reviews: 42
        },
        {
            id: 6,
            name: 'Adidas Predator Elite Boots',
            description: 'Professional grade boots with enhanced grip and control.',
            price: 4999,
            category: 'boots',
            details: 'Hybridtouch upper for perfect fit. Controlskin technology.',
            image: '/images/products/add.jpg',
            sizes: ['6', '7', '8', '9', '10', '11'],
            hasSizes: true,
            stock: 4,
            rating: 4.8,
            reviews: 38
        },
        {
            id: 7,
            name: 'Puma Future Ultimate Boots',
            description: 'Advanced boots with adaptive fit technology.',
            price: 4999,
            category: 'boots',
            details: 'FUZIONFIT+ compression band. Dynamic Motion System outsole.',
            image: '/images/products/puma.jpg',
            sizes: ['6', '7', '8', '9', '10'],
            hasSizes: true,
            stock: 7,
            rating: 4.7,
            reviews: 29
        },
        {
            id: 8,
            name: 'Adidas Champions League Ball',
            description: 'Official Champions League match ball.',
            price: 1999,
            category: 'balls',
            details: 'Butylene bladder for best air retention. All-weather use. Size 5.',
            image: '/images/products/addball.jpg',
            sizes: ['Standard Size 5'],
            hasSizes: false,
            stock: 20,
            rating: 4.8,
            reviews: 56
        },
        {
            id: 9,
            name: 'Nike Premier League Flight Ball',
            description: 'Official Premier League match ball.',
            price: 1999,
            category: 'balls',
            details: 'Aerow Trac grooves for accurate flight. All conditions ball.',
            image: '/images/products/nikeball.jpg',
            sizes: ['Standard Size 5'],
            hasSizes: false,
            stock: 18,
            rating: 4.9,
            reviews: 47
        },
        {
            id: 10,
            name: 'Puma Official Match Ball',
            description: 'FIFA approved professional match ball.',
            price: 1999,
            category: 'balls',
            details: 'Low-absorption exterior. 32-panel design for reduced drag.',
            image: '/images/products/pumaball.jpg',
            sizes: ['Standard Size 5'],
            hasSizes: false,
            stock: 0,
            rating: 4.7,
            reviews: 33
        },
        {
            id: 11,
            name: 'Football Shin Guards',
            description: 'Professional shin guards with ankle protection.',
            price: 599,
            category: 'accessories',
            details: 'Lightweight polymer shell. Comfortable foam backing.',
            image: '/images/products/shin.jpg',
            sizes: ['One Size'],
            hasSizes: false,
            stock: 25,
            rating: 4.5,
            reviews: 22
        },
        {
            id: 12,
            name: 'Goalkeeper Gloves',
            description: 'Professional goalkeeper gloves with latex palm.',
            price: 1499,
            category: 'accessories',
            details: 'Negative cut. Finger protection spines. All-weather grip.',
            image: '/images/products/gk.jpg',
            sizes: ['S', 'M', 'L', 'XL'],
            hasSizes: true,
            stock: 14,
            rating: 4.6,
            reviews: 19
        },
        {
            id: 13,
            name: 'Football Socks',
            description: 'Professional football socks with cushioning.',
            price: 499,
            category: 'accessories',
            details: 'Moisture-wicking. Cushioned sole. Ankle support.',
            image: '/images/products/socks.jpg',
            sizes: ['One Size Fits All'],
            hasSizes: false,
            stock: 50,
            rating: 4.4,
            reviews: 28
        },
        {
            id: 14,
            name: 'Training Cones (Set of 10)',
            description: 'Bright orange training cones for practice.',
            price: 799,
            category: 'accessories',
            details: 'Durable plastic. Stackable design. Bright color for visibility.',
            image: '/images/products/cone.jpg',
            sizes: ['Standard Set'],
            hasSizes: false,
            stock: 30,
            rating: 4.3,
            reviews: 17
        }
    ];
}

function readProducts() {
    try {
        if (fs.existsSync(PRODUCTS_FILE)) {
            const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
            return JSON.parse(data);
        } else {
            const initialProducts = getInitialProducts();
            writeProducts(initialProducts);
            return initialProducts;
        }
    } catch (error) {
        console.error('Error reading products file, returning initial data:', error);
        return getInitialProducts();
    }
}

function writeProducts(products) {
    try {
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing products file:', error);
        return false;
    }
}

// Email sending function
async function sendOrderConfirmationEmail(order, customerEmail) {
    try {
        const mailOptions = {
            from: '"IR7 Football Shop" <noreply@ir7shop.com>',
            to: customerEmail,
            subject: `Order Confirmation - #${order.id}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc3545;">IR7 Football Shop</h2>
                    <h3>Order Confirmation</h3>
                    <p>Thank you for your order, ${order.customer.firstName}!</p>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h4>Order Details:</h4>
                        <p><strong>Order ID:</strong> ${order.id}</p>
                        <p><strong>Total Amount:</strong> ৳${order.totalAmount.toLocaleString()}</p>
                        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                        <p><strong>Estimated Delivery:</strong> 3-5 business days</p>
                    </div>
                    
                    <div style="margin-top: 20px;">
                        <h4>Shipping Address:</h4>
                        <p>${order.customer.address}</p>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                        <p>If you have any questions, contact us at:<br>
                        Email: iramridwan@gmail.com<br>
                        Phone: 01629377934</p>
                    </div>
                </div>
            `
        };

        console.log('Order confirmation email would be sent to:', customerEmail);
        console.log('Email content:', mailOptions.html);
        
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

// Load products once at startup from the file
let products = readProducts();

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(express.json());

// ==================== NEW: ADMIN AUTH MIDDLEWARE ====================
function requireAdminAuth(req, res, next) {
    // In a real app, you would check JWT token or session
    // For demo purposes, we'll allow all requests
    console.log('Admin route accessed:', req.path);
    next();
}

// Apply admin auth middleware to all admin routes
app.use('/api/admin', requireAdminAuth);
// ====================================================================

// API endpoint to get all categories
app.get('/api/categories', (req, res) => {
    const categories = readCategories();
    res.json(categories);
});

// API endpoint to get a single category by ID
app.get('/api/categories/:id', (req, res) => {
    const categoryId = parseInt(req.params.id);
    const categories = readCategories();
    const category = categories.find(c => c.id === categoryId);

    if (category) {
        res.json(category);
    } else {
        res.status(404).json({ message: 'Category not found' });
    }
});

// API endpoint to create a new category
app.post('/api/admin/categories', (req, res) => {
    const { name, displayName, isActive = true } = req.body;
    
    if (!name || !displayName) {
        return res.status(400).json({ message: 'Category name and display name are required' });
    }

    const categories = readCategories();
    
    // Check if category name already exists
    if (categories.find(c => c.name === name.toLowerCase())) {
        return res.status(400).json({ message: 'Category name already exists' });
    }

    const newCategory = {
        id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
        name: name.toLowerCase(),
        displayName,
        isActive
    };

    categories.push(newCategory);
    
    if (writeCategories(categories)) {
        res.json({ success: true, category: newCategory });
    } else {
        res.status(500).json({ message: 'Failed to save category' });
    }
});

// API endpoint to update a category
app.put('/api/admin/categories/:id', (req, res) => {
    const categoryId = parseInt(req.params.id);
    const { name, displayName, isActive } = req.body;

    const categories = readCategories();
    const categoryIndex = categories.findIndex(c => c.id === categoryId);

    if (categoryIndex === -1) {
        return res.status(404).json({ message: 'Category not found' });
    }

    categories[categoryIndex] = {
        ...categories[categoryIndex],
        name: name ? name.toLowerCase() : categories[categoryIndex].name,
        displayName: displayName || categories[categoryIndex].displayName,
        isActive: isActive !== undefined ? isActive : categories[categoryIndex].isActive
    };

    if (writeCategories(categories)) {
        res.json({ success: true, category: categories[categoryIndex] });
    } else {
        res.status(500).json({ message: 'Failed to update category' });
    }
});

// API endpoint to delete a category
app.delete('/api/admin/categories/:id', (req, res) => {
    const categoryId = parseInt(req.params.id);

    const categories = readCategories();
    const categoryIndex = categories.findIndex(c => c.id === categoryId);

    if (categoryIndex === -1) {
        return res.status(404).json({ message: 'Category not found' });
    }

    // Check if any product is using this category
    const productsInCategory = products.filter(p => p.category === categories[categoryIndex].name);
    if (productsInCategory.length > 0) {
        return res.status(400).json({ 
            message: 'Cannot delete category: there are products in this category' 
        });
    }

    categories.splice(categoryIndex, 1);
    
    if (writeCategories(categories)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ message: 'Failed to delete category' });
    }
});

// API endpoint to get all products with category filter
app.get('/api/products', (req, res) => {
    const { category } = req.query;
    console.log(`Fetching products for category: ${category}`);
    
    if (category && category !== 'all') {
        const filteredProducts = products.filter(product => product.category === category);
        console.log(`Found ${filteredProducts.length} products in ${category}`);
        res.json(filteredProducts);
    } else {
        console.log(`Found ${products.length} products in all categories`);
        res.json(products);
    }
});

// API endpoint to get a single product by ID
app.get('/api/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);

    if (product) {
        console.log(`Found product: ${product.name}`);
        res.json(product);
    } else {
        console.log(`Product not found with ID: ${productId}`);
        res.status(404).json({ message: 'Product not found' });
    }
});

// ==================== FIXED: PRODUCT MANAGEMENT ENDPOINTS ====================
// API endpoint to create a new product
app.post('/api/admin/products', (req, res) => {
    const newProductData = req.body;
    
    if (!newProductData.name || !newProductData.price || !newProductData.category) {
        return res.status(400).json({ message: 'Product name, price, and category are required' });
    }

    const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
    const newProduct = { 
        ...newProductData, 
        id: maxId + 1,
        stock: newProductData.stock || 10,
        rating: newProductData.rating || 4.0,
        reviews: newProductData.reviews || 0,
        hasSizes: newProductData.sizes && newProductData.sizes.length > 0
    };
    
    products.push(newProduct);
    
    if (writeProducts(products)) {
        res.json({ success: true, product: newProduct });
    } else {
        res.status(500).json({ message: 'Failed to save product' });
    }
});

// API endpoint to update a product
app.put('/api/admin/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const updatedProductData = req.body;
    
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
        products[index] = { 
            ...products[index], 
            ...updatedProductData, 
            id: productId,
            hasSizes: updatedProductData.sizes && updatedProductData.sizes.length > 0
        };
        
        if (writeProducts(products)) {
            res.json({ success: true, product: products[index] });
        } else {
            res.status(500).json({ message: 'Failed to update product' });
        }
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

// API endpoint to delete a product
app.delete('/api/admin/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === productId);
    
    if (index !== -1) {
        products.splice(index, 1);
        
        if (writeProducts(products)) {
            res.json({ success: true });
        } else {
            res.status(500).json({ message: 'Failed to delete product' });
        }
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});
// =============================================================================

// API endpoint for placing orders
app.post('/api/orders', async (req, res) => {
    const order = req.body;
    console.log('Received order:', order);

    if (!order.items || order.items.length === 0 || !order.customer.email) {
        return res.status(400).json({ success: false, message: 'Invalid order data. Missing items or customer information.' });
    }
    
    try {
        const orders = readOrders();
        const orderId = 'IR7' + Date.now();
        
        const newOrder = {
            id: orderId,
            ...order,
            status: 'pending',
            orderDate: new Date().toISOString(),
            processed: false
        };
        
        orders.push(newOrder);
        
        if (writeOrders(orders)) {
            // Update user order history if logged in
            const users = readUsers();
            const userIndex = users.findIndex(u => u.email === order.customer.email);
            if (userIndex !== -1) {
                if (!users[userIndex].orders) {
                    users[userIndex].orders = [];
                }
                users[userIndex].orders.push({
                    orderId: orderId,
                    date: newOrder.orderDate,
                    total: order.totalAmount,
                    status: 'pending'
                });
                writeUsers(users);
            }
            
            // Send email confirmation
            await sendOrderConfirmationEmail(newOrder, order.customer.email);
            
            res.json({ 
                success: true, 
                orderId: orderId,
                message: 'Order placed successfully! Please check your email for confirmation.'
            });
        } else {
            res.status(500).json({ 
                success: false, 
                message: 'Failed to save order' 
            });
        }
    } catch (error) {
        console.error('Order processing error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// ==================== NEW: ORDER STATUS UPDATE ENDPOINT ====================
app.put('/api/admin/orders/:orderId/status', (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: 'Status is required' });
    }

    const orders = readOrders();
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) {
        return res.status(404).json({ message: 'Order not found' });
    }
    
    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date().toISOString();
    
    if (writeOrders(orders)) {
        res.json({ success: true, order: orders[orderIndex] });
    } else {
        res.status(500).json({ message: 'Failed to update order status' });
    }
});
// ===========================================================================

// New endpoint to get user order history
app.get('/api/users/:email/orders', (req, res) => {
    const { email } = req.params;
    const orders = readOrders();
    const userOrders = orders.filter(order => order.customer.email === email);
    res.json(userOrders);
});

// New endpoint to get all orders (for admin)
app.get('/api/admin/orders', (req, res) => {
    try {
        const orders = readOrders();
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// New endpoint to update order
app.put('/api/admin/orders/:orderId', (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        
        const orders = readOrders();
        const orderIndex = orders.findIndex(order => order.id === orderId);
        
        if (orderIndex === -1) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        orders[orderIndex].status = status;
        orders[orderIndex].updatedAt = new Date().toISOString();
        
        if (writeOrders(orders)) {
            res.json({ success: true, order: orders[orderIndex] });
        } else {
            res.status(500).json({ message: 'Failed to update order' });
        }
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ==================== NEW: USER MANAGEMENT ENDPOINTS ====================
app.get('/api/admin/users', (req, res) => {
    try {
        const users = readUsers();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

app.delete('/api/admin/users/:userId', (req, res) => {
    const userId = req.params.userId;
    
    const users = readUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deleting admin users
    if (users[userIndex].email === 'admin@ir7.com') {
        return res.status(400).json({ message: 'Cannot delete admin user' });
    }
    
    users.splice(userIndex, 1);
    
    if (writeUsers(users)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ message: 'Failed to delete user' });
    }
});
// =========================================================================

// User registration endpoint
app.post('/api/users/register', (req, res) => {
    const userData = req.body;
    
    if (!userData.email || !userData.password || !userData.firstName) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const users = readUsers();
        
        if (users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
            return res.status(409).json({ message: 'User already exists with this email' });
        }

        const newUser = {
            id: Date.now().toString(),
            firstName: userData.firstName.trim(),
            lastName: userData.lastName?.trim() || '',
            email: userData.email.toLowerCase().trim(),
            password: userData.password,
            phone: userData.phone || '',
            createdAt: new Date().toISOString(),
            orders: []
        };

        users.push(newUser);

        if (writeUsers(users)) {
            const safeUser = { 
                id: newUser.id, 
                firstName: newUser.firstName, 
                lastName: newUser.lastName,
                email: newUser.email 
            };
            res.json({ success: true, user: safeUser });
        } else {
            res.status(500).json({ message: 'Failed to save user data' });
        }

    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).json({ message: 'Internal server error during registration' });
    }
});

// User login endpoint
app.post('/api/users/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const users = readUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        
        if (user) {
            const safeUser = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone
            };
            res.json({ success: true, user: safeUser });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error during user login:', error);
        res.status(500).json({ message: 'Internal server error during login' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 IR7 Football Shop Server running on http://localhost:${PORT}`);
    console.log(`📦 ${products.length} products loaded`);
    console.log('✅ Full CRUD operations enabled for Admin Panel!');
    console.log('🔧 Fixed endpoints:');
    console.log('   - Product CRUD operations');
    console.log('   - User management endpoints');
    console.log('   - Order status updates');
    console.log('   - Category management');
});