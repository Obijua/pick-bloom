
const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    userName: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    date: { type: String, required: true }
});

const productSchema = mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    unit: { type: String, required: true },
    rating: { type: Number, required: true, default: 0 },
    reviews: { type: Number, required: true, default: 0 },
    vendorId: { type: String, required: false }, // Changed to optional
    isSeasonal: { type: Boolean, default: false },
    status: { type: String, default: 'Active' },
    reviewsList: [reviewSchema]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
