const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  banner: { type: String, default: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80' },
  icon: { type: String, default: '🚀' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  membersCount: { type: Number, default: 1 },
  postsCount: { type: Number, default: 0 },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Community', communitySchema);
