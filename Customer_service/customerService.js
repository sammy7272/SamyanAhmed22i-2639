const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://Samyan:MJPbzim4rGra1tBZ@cluster72.pb0eh.mongodb.net/cafe_customers', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Service URLs from environment variables
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3001';

// Customer Schema
const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    loyaltyPoints: {
        type: Number,
        default: 0
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    orderCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastOrderDate: {
        type: Date
    }
});

const Customer = mongoose.model('Customer', customerSchema);

// POST new customer
app.post('/api/customers', async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        
        // Validate required fields
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }
        
        // Check if customer already exists
        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return res.status(409).json({ error: 'Customer with this email already exists' });
        }
        
        const newCustomer = new Customer({
            name,
            email,
            phone
        });
        
        const savedCustomer = await newCustomer.save();
        
        res.status(201).json({
            message: 'Customer created successfully',
            customer: savedCustomer
        });
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET all customers
app.get('/api/customers', async (req, res) => {
    try {
        const customers = await Customer.find().select('-__v');
        res.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET customer by ID
app.get('/api/customers/:customerId', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.customerId).select('-__v');
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(customer);
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET customer by email
app.get('/api/customers/email/:email', async (req, res) => {
    try {
        const customer = await Customer.findOne({ email: req.params.email }).select('-__v');
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(customer);
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET customer loyalty points
app.get('/api/customers/:customerId/points', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.customerId).select('name loyaltyPoints');
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json({
            customerId: customer._id,
            name: customer.name,
            loyaltyPoints: customer.loyaltyPoints
        });
    } catch (error) {
        console.error('Error fetching customer points:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET customer order history
app.get('/api/customers/:customerId/orders', async (req, res) => {
    try {
        // Fetch orders from order service
        const orderResponse = await axios.get(`${ORDER_SERVICE_URL}/api/orders/customer/${req.params.customerId}`);
        res.json(orderResponse.data);
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        res.status(500).json({ error: 'Error fetching customer orders' });
    }
});

// GET customer spending summary
app.get('/api/customers/:customerId/summary', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.customerId).select('name totalSpent orderCount loyaltyPoints lastOrderDate');
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        res.json({
            customerId: customer._id,
            name: customer.name,
            totalSpent: customer.totalSpent,
            orderCount: customer.orderCount,
            loyaltyPoints: customer.loyaltyPoints,
            lastOrderDate: customer.lastOrderDate
        });
    } catch (error) {
        console.error('Error fetching customer summary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT update customer
app.put('/api/customers/:customerId', async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        
        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.params.customerId,
            { name, email, phone },
            { new: true, runValidators: true }
        ).select('-__v');
        
        if (!updatedCustomer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        res.json({
            message: 'Customer updated successfully',
            customer: updatedCustomer
        });
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST update customer points (called by order service after order completion)
app.post('/api/customers/:customerId/points', async (req, res) => {
    try {
        const { points, orderAmount } = req.body;
        
        const customer = await Customer.findById(req.params.customerId);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        // Update loyalty points and total spent
        customer.loyaltyPoints += points;
        customer.totalSpent += orderAmount;
        customer.orderCount += 1;
        customer.lastOrderDate = new Date();
        
        await customer.save();
        
        res.json({
            message: 'Customer points updated successfully',
            customerId: customer._id,
            name: customer.name,
            loyaltyPoints: customer.loyaltyPoints,
            totalSpent: customer.totalSpent
        });
    } catch (error) {
        console.error('Error updating customer points:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
    console.log(`Customer service running on port ${PORT}`);
}); 