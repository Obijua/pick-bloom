
const mongoose = require('mongoose');

const vendorSchema = mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    rating: { type: Number, required: true, default: 0 },
    contactEmail: String,
    contactPhone: String
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const Vendor = mongoose.model('Vendor', vendorSchema);
module.exports = Vendor;
