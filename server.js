const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 4000;

// Order storage file
const ORDERS_FILE = path.join(__dirname, 'orders.json');

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

// Updated product data with demo images
const products = [
    // Jerseys - 1299 Taka
    { 
        id: 1, 
        name: 'Manchester United Home Jersey 2025-26', 
        description: 'Official home jersey for the current season.', 
        price: 1299, 
        category: 'jerseys', 
        details: 'Available in S, M, L, XL. 100% Polyester. Authentic patch included.',
        image: '/images/products/manu.jpg',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        hasSizes: true 
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
        hasSizes: true
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
        hasSizes: true
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
        hasSizes: true
    },
    
    // Boots - 4999 Taka
    { 
        id: 5, 
        name: 'Nike Phantom GX Elite Boots', 
        description: 'Premium football boots with innovative grip technology.', 
        price: 4999, 
        category: 'boots', 
        details: 'Textured finish for better ball control. Dynamic Fit collar.',
        image: '/images/products/gx.jpg',
        sizes: ['6', '7', '8', '9', '10', '11'],
        hasSizes: true
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
        hasSizes: true
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
        hasSizes: true
    },
    
    // Balls - 1999 Taka
    { 
        id: 8, 
        name: 'Adidas Champions League Ball', 
        description: 'Official Champions League match ball.', 
        price: 1999, 
        category: 'balls', 
        details: 'Butylene bladder for best air retention. All-weather use. Size 5.',
        image: '/images/products/addball.jpg',
        sizes: ['Standard Size 5'],
        hasSizes: false
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
        hasSizes: false
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
        hasSizes: false
    },
    
    // Accessories - 500-2000 Taka
    { 
        id: 11, 
        name: 'Football Shin Guards', 
        description: 'Professional shin guards with ankle protection.', 
        price: 599, 
        category: 'accessories', 
        details: 'Lightweight polymer shell. Comfortable foam backing.',
        image: '/images/products/shin.jpg',
        sizes: ['One Size'],
        hasSizes: false
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
        hasSizes: true
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
        hasSizes: false
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
        hasSizes: false
    }
];

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(express.json());

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
        setTimeout(() => {
            res.json(product);
        }, 300);
    } else {
        console.log(`Product not found with ID: ${productId}`);
        res.status(404).json({ message: 'Product not found' });
    }
});

// API endpoint for placing orders
app.post('/api/orders', (req, res) => {
    const order = req.body;
    console.log('Received order:', order);
    
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
            setTimeout(() => {
                res.json({ 
                    success: true, 
                    orderId: orderId,
                    message: 'Order placed successfully!'
                });
            }, 1000);
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

// New endpoint to update order status
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

// Product management endpoints
app.post('/api/admin/products', (req, res) => {
    const newProduct = req.body;
    // Add product to products array
    products.push({ ...newProduct, id: products.length + 1 });
    res.json({ success: true, product: newProduct });
});

app.put('/api/admin/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const updatedProduct = req.body;
    
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
        products[index] = { ...products[index], ...updatedProduct };
        res.json({ success: true, product: products[index] });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

app.delete('/api/admin/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === productId);
    
    if (index !== -1) {
        products.splice(index, 1);
        res.json({ success: true });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 IR7 Football Shop Server running on http://localhost:${PORT}`);
    console.log(`📦 ${products.length} products loaded with BDT prices`);
    console.log('💰 Jerseys: ৳1,299 | Boots: ৳4,999 | Balls: ৳1,999 | Accessories: ৳499-৳1,499');
    console.log('👑 Admin panel available at /admin.html');
});