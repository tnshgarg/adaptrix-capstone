const express = require('express');
const router = express.Router();
const Adapter = require('../models/Adapter');
const Download = require('../models/Download');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [
      totalAdapters,
      totalDownloads,
      totalUsers,
      recentAdapters
    ] = await Promise.all([
      Adapter.countDocuments(),
      Download.countDocuments(),
      User.countDocuments(),
      Adapter.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('author', 'id name username avatar')
    ]);

    const formattedRecentAdapters = recentAdapters.map(adapter => ({
      ...adapter.toObject(),
      id: adapter._id.toString(),
      author: adapter.author ? {
        ...adapter.author.toObject(),
        id: adapter.author._id.toString()
      } : null,
      model: adapter.compatibleModels,
      _id: undefined,
      __v: undefined
    }));

    res.json({
      totalAdapters,
      totalDownloads,
      totalUsers,
      recentAdapters: formattedRecentAdapters
    });
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
