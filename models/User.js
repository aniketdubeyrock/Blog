
const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  bio: String,
  profilePicture: String,
  socialLinks: {
    twitter: String,
    linkedin: String,
    github: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    select: false,
  },
  verificationTokenExpires: {
    type: Date,
    select: false,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  refreshToken: {
    type: String,
    select: false,
  }
}, { timestamps: true });

userSchema.methods.createVerificationToken = function() {
  const unhashedToken = crypto.randomBytes(32).toString('hex');

  this.verificationToken = crypto
    .createHash('sha256')
    .update(unhashedToken)
    .digest('hex');

  this.verificationTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return unhashedToken;
};

userSchema.methods.createPasswordResetToken = function() {
    const unhashedToken = crypto.randomBytes(32).toString('hex');
  
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(unhashedToken)
      .digest('hex');
  
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
    return unhashedToken;
};

module.exports = mongoose.model('User', userSchema);
