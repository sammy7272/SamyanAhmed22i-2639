const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://Samyan:MJPbzim4rGra1tBZ@cluster72.pb0eh.mongodb.net/cafe_inventory', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Service URLs from environment variables
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3001';
const MENU_SERVICE_URL = process.env.MENU_SERVICE_URL || 'http://localhost:3002';

// Inventory Schema
const inventorySchema = new mongoose.Schema({
    itemId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

const Inventory = mongoose.model('Inventory', inventorySchema);

// POST endpoint to update inventory based on order
app.post('/api/inventory/update', async (req, res) => {
    try {
        const { orderId } = req.body;
        
        // Fetch order details from order service
        const orderResponse = await axios.get(`${ORDER_SERVICE_URL}/api/orders/${orderId}`);
        const order = orderResponse.data;
        
        // Update inventory for each item in the order
        const updateResults = [];
        
        for (const item of order.items) {
            // Check if item exists in inventory
            let inventoryItem = await Inventory.findOne({ itemId: item.itemId });
            
            if (!inventoryItem) {
                // If item doesn't exist, fetch from menu service and create
                const menuResponse = await axios.get(`${MENU_SERVICE_URL}/api/menu/${item.itemId}`);
                const menuItem = menuResponse.data;
                
                inventoryItem = new Inventory({
                    itemId: item.itemId,
                    name: menuItem.name,
                    quantity: menuItem.stock
                });
            }
            
            // Check if enough stock is available
            if (inventoryItem.quantity < item.quantity) {
                return res.status(400).json({
                    error: `Insufficient stock for item: ${inventoryItem.name}`,
                    available: inventoryItem.quantity,
                    requested: item.quantity
                });
            }
            
            // Update quantity
            inventoryItem.quantity -= item.quantity;
            inventoryItem.lastUpdated = new Date();
            
            await inventoryItem.save();
            
            // Update menu service with new stock
            await axios.put(`${MENU_SERVICE_URL}/api/menu/${item.itemId}/stock`, {
                stock: inventoryItem.quantity
            });
            
            updateResults.push({
                itemId: item.itemId,
                name: inventoryItem.name,
                newQuantity: inventoryItem.quantity
            });
        }
        
        res.json({
            message: 'Inventory updated successfully',
            updates: updateResults
        });
    } catch (error) {
        console.error('Error updating inventory:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET inventory status
app.get('/api/inventory', async (req, res) => {
    try {
        const inventory = await Inventory.find();
        res.json(inventory);
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET inventory item by ID
app.get('/api/inventory/:itemId', async (req, res) => {
    try {
        const inventoryItem = await Inventory.findOne({ itemId: req.params.itemId });
        if (!inventoryItem) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }
        res.json(inventoryItem);
    } catch (error) {
        console.error('Error fetching inventory item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST to add new inventory item
app.post('/api/inventory', async (req, res) => {
    try {
        const { itemId, name, quantity } = req.body;
        
        // Validate required fields
        if (!itemId || !name || quantity === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const newInventoryItem = new Inventory({
            itemId,
            name,
            quantity
        });
        
        const savedItem = await newInventoryItem.save();
        
        res.status(201).json({
            message: 'Inventory item created successfully',
            item: savedItem
        });
    } catch (error) {
        console.error('Error creating inventory item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Inventory service running on port ${PORT}`);
}); 