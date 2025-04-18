const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://Samyan:MJPbzim4rGra1tBZ@cluster72.pb0eh.mongodb.net/cafe_orders', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Order Schema
const orderSchema = new mongoose.Schema({
    customerId: {
        type: String,
        required: true
    },
    items: [{
        itemId: String,
        quantity: Number,
        price: Number
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Order = mongoose.model('Order', orderSchema);

// POST endpoint to create a new order
app.post('/api/orders', async (req, res) => {
    try {
        const { customerId, items, totalAmount } = req.body;
        
        // Validate required fields
        if (!customerId || !items || !totalAmount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create new order
        const newOrder = new Order({
            customerId,
            items,
            totalAmount
        });

        // Save order to database
        const savedOrder = await newOrder.save();
        
        res.status(201).json({
            message: 'Order created successfully',
            order: savedOrder
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET endpoint to retrieve an order by ID
app.get('/api/orders/:orderId', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        console.error('Error retrieving order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Order service running on port ${PORT}`);
}); 