
const express = require('express');
const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Fetch all products
// @route   GET /api/products
router.get('/', asyncHandler(async (req, res) => {
    const products = await Product.find({});
    res.json(products);
}));

// @desc    Fetch single product
// @route   GET /api/products/:id
router.get('/:id', asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
}));

// @desc    Create a product
// @route   POST /api/products
router.post('/', protect, admin, asyncHandler(async (req, res) => {
    const product = new Product(req.body);
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
}));

// @desc    Create new review
// @route   POST /api/products/:id/reviews
router.post('/:id/reviews', protect, asyncHandler(async (req, res) => {
    const { rating, comment, userName } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
        // Check if user already reviewed (Optional logic, currently allowing multiple)
        // const alreadyReviewed = product.reviewsList.find(r => r.user.toString() === req.user._id.toString())

        const review = {
            userName: userName || req.user.name,
            rating: Number(rating),
            comment,
            date: new Date().toISOString().split('T')[0]
        };

        product.reviewsList.push(review);

        product.reviews = product.reviewsList.length;
        
        // Recalculate Average
        product.rating = product.reviewsList.reduce((acc, item) => item.rating + acc, 0) / product.reviews;

        await product.save();
        res.status(201).json(product); // Return the updated product
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
}));

// @desc    Update a product
// @route   PUT /api/products/:id
router.put('/:id', protect, admin, asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        Object.assign(product, req.body);
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
}));

// @desc    Delete a product
// @route   DELETE /api/products/:id
router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
}));

module.exports = router;
