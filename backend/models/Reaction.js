const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
  type: { 
    type: String, 
    enum: ['insightful', 'interesting', 'like', 'support', 'curious'],
    required: true 
  }
}, { timestamps: true });

reactionSchema.index({ user: 1, post: 1 }, { unique: true });

module.exports = mongoose.model('Reaction', reactionSchema);
