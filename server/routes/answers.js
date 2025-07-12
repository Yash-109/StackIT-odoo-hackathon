const express = require('express');
const { body, validationResult } = require('express-validator');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Notification = require('../models/Notification');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/answers
// @desc    Create a new answer
// @access  Private
router.post('/', [
  body('content')
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Content must be between 10 and 10000 characters'),
  body('questionId')
    .isMongoId()
    .withMessage('Valid question ID is required'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
], authMiddleware, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { content, questionId, images = [] } = req.body;

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if question is closed
    if (question.isClosed) {
      return res.status(400).json({
        success: false,
        message: 'Cannot answer a closed question'
      });
    }

    // Check if user has already answered this question
    const existingAnswer = await Answer.findOne({
      question: questionId,
      author: req.user._id
    });

    if (existingAnswer) {
      return res.status(400).json({
        success: false,
        message: 'You have already answered this question'
      });
    }

    const answer = await Answer.create({
      content,
      images,
      author: req.user._id,
      question: questionId
    });

    await answer.populate('author', 'name avatar reputation isVerified');

    // Create notification for question author
    if (question.author.toString() !== req.user._id.toString()) {
      await Notification.createNotification({
        type: 'answer',
        title: 'New Answer',
        message: `${req.user.name} answered your question: "${question.title}"`,
        userId: question.author,
        fromUserId: req.user._id,
        relatedId: question._id,
        relatedModel: 'Question'
      });
    }

    // Create notifications for question followers
    const followers = question.followers.filter(followerId => 
      followerId.toString() !== req.user._id.toString()
    );

    for (const followerId of followers) {
      await Notification.createNotification({
        type: 'answer',
        title: 'New Answer on Followed Question',
        message: `${req.user.name} answered a question you follow: "${question.title}"`,
        userId: followerId,
        fromUserId: req.user._id,
        relatedId: question._id,
        relatedModel: 'Question'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Answer created successfully',
      data: answer
    });
  } catch (error) {
    console.error('Create answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/answers/:id
// @desc    Update an answer
// @access  Private (author only)
router.put('/:id', [
  body('content')
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Content must be between 10 and 10000 characters'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
], authMiddleware, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    // Check if user is the author
    if (answer.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this answer'
      });
    }

    const { content, images } = req.body;
    const updateData = {};

    if (content) updateData.content = content;
    if (images) updateData.images = images;

    const updatedAnswer = await Answer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name avatar reputation isVerified');

    res.json({
      success: true,
      message: 'Answer updated successfully',
      data: updatedAnswer
    });
  } catch (error) {
    console.error('Update answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/answers/:id
// @desc    Delete an answer
// @access  Private (author only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    // Check if user is the author
    if (answer.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this answer'
      });
    }

    await Answer.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Answer deleted successfully'
    });
  } catch (error) {
    console.error('Delete answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/answers/:id/vote
// @desc    Vote on an answer
// @access  Private
router.post('/:id/vote', [
  body('voteType')
    .isIn(['up', 'down'])
    .withMessage('Vote type must be either "up" or "down"')
], authMiddleware, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    const { voteType } = req.body;

    await answer.vote(req.user._id, voteType);

    // Create notification for upvote
    if (voteType === 'up' && answer.author.toString() !== req.user._id.toString()) {
      await Notification.createNotification({
        type: 'vote',
        title: 'Answer Upvoted',
        message: `${req.user.name} upvoted your answer`,
        userId: answer.author,
        fromUserId: req.user._id,
        relatedId: answer._id,
        relatedModel: 'Answer'
      });
    }

    await answer.populate('author', 'name avatar reputation isVerified');

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: answer
    });
  } catch (error) {
    console.error('Vote answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/answers/:id/accept
// @desc    Accept an answer (question author only)
// @access  Private
router.post('/:id/accept', authMiddleware, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    // Get the question to check if user is the author
    const question = await Question.findById(answer.question);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user is the question author
    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the question author can accept answers'
      });
    }

    await answer.accept();

    // Create notification for answer author
    if (answer.author.toString() !== req.user._id.toString()) {
      await Notification.createNotification({
        type: 'answer',
        title: 'Answer Accepted',
        message: `${req.user.name} accepted your answer to: "${question.title}"`,
        userId: answer.author,
        fromUserId: req.user._id,
        relatedId: question._id,
        relatedModel: 'Question'
      });
    }

    await answer.populate('author', 'name avatar reputation isVerified');

    res.json({
      success: true,
      message: 'Answer accepted successfully',
      data: answer
    });
  } catch (error) {
    console.error('Accept answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/answers/:id/unaccept
// @desc    Unaccept an answer (question author only)
// @access  Private
router.post('/:id/unaccept', authMiddleware, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    // Get the question to check if user is the author
    const question = await Question.findById(answer.question);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user is the question author
    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the question author can unaccept answers'
      });
    }

    await answer.unaccept();

    await answer.populate('author', 'name avatar reputation isVerified');

    res.json({
      success: true,
      message: 'Answer unaccepted successfully',
      data: answer
    });
  } catch (error) {
    console.error('Unaccept answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 