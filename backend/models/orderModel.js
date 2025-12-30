
const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String },
    items: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }
        }
    ],
    total: { type: Number, required: true },
    status: { type: String, required: true, default: 'Pending' },
    paymentMethod: { type: String, required: true },
    date: { type: String, required: true },
    shippingAddress: {
        label: String,
        street: String,
        landmark: String,
        city: String,
        lga: String,
        state: String,
        phone: String,
        zip: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
