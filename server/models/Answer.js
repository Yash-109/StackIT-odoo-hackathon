const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
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
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
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
  isAccepted: {
    type: Boolean,
    default: false
  },
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for comment count
answerSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'answer',
  count: true
});

// Virtual for comments (populated)
answerSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'answer'
});

// Indexes for better performance
answerSchema.index({ question: 1, createdAt: -1 });
answerSchema.index({ author: 1, createdAt: -1 });
answerSchema.index({ votes: -1, createdAt: -1 });
answerSchema.index({ isAccepted: 1 });

// Method to vote
answerSchema.methods.vote = function(userId, voteType) {
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

// Method to accept answer
answerSchema.methods.accept = function() {
  this.isAccepted = true;
  return this.save();
};

// Method to unaccept answer
answerSchema.methods.unaccept = function() {
  this.isAccepted = false;
  return this.save();
};

// Pre-save middleware to update question's accepted answer
answerSchema.pre('save', async function(next) {
  if (this.isModified('isAccepted') && this.isAccepted) {
    // Unaccept all other answers for this question
    const Answer = mongoose.model('Answer');
    await Answer.updateMany(
      { question: this.question, _id: { $ne: this._id } },
      { isAccepted: false }
    );
    
    // Update question's accepted answer
    const Question = mongoose.model('Question');
    await Question.findByIdAndUpdate(
      this.question,
      { acceptedAnswer: this._id }
    );
  }
  next();
});

module.exports = mongoose.model('Answer', answerSchema); 