const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Samyan:MJPbzim4rGra1tBZ@cluster72.pb0eh.mongodb.net/cafe_payments';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Service URLs from environment variables
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3001';

// Payment Schema
const paymentSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        default: 'card' // Example
    },
    transactionId: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Payment = mongoose.model('Payment', paymentSchema);

// POST endpoint to process a payment
app.post('/api/payments/process', async (req, res) => {
    try {
        const { orderId, amount, paymentMethod } = req.body;
        
        if (!orderId || !amount) {
            return res.status(400).json({ error: 'Order ID and amount are required' });
        }

        // Simulate payment processing
        const isSuccess = Math.random() > 0.1; // 90% success rate
        const paymentStatus = isSuccess ? 'completed' : 'failed';
        const transactionId = isSuccess ? `txn_${Date.now()}` : null;

        let payment = await Payment.findOne({ orderId });

        if (payment) {
            // Update existing payment record if it was pending
            if (payment.status === 'pending') {
                payment.status = paymentStatus;
                payment.transactionId = transactionId;
                payment.paymentMethod = paymentMethod || payment.paymentMethod;
                payment.updatedAt = Date.now();
                await payment.save();
            } else {
                // Avoid reprocessing completed/failed payments
                return res.status(409).json({ message: `Payment for order ${orderId} already processed with status: ${payment.status}` });
            }
        } else {
            // Create new payment record
            payment = new Payment({
                orderId,
                amount,
                status: paymentStatus,
                paymentMethod: paymentMethod || 'card',
                transactionId
            });
            await payment.save();
        }

        // Optional: Update order status in Order Service if payment successful
        if (paymentStatus === 'completed') {
            try {
                // We need an endpoint in Order Service to update status, e.g., PUT /api/orders/:orderId/status
                // await axios.put(`${ORDER_SERVICE_URL}/api/orders/${orderId}/status`, { status: 'paid' });
                 console.log(`Payment for order ${orderId} completed. Order status update needed.`);
            } catch (orderUpdateError) {
                console.error(`Failed to update order status for ${orderId}:`, orderUpdateError.message);
                // Handle failure to update order status (e.g., log, retry mechanism)
            }
        }
        
        res.status(201).json({
            message: `Payment ${paymentStatus}`,
            payment: payment
        });

    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ error: 'Internal server error during payment processing' });
    }
});

// GET payment status by Order ID
app.get('/api/payments/order/:orderId', async (req, res) => {
    try {
        const payment = await Payment.findOne({ orderId: req.params.orderId });
        if (!payment) {
            return res.status(404).json({ error: 'Payment record not found for this order' });
        }
        res.json(payment);
    } catch (error) {
        console.error('Error fetching payment status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Payment service running on port ${PORT}`);
}); 