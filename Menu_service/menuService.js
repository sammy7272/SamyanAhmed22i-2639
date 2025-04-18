const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://Samyan:MJPbzim4rGra1tBZ@cluster72.pb0eh.mongodb.net/cafe_menu', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Menu Item Schema
const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['beverages', 'food', 'desserts', 'snacks']
    },
    description: {
        type: String,
        trim: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

// GET all menu items
app.get('/api/menu', async (req, res) => {
    try {
        const menuItems = await MenuItem.find();
        res.json(menuItems);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET menu item by ID
app.get('/api/menu/:itemId', async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.itemId);
        if (!menuItem) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        res.json(menuItem);
    } catch (error) {
        console.error('Error fetching menu item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET menu items by category
app.get('/api/menu/category/:category', async (req, res) => {
    try {
        const menuItems = await MenuItem.find({ 
            category: req.params.category,
            isAvailable: true
        });
        res.json(menuItems);
    } catch (error) {
        console.error('Error fetching menu items by category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST new menu item
app.post('/api/menu', async (req, res) => {
    try {
        const { name, price, stock, category, description } = req.body;
        
        // Validate required fields
        if (!name || !price || !stock || !category) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newMenuItem = new MenuItem({
            name,
            price,
            stock,
            category,
            description
        });

        const savedMenuItem = await newMenuItem.save();
        
        res.status(201).json({
            message: 'Menu item created successfully',
            item: savedMenuItem
        });
    } catch (error) {
        console.error('Error creating menu item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Menu service running on port ${PORT}`);
}); 