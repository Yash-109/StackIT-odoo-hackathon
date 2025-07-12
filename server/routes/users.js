const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('questionCount')
      .populate('answerCount');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
  body('language')
    .optional()
    .isIn(['en', 'hi'])
    .withMessage('Language must be either "en" or "hi"'),
  body('preferences.contentLanguage')
    .optional()
    .isIn(['en', 'hi', 'both'])
    .withMessage('Content language must be "en", "hi", or "both"'),
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Theme must be "light", "dark", or "auto"')
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

    const { name, avatar, language, preferences } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;
    if (language) updateData.language = language;
    if (preferences) {
      updateData.preferences = { ...req.user.preferences, ...preferences };
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('questionCount')
      .populate('answerCount');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/:id/questions
// @desc    Get questions by user
// @access  Public
router.get('/:id/questions', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const questions = await Question.find({ author: req.params.id })
      .populate('author', 'name avatar reputation isVerified')
      .populate('answers')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    const total = await Question.countDocuments({ author: req.params.id });

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
    console.error('Get user questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/:id/answers
// @desc    Get answers by user
// @access  Public
router.get('/:id/answers', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const answers = await Answer.find({ author: req.params.id })
      .populate('author', 'name avatar reputation isVerified')
      .populate('question', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    const total = await Answer.countDocuments({ author: req.params.id });

    res.json({
      success: true,
      data: answers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get user answers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/follow-tag
// @desc    Follow/unfollow a tag
// @access  Private
router.post('/follow-tag', [
  body('tag')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Tag must be between 1 and 20 characters')
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

    const { tag } = req.body;
    const user = await User.findById(req.user._id);

    const tagIndex = user.followedTags.indexOf(tag.toLowerCase());
    if (tagIndex > -1) {
      // Unfollow tag
      user.followedTags.splice(tagIndex, 1);
    } else {
      // Follow tag
      user.followedTags.push(tag.toLowerCase());
    }

    await user.save();

    res.json({
      success: true,
      message: tagIndex > -1 ? 'Tag unfollowed' : 'Tag followed',
      data: user.followedTags
    });
  } catch (error) {
    console.error('Follow tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/block-user
// @desc    Block/unblock a user
// @access  Private
router.post('/block-user', [
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID is required')
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

    const { userId } = req.body;

    // Check if user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Cannot block yourself
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot block yourself'
      });
    }

    const user = await User.findById(req.user._id);
    const blockIndex = user.blockedUsers.indexOf(userId);

    if (blockIndex > -1) {
      // Unblock user
      user.blockedUsers.splice(blockIndex, 1);
    } else {
      // Block user
      user.blockedUsers.push(userId);
    }

    await user.save();

    res.json({
      success: true,
      message: blockIndex > -1 ? 'User unblocked' : 'User blocked',
      data: user.blockedUsers
    });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 