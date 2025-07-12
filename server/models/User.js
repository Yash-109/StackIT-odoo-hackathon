const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: function() { return !this.phone; }, // Email or phone is required
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: function() { return !this.email; }, // Email or phone is required
    unique: true,
    sparse: true,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  avatar: {
    type: String,
    default: function() {
      // Generate avatar URL based on name
      const name = this.name || 'User';
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=fff&size=200`;
    }
  },
  reputation: {
    type: Number,
    default: 0,
    min: [0, 'Reputation cannot be negative']
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  language: {
    type: String,
    enum: ['en', 'hi'],
    default: 'en'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    contentLanguage: {
      type: String,
      enum: ['en', 'hi', 'both'],
      default: 'both'
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    mentionNotifications: {
      type: Boolean,
      default: true
    },
    answerNotifications: {
      type: Boolean,
      default: true
    },
    followNotifications: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    }
  },
  followedTags: [{
    type: String,
    trim: true
  }],
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for question count
userSchema.virtual('questionCount', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'author',
  count: true
});

// Virtual for answer count
userSchema.virtual('answerCount', {
  ref: 'Answer',
  localField: '_id',
  foreignField: 'author',
  count: true
});

// Index for search
userSchema.index({ name: 'text', email: 'text' });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update last seen
userSchema.methods.updateLastSeen = function() {
  this.lastSeen = new Date();
  return this.save();
};

// Static method to find by email or phone
userSchema.statics.findByEmailOrPhone = function(emailOrPhone) {
  return this.findOne({
    $or: [
      { email: emailOrPhone },
      { phone: emailOrPhone }
    ]
  }).select('+password');
};

module.exports = mongoose.model('User', userSchema); 