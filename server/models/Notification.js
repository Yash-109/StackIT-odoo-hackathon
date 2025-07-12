const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['answer', 'mention', 'comment', 'vote', 'follow', 'badge'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel',
    required: true
  },
  relatedModel: {
    type: String,
    enum: ['Question', 'Answer', 'Comment'],
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isEmailSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

// Static method to create notification
notificationSchema.statics.createNotification = function(data) {
  return this.create({
    type: data.type,
    title: data.title,
    message: data.message,
    user: data.userId,
    fromUser: data.fromUserId,
    relatedId: data.relatedId,
    relatedModel: data.relatedModel
  });
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({ user: userId })
    .populate('fromUser', 'name avatar')
    .populate('relatedId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = function(userId, notificationIds = null) {
  const query = { user: userId };
  if (notificationIds) {
    query._id = { $in: notificationIds };
  }
  
  return this.updateMany(query, { isRead: true });
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ user: userId, isRead: false });
};

module.exports = mongoose.model('Notification', notificationSchema); 