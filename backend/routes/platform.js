const express = require('express');
const router = express.Router();
const Adapter = require('../models/Adapter');
const User = require('../models/User');

// @route   GET /api/platform/stats
// @desc    Get platform-wide statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const [totalAdapters, totalUsers, downloadStats] = await Promise.all([
      Adapter.countDocuments(),
      User.countDocuments(),
      Adapter.aggregate([
        {
          $group: {
            _id: null,
            totalDownloads: { $sum: '$downloads' }
          }
        }
      ])
    ]);

    const totalDownloads = downloadStats[0]?.totalDownloads || 0;

    res.json({
      totalAdapters,
      totalUsers,
      totalDownloads
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
