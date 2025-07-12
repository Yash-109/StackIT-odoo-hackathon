const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Notification = require('../models/Notification');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/questions
// @desc    Get all questions with filters
// @access  Public
router.get('/', [
  query('filter').optional().isIn(['all', 'recent', 'popular', 'trending', 'unanswered', 'answered', 'my', 'followed']),
  query('language').optional().isIn(['en', 'hi', 'both']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('search').optional().trim()
], optionalAuthMiddleware, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { filter = 'all', language = 'both', page = 1, limit = 10, search } = req.query;
    const userId = req.user?._id;

    let query = {};

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Language filter
    if (language !== 'both') {
      query.language = language;
    }

    // Filter by type
    switch (filter) {
      case 'recent':
        // Default sorting by createdAt
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
        if (!userId) {
          return res.status(401).json({
            success: false,
            message: 'Authentication required'
          });
        }
        query.author = userId;
        break;
      case 'followed':
        if (!userId) {
          return res.status(401).json({
            success: false,
            message: 'Authentication required'
          });
        }
        query.followers = userId;
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

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const questions = await Question.find(query)
      .populate('author', 'name avatar reputation isVerified')
      .populate('answers')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    const total = await Question.countDocuments(query);

    res.json({
      success: true,
      data: questions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/questions/:id
// @desc    Get single question by ID
// @access  Public
router.get('/:id', optionalAuthMiddleware, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'name avatar reputation isVerified')
      .populate({
        path: 'answers',
        populate: {
          path: 'author',
          select: 'name avatar reputation isVerified'
        }
      })
      .populate('acceptedAnswer')
      .exec();

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Increment views if user is authenticated
    if (req.user) {
      await question.incrementViews();
    }

    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/questions
// @desc    Create a new question
// @access  Private
router.post('/', [
  body('title')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 20, max: 10000 })
    .withMessage('Content must be between 20 and 10000 characters'),
  body('tags')
    .isArray({ min: 1, max: 5 })
    .withMessage('At least 1 and maximum 5 tags are required'),
  body('tags.*')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters'),
  body('language')
    .isIn(['en', 'hi'])
    .withMessage('Language must be either "en" or "hi"'),
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

    const { title, content, tags, language, images = [] } = req.body;

    const question = await Question.create({
      title,
      content,
      tags: tags.map(tag => tag.toLowerCase()),
      language,
      images,
      author: req.user._id
    });

    await question.populate('author', 'name avatar reputation isVerified');

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: question
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/questions/:id
// @desc    Update a question
// @access  Private (author only)
router.put('/:id', [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 20, max: 10000 })
    .withMessage('Content must be between 20 and 10000 characters'),
  body('tags')
    .optional()
    .isArray({ min: 1, max: 5 })
    .withMessage('At least 1 and maximum 5 tags are required')
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

    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user is the author
    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this question'
      });
    }

    const { title, content, tags, images } = req.body;
    const updateData = {};

    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (tags) updateData.tags = tags.map(tag => tag.toLowerCase());
    if (images) updateData.images = images;

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name avatar reputation isVerified');

    res.json({
      success: true,
      message: 'Question updated successfully',
      data: updatedQuestion
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/questions/:id
// @desc    Delete a question
// @access  Private (author only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user is the author
    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this question'
      });
    }

    // Delete associated answers
    await Answer.deleteMany({ question: req.params.id });

    // Delete the question
    await Question.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/questions/:id/vote
// @desc    Vote on a question
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

    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const { voteType } = req.body;

    await question.vote(req.user._id, voteType);

    // Create notification for upvote
    if (voteType === 'up' && question.author.toString() !== req.user._id.toString()) {
      await Notification.createNotification({
        type: 'vote',
        title: 'Question Upvoted',
        message: `${req.user.name} upvoted your question: "${question.title}"`,
        userId: question.author,
        fromUserId: req.user._id,
        relatedId: question._id,
        relatedModel: 'Question'
      });
    }

    await question.populate('author', 'name avatar reputation isVerified');

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: question
    });
  } catch (error) {
    console.error('Vote question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/questions/:id/follow
// @desc    Follow/unfollow a question
// @access  Private
router.post('/:id/follow', authMiddleware, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    await question.toggleFollow(req.user._id);

    // Create notification for follow
    const isFollowing = question.followers.includes(req.user._id);
    if (isFollowing && question.author.toString() !== req.user._id.toString()) {
      await Notification.createNotification({
        type: 'follow',
        title: 'Question Followed',
        message: `${req.user.name} started following your question: "${question.title}"`,
        userId: question.author,
        fromUserId: req.user._id,
        relatedId: question._id,
        relatedModel: 'Question'
      });
    }

    await question.populate('author', 'name avatar reputation isVerified');

    res.json({
      success: true,
      message: isFollowing ? 'Question followed' : 'Question unfollowed',
      data: question
    });
  } catch (error) {
    console.error('Follow question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 