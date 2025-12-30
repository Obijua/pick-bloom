
const express = require('express');
const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const Product = require('../models/productModel'); // Import Product model
const User = require('../models/userModel'); // Import User model
const { protect, admin } = require('../middleware/authMiddleware');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
router.post('/', protect, asyncHandler(async (req, res) => {
    const { items, total, customerName, paymentMethod, date, shippingAddress } = req.body;

    if (items && items.length === 0) {
        res.status(400);
        throw new Error('No order items');
    } else {
        // 1. Create the order
        const order = new Order({
            customerId: req.user._id,
            customerName,
            customerEmail: req.user.email,
            items: items.map(item => ({...item, product: item.id})),
            total,
            paymentMethod,
            date: date || new Date().toISOString().split('T')[0],
            shippingAddress
        });

        const createdOrder = await order.save();

        // 2. Deduct Stock from Products
        for (const item of items) {
            const product = await Product.findById(item.id);
            if (product) {
                const newStock = product.stock - item.quantity;
                product.stock = newStock > 0 ? newStock : 0;
                
                if (product.stock === 0) {
                    product.status = 'Out of Stock';
                } else if (product.stock < 5) {
                    product.status = 'Low Stock';
                }

                await product.save();
            }
        }

        // 3. Send Confirmation Email
        const userEmail = req.user.email;
        const itemsHtml = items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    <strong>${item.name}</strong><br>
                    <span style="font-size: 12px; color: #777;">${item.unit}</span>
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">₦${item.price.toLocaleString()}</td>
            </tr>
        `).join('');

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #143f17; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0; font-family: 'Georgia', serif;">Order Confirmed</h1>
                    <p style="margin: 5px 0 0;">Thank you for shopping with Farmers Market</p>
                </div>
                <div style="padding: 20px;">
                    <p>Hi <strong>${customerName}</strong>,</p>
                    <p>We've received your order and it's being processed. Here are the details:</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Order ID:</strong> ${createdOrder._id}</p>
                        <p style="margin: 5px 0 0;"><strong>Date:</strong> ${createdOrder.date}</p>
                        <p style="margin: 5px 0 0;"><strong>Payment Method:</strong> ${paymentMethod}</p>
                    </div>

                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f0f0f0; text-align: left;">
                                <th style="padding: 10px;">Img</th>
                                <th style="padding: 10px;">Product</th>
                                <th style="padding: 10px;">Qty</th>
                                <th style="padding: 10px;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>

                    <div style="margin-top: 20px; text-align: right;">
                        <h2 style="color: #143f17;">Total: ₦${total.toLocaleString()}</h2>
                    </div>

                    <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #999;">
                        <p>If you have any questions, reply to this email.</p>
                    </div>
                </div>
            </div>
        `;

        try {
            await sendEmail({
                email: userEmail,
                subject: `Order Confirmation #${createdOrder._id}`,
                message: `Thank you for your order #${createdOrder._id}. Total: ₦${total.toLocaleString()}`,
                html: emailHtml
            });
        } catch (error) {
            console.error("Failed to send order confirmation email:", error);
            // Don't fail the request if email fails, just log it
        }

        res.status(201).json(createdOrder);
    }
}));

// @desc    Get all orders
// @route   GET /api/orders
router.get('/', protect, asyncHandler(async (req, res) => {
    // If admin, return all. If user, return theirs.
    if (req.user.role === 'admin') {
        const orders = await Order.find({}).sort({ createdAt: -1 });
        res.json(orders);
    } else {
        const orders = await Order.find({ customerId: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    }
}));

// @desc    Track order public
// @route   GET /api/orders/:id/track
router.get('/:id/track', asyncHandler(async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            // Return only necessary info for public tracking
            res.json({
                id: order._id,
                status: order.status,
                date: order.date,
                total: order.total,
                items: order.items.length // Just the count for security
            });
        } else {
            res.status(404);
            throw new Error('Order not found');
        }
    } catch (error) {
        res.status(404);
        throw new Error('Order not found');
    }
}));

// @desc    Update order status (Admin)
// @route   PATCH /api/orders/:id/status
router.patch('/:id/status', protect, admin, asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
        const oldStatus = order.status;
        order.status = req.body.status;
        const updatedOrder = await order.save();

        // Send Email if status changes to Shipped
        if (req.body.status === 'Shipped' && oldStatus !== 'Shipped') {
            const user = await User.findById(order.customerId);
            if (user) {
                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                        <div style="background-color: #143f17; color: white; padding: 20px; text-align: center;">
                            <h1 style="margin: 0; font-family: 'Georgia', serif;">Your Order has Shipped!</h1>
                            <p style="margin: 5px 0 0;">Get ready for some fresh goodness.</p>
                        </div>
                        <div style="padding: 20px;">
                            <p>Hi <strong>${user.name}</strong>,</p>
                            <p>Good news! Your order <strong>#${order._id}</strong> has been shipped and is on its way to you.</p>
                            
                            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
                                <p style="font-size: 14px; color: #555;">Delivery Address:</p>
                                <p style="margin: 5px 0; font-weight: bold;">
                                    ${order.shippingAddress?.street}, ${order.shippingAddress?.city || ''}<br>
                                    ${order.shippingAddress?.lga}, ${order.shippingAddress?.state}
                                </p>
                            </div>

                            <p>Our delivery partner will contact you at <strong>${order.shippingAddress?.phone}</strong> when they are close.</p>

                            <div style="margin-top: 30px; text-align: center;">
                                <a href="${req.headers.origin || 'http://localhost:3000'}/#/contact" style="background-color: #143f17; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Track Order</a>
                            </div>
                        </div>
                    </div>
                `;

                try {
                    await sendEmail({
                        email: user.email,
                        subject: `Order Shipped #${order._id}`,
                        message: `Your order #${order._id} has been shipped!`,
                        html: emailHtml
                    });
                } catch (error) {
                    console.error("Failed to send shipping email:", error);
                }
            }
        }

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
}));

// @desc    Cancel order (User)
// @route   PUT /api/orders/:id/cancel
router.put('/:id/cancel', protect, asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        // Ensure only the owner or admin can cancel
        if (order.customerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
             res.status(401);
             throw new Error('Not authorized');
        }

        if (order.status !== 'Pending') {
            res.status(400);
            throw new Error('Cannot cancel order that is no longer pending');
        }

        order.status = 'Cancelled';
        
        // Restore stock logic
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock += item.quantity;
                // If it was out of stock or low stock, check if we should update status
                if (product.status === 'Out of Stock' && product.stock > 0) {
                    product.status = product.stock < 5 ? 'Low Stock' : 'Active';
                }
                await product.save();
            }
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
}));

module.exports = router;
