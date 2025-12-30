
const express = require('express');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const { protect, admin } = require('../middleware/authMiddleware');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();

// @desc    Auth user & get token
// @route   POST /api/users/login
router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        // ALLOW LOGIN even if not verified, just check for Blocked status
        if (user.status === 'Blocked') {
            res.status(403);
            throw new Error('Your account has been suspended. Please contact support.');
        }

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            photoUrl: user.photoUrl,
            addresses: user.addresses,
            token: generateToken(user._id),
            isVerified: user.isVerified // Frontend uses this to show warning
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
}));

// @desc    Register a new user
// @route   POST /api/users
router.post('/', asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    const user = await User.create({
        name,
        email,
        password,
        photoUrl: `https://ui-avatars.com/api/?name=${name}&background=143f17&color=fff`,
        joinDate: new Date().toISOString().split('T')[0],
        isVerified: false,
        verificationToken
    });

    if (user) {
        // Send Verification Email
        const frontendUrl = req.headers.origin || 'http://localhost:3000';
        const verifyUrl = `${frontendUrl}/#/verify-email/${verificationToken}`;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #143f17; font-family: 'Georgia', serif;">Farmers Market</h1>
                </div>
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
                    <h2 style="color: #333;">Verify Your Email</h2>
                    <p style="color: #555; line-height: 1.6;">Hello ${name},</p>
                    <p style="color: #555; line-height: 1.6;">Welcome to Farmers Market! Please click the button below to verify your email address and activate your account.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verifyUrl}" style="background-color: #143f17; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Account</a>
                    </div>
                    <p style="color: #777; font-size: 12px; word-break: break-all;">Or paste this link: ${verifyUrl}</p>
                </div>
            </div>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Verify your FreshFarm Account',
                message: `Verify your account here: ${verifyUrl}`,
                html
            });
        } catch (error) {
            console.error("Verification email failed:", error);
        }

        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
            isVerified: false,
            message: 'Registration successful. Please check your email to verify account.',
            success: true
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
}));

// @desc    Resend Verification Email
// @route   POST /api/users/resend-verification
router.post('/resend-verification', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.isVerified) {
        res.status(400);
        throw new Error('Account already verified');
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    const frontendUrl = req.headers.origin || 'http://localhost:3000';
    const verifyUrl = `${frontendUrl}/#/verify-email/${verificationToken}`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #143f17; font-family: 'Georgia', serif;">Farmers Market</h1>
            </div>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
                <h2 style="color: #333;">Verify Your Email</h2>
                <p style="color: #555; line-height: 1.6;">Hello ${user.name},</p>
                <p style="color: #555; line-height: 1.6;">You requested a new verification link. Please click below to verify your email.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verifyUrl}" style="background-color: #143f17; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Account</a>
                </div>
                <p style="color: #777; font-size: 12px; word-break: break-all;">Or paste this link: ${verifyUrl}</p>
            </div>
        </div>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Verify your FreshFarm Account',
            message: `Verify your account here: ${verifyUrl}`,
            html
        });
        res.json({ message: 'Verification email sent' });
    } catch (error) {
        res.status(500);
        throw new Error('Email could not be sent');
    }
}));

// @desc    Verify Email
// @route   PUT /api/users/verify/:token
router.put('/verify/:token', asyncHandler(async (req, res) => {
    const { token } = req.params;
    
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired verification token');
    }

    user.isVerified = true;
    user.verificationToken = undefined; // Clear token
    await user.save();

    res.json({
        success: true,
        message: 'Email verified successfully',
        token: generateToken(user._id),
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            photoUrl: user.photoUrl,
            addresses: user.addresses,
            isVerified: true
        }
    });
}));

// @desc    Update user profile
// @route   PUT /api/users/:id
router.put('/:id', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (req.user._id.toString() !== user._id.toString() && req.user.role !== 'admin') {
            res.status(401);
            throw new Error('Not authorized to update this profile');
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.photoUrl = req.body.photoUrl || user.photoUrl;
        
        if (req.body.addresses) {
            user.addresses = req.body.addresses;
        }
        
        if (req.body.password) {
            user.password = req.body.password;
        }

        if (req.user.role === 'admin' && req.body.status) {
            user.status = req.body.status;
        }

        const updatedUser = await user.save();

        res.json({
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            photoUrl: updatedUser.photoUrl,
            addresses: updatedUser.addresses,
            token: generateToken(updatedUser._id),
            status: updatedUser.status,
            isVerified: updatedUser.isVerified
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
}));

// @desc    Forgot Password
// @route   POST /api/users/forgot-password
router.post('/forgot-password', asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Construct Reset URL
    const frontendUrl = req.headers.origin || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/#/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click on the link below to set a new password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #143f17; font-family: 'Georgia', serif;">Farmers Market</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p style="color: #555; line-height: 1.6;">Hello,</p>
          <p style="color: #555; line-height: 1.6;">You are receiving this email because a password reset request was initiated for your account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #f49f17; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #555; line-height: 1.6; font-size: 14px;">If the button above doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #777; font-size: 12px; word-break: break-all;">${resetUrl}</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email.</p>
        </div>
      </div>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Request - Farmers Market',
            message,
            html,
        });

        res.json({ success: true, data: 'Email sent' });
    } catch (error) {
        console.error(error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(500);
        throw new Error('Email could not be sent. Check server logs/SMTP settings.');
    }
}));

// @desc    Reset Password
// @route   PUT /api/users/reset-password/:token
router.put('/reset-password/:token', asyncHandler(async (req, res) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired token');
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
        success: true,
        token: generateToken(user._id)
    });
}));

// @desc    Get all users (Admin)
// @route   GET /api/users
router.get('/', protect, admin, asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
}));

module.exports = router;
