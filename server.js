const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4000;

// Updated product data with sizes and image URLs
const products = [
    // Jerseys - 1299 Taka
    { 
        id: 1, 
        name: 'Manchester United Home Jersey 2024', 
        description: 'Official home jersey for the current season.', 
        price: 1299, 
        category: 'jerseys', 
        details: 'Available in S, M, L, XL. 100% Polyester. Authentic patch included.',
        image: 'public/images/products/manutd-jersey.jpg',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        hasSizes: true 
    },
    { 
        id: 2, 
        name: 'Real Madrid Away Jersey 2024', 
        description: 'Limited edition away jersey featuring sleek design.', 
        price: 1299, 
        category: 'jerseys', 
        details: 'Customizable with name and number. Climacool ventilation.',
        image: '/images/products/realmadrid-jersey.jpg',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        hasSizes: true
    },
    { 
        id: 3, 
        name: 'Barcelona Third Jersey 2024', 
        description: 'Special edition third jersey with unique design.', 
        price: 1299, 
        category: 'jerseys', 
        details: 'Regular fit. Premium edition. Official licensed product.',
        image: '/images/products/barcelona-jersey.jpg',
        sizes: ['S', 'M', 'L', 'XL'],
        hasSizes: true
    },
    { 
        id: 4, 
        name: 'Argentina National Jersey', 
        description: 'Official Argentina national team jersey.', 
        price: 1299, 
        category: 'jerseys', 
        details: 'Messi edition. Lightweight fabric. Moisture wicking.',
        image: '/images/products/argentina-jersey.jpg',
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
        image: '/images/products/nike-phantom-boots.jpg',
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
        image: '/images/products/adidas-predator-boots.jpg',
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
        image: '/images/products/puma-future-boots.jpg',
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
        image: '/images/products/adidas-champions-ball.jpg',
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
        image: '/images/products/nike-premier-ball.jpg',
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
        image: '/images/products/puma-match-ball.jpg',
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
        image: '/images/products/shin-guards.jpg',
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
        image: '/images/products/goalkeeper-gloves.jpg',
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
        image: '/images/products/football-socks.jpg',
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
        image: '/images/products/training-cones.jpg',
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
    
    // Simulate order processing
    setTimeout(() => {
        const orderId = 'IR7' + Date.now();
        res.json({ 
            success: true, 
            orderId: orderId,
            message: 'Order placed successfully!'
        });
    }, 2000);
});

app.listen(PORT, () => {
    console.log(`🚀 IR7 Football Shop Server running on http://localhost:${PORT}`);
    console.log(`📦 ${products.length} products loaded with BDT prices`);
    console.log('💰 Jerseys: ৳1,299 | Boots: ৳4,999 | Balls: ৳1,999 | Accessories: ৳499-৳1,499');
});