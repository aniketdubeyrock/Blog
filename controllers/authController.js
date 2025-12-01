
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const sendEmail = require('../utils/email');
const { getVerificationEmailTemplate, getPasswordResetEmailTemplate } = require('../utils/emailTemplates');

// Generates a short-lived access token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '15m', // e.g., 15 minutes
    });
};

exports.registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
        const userExists = await User.findOne({ $or: [{ email }, { username }] });

        if (userExists) {
            return res.status(400).json({ message: 'User with that email or username already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            username,
            email,
            password: hashedPassword,
        });

        const verificationToken = user.createVerificationToken();
        await user.save();

        const verificationURL = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
        console.log(`Verification Token for ${email}:`, verificationToken);

        await sendEmail({
            email: user.email,
            subject: 'Email Verification',
            html: getVerificationEmailTemplate({ username: user.username, url: verificationURL })
        });

        res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

exports.loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Please verify your email to log in.' });
        }

        // Create Access Token
        const accessToken = generateToken(user._id);

        // Create Refresh Token
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        // Save refresh token to user in DB
        user.refreshToken = refreshToken;
        await user.save();

        // Send refresh token in secure, httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Send access token and user info
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: accessToken,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

exports.refreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
        return res.status(401).json({ message: 'Unauthorized, no refresh token' });
    }

    const refreshToken = cookies.refreshToken;

    try {
        const user = await User.findOne({ refreshToken }).select('+refreshToken');
        if (!user) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
            if (err || user._id.toString() !== decoded.id) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            const accessToken = generateToken(user._id);
            res.json({ token: accessToken });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.logoutUser = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
        return res.sendStatus(204); // No content
    }

    const refreshToken = cookies.refreshToken;

    // Is refreshToken in db?
    const user = await User.findOne({ refreshToken }).select('+refreshToken');
    if (user) {
        // Delete refreshToken in db
        user.refreshToken = undefined;
        await user.save();
    }

    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
    res.sendStatus(204);
};


exports.verifyEmail = async (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).json({ message: 'Token is required.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    try {
        const user = await User.findOne({
            verificationToken: hashedToken,
            verificationTokenExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during email verification' });
    }
};

exports.resendVerificationToken = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        if (user.isVerified) {
            return res.status(400).json({ message: 'Account already verified.' });
        }

        const verificationToken = user.createVerificationToken();
        await user.save();

        const verificationURL = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

        await sendEmail({
            email: user.email,
            subject: 'Email Verification',
            html: getVerificationEmailTemplate({ username: user.username, url: verificationURL })
        });

        res.status(200).json({ message: 'Verification email resent.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            // For security, don't reveal if user exists
            return res.status(200).json({ message: 'Password reset link sent to your email.' });
        }

        const resetToken = user.createPasswordResetToken();
        await user.save();

        const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

        await sendEmail({
            email: user.email,
            subject: 'Password Reset Request',
            html: getPasswordResetEmailTemplate({ username: user.username, url: resetURL })
        });

        res.status(200).json({ message: 'Password reset link sent to your email.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.resetPassword = async (req, res) => {
    const { token } = req.query;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    try {
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMe = async (req, res) => {
    res.status(200).json(req.user);
};

exports.updateMe = async (req, res) => {
    const { bio, profilePicture, socialLinks } = req.body;
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.bio = bio || user.bio;
            user.profilePicture = profilePicture || user.profilePicture;
            user.socialLinks = socialLinks || user.socialLinks;

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                bio: updatedUser.bio,
                profilePicture: updatedUser.profilePicture,
                socialLinks: updatedUser.socialLinks
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
