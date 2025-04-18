const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Service URLs from environment variables
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3001';
const MENU_SERVICE_URL = process.env.MENU_SERVICE_URL || 'http://localhost:3002';
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:3003';
const CUSTOMER_SERVICE_URL = process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3004';

// GET all menu items
app.get('/api/menu', async (req, res) => {
    try {
        const response = await axios.get(`${MENU_SERVICE_URL}/api/menu`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ error: 'Error fetching menu items' });
    }
});

// GET menu items by category
app.get('/api/menu/category/:category', async (req, res) => {
    try {
        const response = await axios.get(`${MENU_SERVICE_URL}/api/menu/category/${req.params.category}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching menu by category:', error);
        res.status(500).json({ error: 'Error fetching menu items by category' });
    }
});

// POST new order
app.post('/api/orders', async (req, res) => {
    try {
        // First check inventory availability
        const orderResponse = await axios.post(`${ORDER_SERVICE_URL}/api/orders`, req.body);
        
        // If order is created successfully, update inventory
        if (orderResponse.data && orderResponse.data.order) {
            await axios.post(`${INVENTORY_SERVICE_URL}/api/inventory/update`, {
                orderId: orderResponse.data.order._id
            });
        }
        
        res.status(201).json(orderResponse.data);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Error creating order' });
    }
});

// GET order by ID
app.get('/api/orders/:orderId', async (req, res) => {
    try {
        const response = await axios.get(`${ORDER_SERVICE_URL}/api/orders/${req.params.orderId}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Error fetching order' });
    }
});

// GET inventory status
app.get('/api/inventory', async (req, res) => {
    try {
        const response = await axios.get(`${INVENTORY_SERVICE_URL}/api/inventory`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Error fetching inventory' });
    }
});

// Customer endpoints
// GET all customers
app.get('/api/customers', async (req, res) => {
    try {
        const response = await axios.get(`${CUSTOMER_SERVICE_URL}/api/customers`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: 'Error fetching customers' });
    }
});

// GET customer by ID
app.get('/api/customers/:customerId', async (req, res) => {
    try {
        const response = await axios.get(`${CUSTOMER_SERVICE_URL}/api/customers/${req.params.customerId}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ error: 'Error fetching customer' });
    }
});

// GET customer by email
app.get('/api/customers/email/:email', async (req, res) => {
    try {
        const response = await axios.get(`${CUSTOMER_SERVICE_URL}/api/customers/email/${req.params.email}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching customer by email:', error);
        res.status(500).json({ error: 'Error fetching customer by email' });
    }
});

// GET customer loyalty points
app.get('/api/customers/:customerId/points', async (req, res) => {
    try {
        const response = await axios.get(`${CUSTOMER_SERVICE_URL}/api/customers/${req.params.customerId}/points`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching customer points:', error);
        res.status(500).json({ error: 'Error fetching customer points' });
    }
});

// GET customer order history
app.get('/api/customers/:customerId/orders', async (req, res) => {
    try {
        const response = await axios.get(`${CUSTOMER_SERVICE_URL}/api/customers/${req.params.customerId}/orders`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        res.status(500).json({ error: 'Error fetching customer orders' });
    }
});

// GET customer spending summary
app.get('/api/customers/:customerId/summary', async (req, res) => {
    try {
        const response = await axios.get(`${CUSTOMER_SERVICE_URL}/api/customers/${req.params.customerId}/summary`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching customer summary:', error);
        res.status(500).json({ error: 'Error fetching customer summary' });
    }
});

// POST new customer
app.post('/api/customers', async (req, res) => {
    try {
        const response = await axios.post(`${CUSTOMER_SERVICE_URL}/api/customers`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: 'Error creating customer' });
    }
});

// PUT update customer
app.put('/api/customers/:customerId', async (req, res) => {
    try {
        const response = await axios.put(`${CUSTOMER_SERVICE_URL}/api/customers/${req.params.customerId}`, req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ error: 'Error updating customer' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Main service is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Main service running on port ${PORT}`);
    console.log('Connected to:');
    console.log(`- Order Service: ${ORDER_SERVICE_URL}`);
    console.log(`- Menu Service: ${MENU_SERVICE_URL}`);
    console.log(`- Inventory Service: ${INVENTORY_SERVICE_URL}`);
    console.log(`- Customer Service: ${CUSTOMER_SERVICE_URL}`);
}); 