const express = require('express');
const router = express.Router();
const Star = require('../models/Star');
const Adapter = require('../models/Adapter');
const authMiddleware = require('../middleware/auth');

router.post('/:adapterId', authMiddleware, async (req, res) => {
  try {
    const { adapterId } = req.params;


    const existingStar = await Star.findOne({
      userId: req.user._id,
      adapterId
    });

    if (existingStar) {
      return res.status(400).json({ error: 'Already starred this adapter' });
    }


    await Star.create({
      userId: req.user._id,
      adapterId
    });


    const adapter = await Adapter.findByIdAndUpdate(
      adapterId,
      { $inc: { starCount: 1 } },
      { new: true }
    );

    res.json({ message: 'Adapter starred', starCount: adapter.starCount });
  } catch (error) {
    
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:adapterId', authMiddleware, async (req, res) => {
  try {
    const { adapterId } = req.params;


    const star = await Star.findOneAndDelete({
      userId: req.user._id,
      adapterId
    });

    if (!star) {
      return res.status(404).json({ error: 'Star not found' });
    }


    const adapter = await Adapter.findByIdAndUpdate(
      adapterId,
      { $inc: { starCount: -1 } },
      { new: true }
    );

    res.json({ message: 'Adapter unstarred', starCount: adapter.starCount });
  } catch (error) {
    
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/check/:adapterId', authMiddleware, async (req, res) => {
  try {
    const star = await Star.findOne({
      userId: req.user._id,
      adapterId: req.params.adapterId
    });

    res.json({ isStarred: !!star });
  } catch (error) {
    
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
