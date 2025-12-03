const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  adapterId: { type: Schema.Types.ObjectId, ref: 'Adapter', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Review', reviewSchema);
