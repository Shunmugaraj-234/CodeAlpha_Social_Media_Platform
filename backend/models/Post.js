const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  image: { type: String, default: '' },
  postType: { 
    type: String, 
    enum: ['text', 'image', 'poll', 'question', 'achievement', 'idea'], 
    default: 'text' 
  },
  mood: { 
    type: String, 
    enum: ['Happy', 'Excited', 'Curious', 'Motivated', 'Calm', 'Thoughtful', ''],
    default: '' 
  },
  hashtags: [{ type: String, index: true }],
  topic: { type: String, default: 'General', index: true },
  likesCount: { type: Number, default: 0 },
  reactions: {
    insightful: { type: Number, default: 0 },
    interesting: { type: Number, default: 0 },
    like: { type: Number, default: 0 },
    support: { type: Number, default: 0 },
    curious: { type: Number, default: 0 }
  },
  commentsCount: { type: Number, default: 0 },
  sharesCount: { type: Number, default: 0 },
  viewsCount: { type: Number, default: 12 },
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
  poll: {
    question: { type: String },
    options: [{
      optionText: String,
      votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }]
  },
  isDiscussion: { type: Boolean, default: false }
}, { timestamps: true });

postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
