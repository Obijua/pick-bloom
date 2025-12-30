
const express = require('express');
const asyncHandler = require('express-async-handler');
const Vendor = require('../models/vendorModel');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Fetch all vendors
// @route   GET /api/vendors
router.get('/', asyncHandler(async (req, res) => {
    const vendors = await Vendor.find({});
    res.json(vendors);
}));

// @desc    Fetch single vendor
// @route   GET /api/vendors/:id
router.get('/:id', asyncHandler(async (req, res) => {
    const vendor = await Vendor.findById(req.params.id);
    if (vendor) {
        res.json(vendor);
    } else {
        res.status(404);
        throw new Error('Vendor not found');
    }
}));

// @desc    Create a vendor
// @route   POST /api/vendors
router.post('/', protect, admin, asyncHandler(async (req, res) => {
    const vendor = await Vendor.create(req.body);
    res.status(201).json(vendor);
}));

// @desc    Update a vendor
// @route   PUT /api/vendors/:id
router.put('/:id', protect, admin, asyncHandler(async (req, res) => {
    const vendor = await Vendor.findById(req.params.id);
    if (vendor) {
        Object.assign(vendor, req.body);
        const updatedVendor = await vendor.save();
        res.json(updatedVendor);
    } else {
        res.status(404);
        throw new Error('Vendor not found');
    }
}));

// @desc    Delete a vendor
// @route   DELETE /api/vendors/:id
router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
    const vendor = await Vendor.findById(req.params.id);
    if (vendor) {
        await vendor.deleteOne();
        res.json({ message: 'Vendor removed' });
    } else {
        res.status(404);
        throw new Error('Vendor not found');
    }
}));

module.exports = router;
