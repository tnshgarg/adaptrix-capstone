const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Adapter = require('../models/Adapter');
const authMiddleware = require('../middleware/auth');

// @route   POST /api/reviews
// @desc    Create a review
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { adapterId, rating, comment } = req.body;

    // Validation
    if (!adapterId || !rating) {
      return res.status(400).json({ error: 'Please provide adapterId and rating' });
    }

    // Check if adapter exists
    const adapter = await Adapter.findById(adapterId);
    if (!adapter) {
      return res.status(404).json({ error: 'Adapter not found' });
    }

    // Check if user already reviewed this adapter
    const existingReview = await Review.findOne({
      userId: req.user._id,
      adapterId
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this adapter' });
    }

    // Create review
    const review = await Review.create({
      userId: req.user._id,
      adapterId,
      rating,
      comment
    });

    // Populate user details
    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'id name username avatar');

    res.status(201).json(populatedReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/reviews/adapter/:adapterId
// @desc    Get reviews for an adapter
// @access  Public
router.get('/adapter/:adapterId', async (req, res) => {
  try {
    const reviews = await Review.find({ adapterId: req.params.adapterId })
      .sort({ createdAt: -1 })
      .populate('userId', 'id name username avatar');

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check ownership
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    review = await Review.findByIdAndUpdate(
      req.params.id,
      { rating, comment },
      { new: true }
    ).populate('userId', 'id name username avatar');

    res.json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check ownership
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
