const mongoose = require('mongoose');
const { Schema } = mongoose;

const starSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  adapterId: { type: Schema.Types.ObjectId, ref: 'Adapter', required: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Star', starSchema);
