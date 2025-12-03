const express = require('express');
const router = express.Router();
const Adapter = require('../models/Adapter');

// @route   POST /api/adapters/:id/download
// @desc    Increment download count
// @access  Public
router.post('/:id/download', async (req, res) => {
  try {
    const adapter = await Adapter.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!adapter) {
      return res.status(404).json({ error: 'Adapter not found' });
    }

    res.json({ message: 'Download count updated', downloads: adapter.downloads });
  } catch (error) {
    console.error('Error updating download count:', error);
    res.status(500).json({ error: 'Failed to update download count' });
  }
});

module.exports = router;
