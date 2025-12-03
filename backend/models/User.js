const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  username: { type: String, unique: true, sparse: true },
  avatar: { type: String },
  bio: { type: String },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
