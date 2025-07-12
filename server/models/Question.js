const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [10000, 'Content cannot be more than 10000 characters']
  },
  images: [{
    type: String,
    trim: true
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [20, 'Tag cannot be more than 20 characters']
  }],
  votes: {
    type: Number,
    default: 0
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  language: {
    type: String,
    enum: ['en', 'hi'],
    required: true
  },
  isModerated: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isClosed: {
    type: Boolean,
    default: false
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  acceptedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for answer count
questionSchema.virtual('answerCount', {
  ref: 'Answer',
  localField: '_id',
  foreignField: 'question',
  count: true
});

// Virtual for answers (populated)
questionSchema.virtual('answers', {
  ref: 'Answer',
  localField: '_id',
  foreignField: 'question'
});

// Indexes for better performance
questionSchema.index({ title: 'text', content: 'text', tags: 'text' });
questionSchema.index({ author: 1, createdAt: -1 });
questionSchema.index({ language: 1, createdAt: -1 });
questionSchema.index({ votes: -1, createdAt: -1 });
questionSchema.index({ isPinned: 1, createdAt: -1 });
questionSchema.index({ isClosed: 1, createdAt: -1 });

// Pre-save middleware to ensure at least one tag
questionSchema.pre('save', function(next) {
  if (this.tags.length === 0) {
    return next(new Error('At least one tag is required'));
  }
  next();
});

// Method to increment views
questionSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to vote
questionSchema.methods.vote = function(userId, voteType) {
  const upvoteIndex = this.upvotes.indexOf(userId);
  const downvoteIndex = this.downvotes.indexOf(userId);

  // Remove existing votes
  if (upvoteIndex > -1) this.upvotes.splice(upvoteIndex, 1);
  if (downvoteIndex > -1) this.downvotes.splice(downvoteIndex, 1);

  // Add new vote
  if (voteType === 'up') {
    this.upvotes.push(userId);
  } else if (voteType === 'down') {
    this.downvotes.push(userId);
  }

  // Update vote count
  this.votes = this.upvotes.length - this.downvotes.length;
  
  return this.save();
};

// Method to follow/unfollow
questionSchema.methods.toggleFollow = function(userId) {
  const followerIndex = this.followers.indexOf(userId);
  
  if (followerIndex > -1) {
    this.followers.splice(followerIndex, 1);
  } else {
    this.followers.push(userId);
  }
  
  return this.save();
};

// Static method to get questions with filters
questionSchema.statics.getFilteredQuestions = function(filters = {}) {
  const {
    language,
    filter,
    page = 1,
    limit = 10,
    userId
  } = filters;

  let query = {};

  // Language filter
  if (language && language !== 'both') {
    query.language = language;
  }

  // Filter by type
  switch (filter) {
    case 'recent':
      query = { ...query };
      break;
    case 'popular':
      query.votes = { $gte: 10 };
      break;
    case 'trending':
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      query.$or = [
        { createdAt: { $gte: oneDayAgo } },
        { 'answers.createdAt': { $gte: oneDayAgo } }
      ];
      query.$and = [
        { $or: [{ votes: { $gt: 5 } }, { views: { $gt: 50 } }] }
      ];
      break;
    case 'unanswered':
      query.answerCount = 0;
      break;
    case 'answered':
      query.answerCount = { $gt: 0 };
      break;
    case 'my':
      if (userId) query.author = userId;
      break;
    case 'followed':
      if (userId) query.followers = userId;
      break;
  }

  // Sorting
  let sort = {};
  switch (filter) {
    case 'popular':
      sort = { votes: -1, createdAt: -1 };
      break;
    case 'trending':
      sort = { votes: -1, views: -1, createdAt: -1 };
      break;
    default:
      sort = { createdAt: -1 };
  }

  const skip = (page - 1) * limit;

  return this.find(query)
    .populate('author', 'name avatar reputation isVerified')
    .populate('answers')
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .exec();
};

module.exports = mongoose.model('Question', questionSchema); 