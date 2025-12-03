const mongoose = require('mongoose');
const { Schema } = mongoose;

const adapterVersionSchema = new Schema({
  version: { type: String, required: true },
  adapterId: { type: Schema.Types.ObjectId, ref: 'Adapter', required: true },
  changelog: { type: String },
}, {
  timestamps: true,
});

module.exports = mongoose.model('AdapterVersion', adapterVersionSchema);
