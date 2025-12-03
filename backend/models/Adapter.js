const mongoose = require('mongoose');
const { Schema } = mongoose;

const adapterSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  version: { type: String, default: '1.0.0' },
  category: { type: String, required: true },
  tags: { type: [String], default: [] },
  compatibleModels: { type: [String], default: [] },
  size: { type: String },
  license: { type: String, default: 'MIT' },
  repository: { type: String },
  readme: { type: String },
  fileName: { type: String },
  fileUrl: { type: String }, // Cloudinary URL
  cloudinaryId: { type: String }, // Cloudinary public ID for file management
  isPublic: { type: Boolean, default: true },
  downloads: { type: Number, default: 0 },
  starCount: { type: Number, default: 0 },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for author to enable populate
adapterSchema.virtual('author', {
  ref: 'User',
  localField: 'authorId',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('Adapter', adapterSchema);
