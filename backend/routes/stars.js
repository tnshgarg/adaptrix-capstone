const express = require('express');
const router = express.Router();
const Star = require('../models/Star');
const Adapter = require('../models/Adapter');
const authMiddleware = require('../middleware/auth');

// @route   POST /api/stars/:adapterId
// @desc    Star an adapter
// @access  Private
router.post('/:adapterId', authMiddleware, async (req, res) => {
  try {
    const { adapterId } = req.params;

    // Check if already starred
    const existingStar = await Star.findOne({
      userId: req.user._id,
      adapterId
    });

    if (existingStar) {
      return res.status(400).json({ error: 'Already starred this adapter' });
    }

    // Create star
    await Star.create({
      userId: req.user._id,
      adapterId
    });

    // Increment star count
    const adapter = await Adapter.findByIdAndUpdate(
      adapterId,
      { $inc: { starCount: 1 } },
      { new: true }
    );

    res.json({ message: 'Adapter starred', starCount: adapter.starCount });
  } catch (error) {
    console.error('Error starring adapter:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/stars/:adapterId
// @desc    Unstar an adapter
// @access  Private
router.delete('/:adapterId', authMiddleware, async (req, res) => {
  try {
    const { adapterId } = req.params;

    // Find and delete star
    const star = await Star.findOneAndDelete({
      userId: req.user._id,
      adapterId
    });

    if (!star) {
      return res.status(404).json({ error: 'Star not found' });
    }

    // Decrement star count
    const adapter = await Adapter.findByIdAndUpdate(
      adapterId,
      { $inc: { starCount: -1 } },
      { new: true }
    );

    res.json({ message: 'Adapter unstarred', starCount: adapter.starCount });
  } catch (error) {
    console.error('Error unstarring adapter:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/stars/check/:adapterId
// @desc    Check if user has starred an adapter
// @access  Private
router.get('/check/:adapterId', authMiddleware, async (req, res) => {
  try {
    const star = await Star.findOne({
      userId: req.user._id,
      adapterId: req.params.adapterId
    });

    res.json({ isStarred: !!star });
  } catch (error) {
    console.error('Error checking star:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
