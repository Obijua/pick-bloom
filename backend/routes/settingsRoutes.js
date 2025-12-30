
const express = require('express');
const asyncHandler = require('express-async-handler');
const router = express.Router();

// In a real app, this would be a database model
let settings = {
    shippingCost: 1500,
    freeShippingThreshold: 50000,
    taxRate: 0,
    siteName: 'Farmers Market',
    supportEmail: 'support@farmersmarket.com',
    contactPhone: '+234 800 000 0000'
};

router.get('/', asyncHandler(async (req, res) => {
    res.json(settings);
}));

router.put('/', asyncHandler(async (req, res) => {
    settings = { ...settings, ...req.body };
    res.json(settings);
}));

module.exports = router;
