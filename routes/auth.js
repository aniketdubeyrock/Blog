
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerificationToken,
  forgotPassword,
  resetPassword,
  getMe,
  updateMe,
  refreshToken,
  logoutUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post(
  '/register',
  body('username', 'Username is required').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  registerUser
);

router.post(
  '/login',
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists(),
  loginUser
);

router.get('/refresh', refreshToken);
router.post('/logout', logoutUser);

router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

module.exports = router;
