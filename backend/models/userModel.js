
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = mongoose.Schema({
    id: { type: String }, // Added ID field for frontend compatibility
    label: { type: String, required: true },
    street: { type: String, required: true },
    landmark: String,
    city: String,
    lga: { type: String, required: true },
    state: { type: String, required: true },
    phone: { type: String, required: true },
    zip: String
});

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    photoUrl: String,
    status: { type: String, default: 'Active' },
    phone: String,
    addresses: [addressSchema],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    isVerified: { type: Boolean, default: false },
    verificationToken: String
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
module.exports = User;
