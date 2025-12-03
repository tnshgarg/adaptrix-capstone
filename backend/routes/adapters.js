const express = require('express');
const router = express.Router();
const Adapter = require('../models/Adapter');
const AdapterVersion = require('../models/AdapterVersion');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'adaptrix/adapters',
    resource_type: 'raw', // Use 'raw' for binary files like .safetensors
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      return `adapter-${uniqueSuffix}${ext}`;
    }
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB
  fileFilter: (req, file, cb) => {
    const allowedExts = ['.safetensors', '.bin', '.pth', '.pt', '.ckpt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only model files are allowed.'));
    }
  }
});

// @route   GET /api/adapters
// @desc    Get all adapters with filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, category, sort = 'popular', page = 1, limit = 10, authorId } = req.query;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (category) {
      query.category = category;
    }
    if (authorId) {
      query.authorId = authorId;
    }

    // Build sort option
    let sortOption = { downloads: -1 };
    if (sort === 'stars') sortOption = { starCount: -1 };
    if (sort === 'recent') sortOption = { createdAt: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const adapters = await Adapter.find(query)
      .populate('author', 'id name username avatar')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Adapter.countDocuments(query);

    const formattedAdapters = adapters.map(adapter => ({
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
      adapters: formattedAdapters,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching adapters:', error);
    res.status(500).json({ error: 'Failed to fetch adapters' });
  }
});

// @route   POST /api/adapters
// @desc    Create new adapter
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      category,
      tags = [],
      compatibleModels = [],
      version = '1.0.0',
      license = 'MIT',
      repository,
      readme,
      isPublic = true,
      fileUrl,
      fileName,
      cloudinaryId,
      size
    } = req.body;

    // Validation
    if (!name || !slug || !description || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check for existing slug
    const existingAdapter = await Adapter.findOne({ slug });
    if (existingAdapter) {
      return res.status(400).json({ error: 'Adapter with this slug already exists' });
    }

    // Create adapter
    const adapter = await Adapter.create({
      name,
      slug,
      description,
      category,
      tags,
      compatibleModels,
      version,
      license,
      repository,
      readme,
      isPublic,
      authorId: req.user._id,
      fileUrl,
      fileName,
      cloudinaryId,
      size
    });

    // Create initial version
    await AdapterVersion.create({
      version,
      adapterId: adapter._id,
      changelog: 'Initial release'
    });

    // Fetch with author populated
    const populatedAdapter = await Adapter.findById(adapter._id)
      .populate('author', 'id name username avatar');

    const formattedAdapter = {
      ...populatedAdapter.toObject(),
      id: populatedAdapter._id.toString(),
      author: populatedAdapter.author ? {
        ...populatedAdapter.author.toObject(),
        id: populatedAdapter.author._id.toString()
      } : null,
      model: populatedAdapter.compatibleModels,
      downloads: 0,
      stars: 0,
      reviews: 0,
      _id: undefined,
      __v: undefined
    };

    res.status(201).json({
      message: 'Adapter created successfully',
      adapter: formattedAdapter
    });
  } catch (error) {
    console.error('Error creating adapter:', error);
    res.status(500).json({ error: 'Failed to create adapter' });
  }
});

// @route   POST /api/adapters/upload
// @desc    Upload adapter file to Cloudinary
// @access  Private
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      message: 'File uploaded successfully to cloud storage',
      fileName: req.file.originalname,
      fileUrl: req.file.path, // Cloudinary URL
      cloudinaryId: req.file.filename, // Cloudinary public ID
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// @route   GET /api/adapters/:id
// @desc    Get single adapter
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    let adapter;
    // Try to find by ObjectId first
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      adapter = await Adapter.findById(id).populate('author', 'id name username avatar');
    }

    // If not found, try slug
    if (!adapter) {
      adapter = await Adapter.findOne({ slug: id }).populate('author', 'id name username avatar');
    }

    if (!adapter) {
      return res.status(404).json({ error: 'Adapter not found' });
    }

    const formattedAdapter = {
      ...adapter.toObject(),
      id: adapter._id.toString(),
      author: adapter.author ? {
        ...adapter.author.toObject(),
        id: adapter.author._id.toString()
      } : null,
      model: adapter.compatibleModels,
      _id: undefined,
      __v: undefined
    };

    res.json({ adapter: formattedAdapter });
  } catch (error) {
    console.error('Error fetching adapter:', error);
    res.status(500).json({ error: 'Failed to fetch adapter' });
  }
});

// @route   PUT /api/adapters/:id
// @desc    Update adapter
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const adapter = await Adapter.findById(req.params.id);

    if (!adapter) {
      return res.status(404).json({ error: 'Adapter not found' });
    }

    // Check ownership
    if (adapter.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedAdapter = await Adapter.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('author', 'id name username avatar');

    const formattedAdapter = {
      ...updatedAdapter.toObject(),
      id: updatedAdapter._id.toString(),
      author: updatedAdapter.author ? {
        ...updatedAdapter.author.toObject(),
        id: updatedAdapter.author._id.toString()
      } : null,
      model: updatedAdapter.compatibleModels,
      _id: undefined,
      __v: undefined
    };

    res.json({ adapter: formattedAdapter });
  } catch (error) {
    console.error('Error updating adapter:', error);
    res.status(500).json({ error: 'Failed to update adapter' });
  }
});

// @route   DELETE /api/adapters/:id
// @desc    Delete adapter
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const adapter = await Adapter.findById(req.params.id);

    if (!adapter) {
      return res.status(404).json({ error: 'Adapter not found' });
    }

    // Check ownership
    if (adapter.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Adapter.findByIdAndDelete(req.params.id);

    res.json({ message: 'Adapter deleted successfully' });
  } catch (error) {
    console.error('Error deleting adapter:', error);
    res.status(500).json({ error: 'Failed to delete adapter' });
  }
});

module.exports = router;
