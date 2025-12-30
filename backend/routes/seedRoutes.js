/*
const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const Vendor = require('../models/vendorModel');
const products = require('../data/products');

const sampleVendors = [
  {
    name: 'Green Valley Organics',
    location: 'Kuje, FCT',
    rating: 4.9,
    image: 'https://picsum.photos/id/102/400/400',
    description: 'Certified organic family farm specializing in heirlooms.',
  },
  {
    name: 'Sunrise Dairy Farm',
    location: 'Gwagwalada, FCT',
    rating: 4.8,
    image: 'https://picsum.photos/id/108/400/400',
    description: 'Grass-fed dairy and free-range eggs.',
  },
  {
    name: 'Orchard Hill',
    location: 'Bwari, FCT',
    rating: 4.7,
    image: 'https://picsum.photos/id/292/400/400',
    description: 'Seasonal fruits, ciders, and homemade jams.',
  },
];

router.post('/', async (req, res) => {
  try {
    // Clear all existing data
    await Order.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await Vendor.deleteMany({});

    // Create Admin User
    await User.create({
      name: 'System Administrator',
      email: 'admin@farmersmarket.com',
      password: 'admin123',
      role: 'admin',
      photoUrl: 'https://ui-avatars.com/api/?name=Admin&background=000&color=fff',
      phone: '08000000000',
      status: 'Active',
      isVerified: true // Auto-verify admin
    });

    // Create Vendors
    const createdVendors = await Vendor.insertMany(sampleVendors);
    
    // Create Products (Assign them to random vendors)
    const sampleProducts = products.map((product) => {
      const randomVendor = createdVendors[Math.floor(Math.random() * createdVendors.length)];
      return { 
          ...product, 
          vendorId: randomVendor._id 
      };
    });

    await Product.insertMany(sampleProducts);

    res.json({ message: 'Database seeded successfully with Verified Users, Vendors, and Products!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Seeding failed', error: error.message });
  }
});

module.exports = router;
*/










const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const Vendor = require('../models/vendorModel');
const products = require('../data/products');

const sampleVendors = [
  {
    name: 'Green Valley Organics',
    location: 'Kuje, FCT',
    rating: 4.9,
    image: 'https://picsum.photos/id/102/400/400',
    description: 'Certified organic family farm specializing in heirlooms.',
  },
  {
    name: 'Sunrise Dairy Farm',
    location: 'Gwagwalada, FCT',
    rating: 4.8,
    image: 'https://picsum.photos/id/108/400/400',
    description: 'Grass-fed dairy and free-range eggs.',
  },
  {
    name: 'Orchard Hill',
    location: 'Bwari, FCT',
    rating: 4.7,
    image: 'https://picsum.photos/id/292/400/400',
    description: 'Seasonal fruits, ciders, and homemade jams.',
  },
];

router.post('/', async (req, res) => {
  try {
    // Basic Security: Check for a Seed Key in query parameter
    const providedKey = req.query.key;
    const masterKey = process.env.SEED_KEY || 'development_key';
    
    if (providedKey !== masterKey) {
        return res.status(401).json({ message: 'Unauthorized: Invalid Master Seed Key' });
    }

    // Clear all existing data
    await Order.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await Vendor.deleteMany({});

    // Create Admin User using Environment Variables
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@farmersmarket.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    await User.create({
      name: 'System Administrator',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      photoUrl: `https://ui-avatars.com/api/?name=Admin&background=000&color=fff`,
      phone: '08000000000',
      status: 'Active',
      isVerified: true
    });

    // Create Vendors
    const createdVendors = await Vendor.insertMany(sampleVendors);
    
    // Create Products (Assign them to random vendors)
    const sampleProducts = products.map((product) => {
      const randomVendor = createdVendors[Math.floor(Math.random() * createdVendors.length)];
      return { 
          ...product, 
          vendorId: randomVendor._id 
      };
    });

    await Product.insertMany(sampleProducts);

    res.json({ 
        message: 'Database initialized successfully!',
        admin: adminEmail
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Initialization failed', error: error.message });
  }
});

module.exports = router;
